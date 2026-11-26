import { useMemo } from "react"
import { useParams } from "react-router"
import { CodePanel } from "../components/lesson/CodePanel"
import { stepRoleMap } from "../components/lesson/roles"
import { StepList } from "../components/lesson/StepList"
import { useActiveStep } from "../components/lesson/useActiveStep"
import { ErrorNotice, Loading, Notice } from "../components/Status"
import { cn } from "../components/ui/cn"
import {
  findExample,
  useExampleHtml,
  useFeatureInfo,
  useHighlights,
  useLesson,
} from "../data/queries"
import {
  SUPPORTED_HIGHLIGHTS_VERSION,
  SUPPORTED_MANIFEST_VERSION,
  type ExampleEntry,
  type FeatureEntry,
} from "../data/types"
import { useMultivitamin } from "./MultivitaminLayout"
import { NotFound } from "./NotFound"

export function ExampleRoute() {
  const params = useParams()
  const { manifest } = useMultivitamin()
  const found = findExample(manifest, params.feature, params.example)
  if (!found) return <NotFound what={`example “${params.feature}/${params.example}”`} />
  // Keyed so preview state and scroll position reset per example.
  return <ExampleView key={`${found.feature.folder}/${found.example.folder}`} {...found} />
}

function ExampleView({ feature, example }: { feature: FeatureEntry; example: ExampleEntry }) {
  const { entry, manifest } = useMultivitamin()
  const ctx = { entry, manifest, example }
  const html = useExampleHtml(ctx)
  const lesson = useLesson(ctx)
  const highlights = useHighlights(ctx)
  const featureInfo = useFeatureInfo(entry, manifest, feature)

  const steps = lesson.data?.steps ?? []
  const { active, preview, shown, setActive, setPreview } = useActiveStep(steps.length)

  const highlightsUsable = manifest.supported && highlights.data?.supported === true
  const shownStep = steps[shown]
  const roles = useMemo(
    () => (highlightsUsable && shownStep ? stepRoleMap(shownStep, example.source) : null),
    [highlightsUsable, shownStep, example.source],
  )

  const covers = featureInfo.data?.covers.length ? featureInfo.data.covers : feature.covers
  const sourceName = example.source.slice(example.source.lastIndexOf("/") + 1)

  const notices: string[] = []
  if (!manifest.supported) {
    notices.push(
      `This catalog uses manifest format v${manifest.formatVersion}; this client understands v${SUPPORTED_MANIFEST_VERSION}. Showing code without lesson highlights.`,
    )
  } else {
    if (highlights.data && !highlights.data.supported) {
      notices.push(
        `highlights.json is format v${highlights.data.version}; this client understands v${SUPPORTED_HIGHLIGHTS_VERSION}. Showing code without highlights.`,
      )
    }
    if (highlights.isError) notices.push("Highlights could not be loaded. Showing code without highlights.")
    if (lesson.isError) notices.push("The lesson could not be loaded. Showing code only.")
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <aside className="flex max-h-[45vh] shrink-0 flex-col gap-4 overflow-y-auto border-b border-(--app-border) p-4 lg:max-h-none lg:w-96 lg:border-e lg:border-b-0">
        <div>
          <p className="text-xs font-medium tracking-wide text-(--app-muted) uppercase">{feature.title}</p>
          <h1 className="mt-1 text-lg leading-snug font-semibold">{example.title}</h1>
        </div>

        {notices.map((notice) => (
          <Notice key={notice}>{notice}</Notice>
        ))}

        {lesson.isLoading ? (
          <Loading>Loading lesson…</Loading>
        ) : steps.length > 0 ? (
          <section aria-labelledby="steps-heading" className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 id="steps-heading" className="text-sm font-semibold">
                Steps
              </h2>
              <RoleLegend />
            </div>
            <StepList
              steps={steps}
              active={active}
              preview={preview}
              onActiveChange={setActive}
              onPreviewChange={setPreview}
              highlights={highlightsUsable ? highlights.data : undefined}
              sourceFile={example.source}
            />
          </section>
        ) : null}

        {covers.length > 0 && (
          <section aria-labelledby="covers-heading">
            <h2 id="covers-heading" className="mb-2 text-sm font-semibold">
              Feature covers
            </h2>
            <ul className="flex flex-wrap gap-1">
              {covers.map((api) => (
                <li
                  key={api}
                  className={cn(
                    "rounded border border-(--app-border) px-1.5 py-0.5 font-mono text-[11px] text-(--app-muted)",
                    shownStep?.api === api && "border-(--mv-primary-bar) text-(--app-fg)",
                  )}
                >
                  {api}
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col" aria-label="Source">
        <div className="flex h-9 shrink-0 items-center border-b border-(--app-border) bg-(--app-surface) px-4 font-mono text-xs text-(--app-muted)">
          {sourceName}
        </div>
        <div className="min-h-0 flex-1">
          {html.isPending ? (
            <Loading>Loading source…</Loading>
          ) : html.isError ? (
            <ErrorNotice error={html.error} onRetry={() => void html.refetch()} />
          ) : (
            <CodePanel
              html={html.data}
              roles={roles}
              stepKey={`${shown}`}
              label={`Source of ${sourceName}`}
            />
          )}
        </div>
      </section>
    </div>
  )
}

function RoleLegend() {
  return (
    <ul className="flex gap-2 text-[11px] text-(--app-muted)" aria-label="Highlight legend">
      {(["primary", "setup", "result"] as const).map((role) => (
        <li key={role} className="flex items-center gap-1">
          <span className="mv-swatch inline-block size-3 rounded-sm" data-role={role} aria-hidden="true" />
          {role}
        </li>
      ))}
    </ul>
  )
}
