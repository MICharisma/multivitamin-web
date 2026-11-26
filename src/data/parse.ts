import {
  SUPPORTED_HIGHLIGHTS_VERSION,
  SUPPORTED_MANIFEST_VERSION,
  type ExampleEntry,
  type FeatureEntry,
  type FeatureInfo,
  type Highlights,
  type Lesson,
  type LessonStep,
  type Manifest,
  type Region,
  type Role,
  type StepRegion,
} from "./types"

export class ArtifactFormatError extends Error {
  override name = "ArtifactFormatError"
}

type Obj = Record<string, unknown>

const isObj = (value: unknown): value is Obj =>
  typeof value === "object" && value !== null && !Array.isArray(value)
const str = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined)
const num = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined
const arr = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

function expectObj(value: unknown, what: string): Obj {
  if (!isObj(value)) throw new ArtifactFormatError(`${what} is not a JSON object`)
  return value
}

function parseExample(raw: unknown): ExampleEntry | null {
  if (!isObj(raw)) return null
  const folder = str(raw.folder)
  const html = str(raw.html)
  if (!folder || !html) return null
  return {
    folder,
    html,
    title: str(raw.title) ?? folder,
    source: str(raw.source) ?? html.replace(/\.html$/, ""),
    highlights: str(raw.highlights),
    lesson: str(raw.lesson),
    stepCount: num(raw.stepCount),
  }
}

function parseFeature(raw: unknown): FeatureEntry | null {
  if (!isObj(raw)) return null
  const folder = str(raw.folder)
  if (!folder) return null
  return {
    folder,
    feature: str(raw.feature) ?? folder,
    title: str(raw.title) ?? folder,
    covers: arr(raw.covers).filter((c): c is string => typeof c === "string"),
    examples: arr(raw.examples)
      .map(parseExample)
      .filter((e): e is ExampleEntry => e !== null),
  }
}

/**
 * Parses `manifest.json`. An unknown `formatVersion` is not an error: we still read
 * whatever features/examples look valid and mark the manifest unsupported so the UI
 * falls back to plain code.
 */
export function parseManifest(json: unknown): Manifest {
  const root = expectObj(json, "manifest.json")
  const formatVersion = num(root.formatVersion) ?? 0
  const meta = isObj(root.multivitamin) ? root.multivitamin : {}
  const builder = isObj(root.builder) ? root.builder : undefined
  return {
    formatVersion,
    supported: formatVersion === SUPPORTED_MANIFEST_VERSION,
    title: str(meta.title) ?? str(meta.name) ?? "multivitamin",
    language: str(meta.language),
    repo: str(meta.repo),
    commit: str(root.commit),
    builtAt: str(root.builtAt),
    builder:
      builder && str(builder.name)
        ? { name: str(builder.name)!, version: str(builder.version) ?? "" }
        : undefined,
    features: arr(root.features)
      .map(parseFeature)
      .filter((f): f is FeatureEntry => f !== null),
  }
}

const ROLES: readonly Role[] = ["primary", "setup", "result"]

/** Splits a lesson region reference like `helper.rb#open-chat` into file and name. */
export function parseRegionRef(ref: string): { file?: string; name: string } {
  const hash = ref.indexOf("#")
  if (hash === -1) return { name: ref }
  return { file: ref.slice(0, hash) || undefined, name: ref.slice(hash + 1) }
}

function parseStep(raw: unknown): LessonStep | null {
  if (!isObj(raw)) return null
  const regions: StepRegion[] = []
  for (const r of arr(raw.regions)) {
    if (!isObj(r)) continue
    const ref = str(r.name)
    const role = str(r.role) as Role | undefined
    if (!ref || !role || !ROLES.includes(role)) continue
    regions.push({ ...parseRegionRef(ref), role })
  }
  return { label: str(raw.label) ?? "Untitled step", api: str(raw.api), regions }
}

export function parseLesson(json: unknown): Lesson {
  const root = expectObj(json, "lesson.json")
  return {
    title: str(root.title),
    source: str(root.source),
    steps: arr(root.steps)
      .map(parseStep)
      .filter((s): s is LessonStep => s !== null),
  }
}

function parseSpan(raw: unknown) {
  if (!isObj(raw)) return undefined
  const startLine = num(raw.startLine)
  const startColumn = num(raw.startColumn)
  const endLine = num(raw.endLine)
  const endColumn = num(raw.endColumn)
  if (startLine === undefined || startColumn === undefined) return undefined
  if (endLine === undefined || endColumn === undefined) return undefined
  return { startLine, startColumn, endLine, endColumn }
}

export function parseHighlights(json: unknown): Highlights {
  const root = expectObj(json, "highlights.json")
  const version = num(root.version) ?? 0
  const files: Highlights["files"] = {}
  if (isObj(root.files)) {
    for (const [file, entry] of Object.entries(root.files)) {
      if (!isObj(entry)) continue
      const regions: Region[] = []
      for (const r of arr(entry.regions)) {
        if (!isObj(r)) continue
        const name = str(r.name)
        const startLine = num(r.startLine)
        const endLine = num(r.endLine)
        if (!name || startLine === undefined || endLine === undefined) continue
        regions.push({ name, startLine, endLine, focus: parseSpan(r.focus) })
      }
      files[file] = { regions }
    }
  }
  return { version, supported: version === SUPPORTED_HIGHLIGHTS_VERSION, files }
}

export function parseFeatureInfo(json: unknown): FeatureInfo {
  const root = expectObj(json, "feature.json")
  return {
    feature: str(root.feature) ?? "",
    title: str(root.title),
    covers: arr(root.covers).filter((c): c is string => typeof c === "string"),
  }
}

/** The build prefixes its HTML with a UTF-8 BOM; strip it before mounting. */
export function cleanHtml(html: string): string {
  return html.replace(/^\uFEFF/, "")
}
