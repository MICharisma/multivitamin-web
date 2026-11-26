/** Artifact format versions this client knows how to highlight. */
export const SUPPORTED_MANIFEST_VERSION = 1
export const SUPPORTED_HIGHLIGHTS_VERSION = 1

export interface ExampleEntry {
  folder: string
  title: string
  /** Paths below are relative to the manifest's folder. */
  source: string
  html: string
  highlights?: string
  lesson?: string
  stepCount?: number
}

export interface FeatureEntry {
  folder: string
  feature: string
  title: string
  covers: string[]
  examples: ExampleEntry[]
}

export interface Manifest {
  formatVersion: number
  /** False when `formatVersion` is newer/unknown: render code only, skip lesson and highlights. */
  supported: boolean
  title: string
  language?: string
  repo?: string
  commit?: string
  builtAt?: string
  builder?: { name: string; version: string }
  features: FeatureEntry[]
}

export type Role = "primary" | "setup" | "result"

export interface StepRegion {
  /** Region name without the optional `file#` prefix. */
  name: string
  /** Source file the region lives in, when the lesson names one with `file#name`. */
  file?: string
  role: Role
}

export interface LessonStep {
  label: string
  api?: string
  regions: StepRegion[]
}

export interface Lesson {
  title?: string
  source?: string
  steps: LessonStep[]
}

export interface Span {
  startLine: number
  startColumn: number
  endLine: number
  endColumn: number
}

export interface Region {
  name: string
  startLine: number
  endLine: number
  focus?: Span
}

export interface Highlights {
  version: number
  supported: boolean
  /** Keyed by source file name, e.g. `inverter_briefing.rb`. */
  files: Record<string, { regions: Region[] }>
}

export interface FeatureInfo {
  feature: string
  title?: string
  covers: string[]
}
