import type { Highlights, LessonStep, Role } from "../../data/types"
import { cn } from "../ui/cn"
import { Listbox, ListboxItem } from "../ui/listbox"

interface StepListProps {
  steps: LessonStep[]
  active: number
  preview: number | null
  onActiveChange: (index: number) => void
  onPreviewChange: (index: number | null) => void
  /** Used to show line ranges next to each step; optional. */
  highlights?: Highlights
  sourceFile: string
}

const ROLE_LABEL: Record<Role, string> = { primary: "primary", setup: "setup", result: "result" }

function lineRange(highlights: Highlights | undefined, sourceFile: string, step: LessonStep) {
  const primary = step.regions.find((r) => r.role === "primary")
  if (!highlights || !primary) return undefined
  const file = primary.file ?? sourceFile.slice(sourceFile.lastIndexOf("/") + 1)
  const region = highlights.files[file]?.regions.find((r) => r.name === primary.name)
  if (!region) return undefined
  return region.startLine === region.endLine
    ? `L${region.startLine}`
    : `L${region.startLine}–${region.endLine}`
}

/**
 * Lesson steps as a listbox with roving focus. Hovering or arrowing onto a step previews
 * it in the code panel; pressing / Enter / Space makes it the active step.
 */
export function StepList({
  steps,
  active,
  preview,
  onActiveChange,
  onPreviewChange,
  highlights,
  sourceFile,
}: StepListProps) {
  return (
    <Listbox
      aria-label="Lesson steps"
      activation="manual"
      value={active >= 0 ? String(active) : null}
      onValueChange={(value) => {
        if (value !== null) onActiveChange(Number(value))
      }}
      onHighlight={(value) => onPreviewChange(value === null ? null : Number(value))}
      onPointerLeave={() => onPreviewChange(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onPreviewChange(null)
        }
      }}
      className="flex flex-col gap-1.5"
    >
      {steps.map((step, index) => {
        const range = lineRange(highlights, sourceFile, step)
        const elsewhere = step.regions.filter((r) => r.file)
        return (
          <ListboxItem
            key={index}
            value={String(index)}
            label={step.label}
            onPointerEnter={() => onPreviewChange(index)}
            className={cn(
              "flex gap-3 p-3 transition-colors duration-200 motion-reduce:transition-none",
              "hover:bg-(--app-hover) data-selected:border-(--app-border) data-selected:bg-(--app-surface)",
              preview === index && "bg-(--app-hover)",
            )}
          >
            <span
              aria-hidden="true"
              className="mv-swatch flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums"
              data-role={index === active ? "primary" : undefined}
            >
              {index + 1}
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="text-sm leading-snug">{step.label}</span>
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-(--app-muted)">
                {step.api && <code className="font-mono text-(--app-fg)/80">{step.api}</code>}
                {range && <span className="tabular-nums">{range}</span>}
              </span>
              <span className="flex flex-wrap gap-1">
                {step.regions.map((region) => (
                  <span
                    key={`${region.file ?? ""}#${region.name}`}
                    className="mv-swatch rounded px-1.5 py-0.5 font-mono text-[11px]"
                    data-role={region.role}
                    title={`${ROLE_LABEL[region.role]} region${region.file ? ` in ${region.file}` : ""}`}
                  >
                    {region.name}
                  </span>
                ))}
              </span>
              {elsewhere.length > 0 && (
                <span className="text-xs text-(--app-muted)">
                  Also touches {[...new Set(elsewhere.map((r) => r.file))].join(", ")} (not shown).
                </span>
              )}
            </span>
          </ListboxItem>
        )
      })}
    </Listbox>
  )
}
