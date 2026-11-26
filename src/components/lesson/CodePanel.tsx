import { useVirtualizer } from "@tanstack/react-virtual"
import { memo, useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { applyRoles, roleForRegions, type RoleMap } from "./roles"

/** Above this many lines the panel virtualizes rows instead of mounting the whole file. */
export const VIRTUALIZE_AT = 1500
const LINE_HEIGHT = 20

interface CodePanelProps {
  /** Trusted Shiki HTML from our own build. */
  html: string
  /**
   * Roles for the step being shown, or `null` to render plain code. A new map (new step, or
   * highlights just loaded) also scrolls the step's primary region into view.
   */
  roles: RoleMap | null
  label: string
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

export function CodePanel(props: CodePanelProps) {
  const lineCount = useMemo(() => props.html.match(/class="line"/g)?.length ?? 0, [props.html])
  return lineCount > VIRTUALIZE_AT ? <VirtualCode {...props} /> : <StaticCode {...props} />
}

/** Mounts the HTML once per example; React never touches it again after the first commit. */
const HtmlMount = memo(function HtmlMount({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />
})

function StaticCode({ html, roles, label }: CodePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (scrollRef.current) applyRoles(scrollRef.current, roles)
  }, [html, roles])

  useEffect(() => {
    const container = scrollRef.current
    const target = container?.querySelector<HTMLElement>('.line[data-role="primary"]')
    if (!container || !target) return
    const last = [...container.querySelectorAll<HTMLElement>('.line[data-role="primary"]')].at(-1)!
    const view = container.getBoundingClientRect()
    const top = target.getBoundingClientRect().top
    const bottom = last.getBoundingClientRect().bottom
    if (top >= view.top && bottom <= view.bottom) return
    container.scrollTo({
      top: container.scrollTop + (top - view.top) - view.height / 3,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    })
  }, [html, roles])

  return (
    <div
      ref={scrollRef}
      role="region"
      aria-label={label}
      className="mv-code h-full overflow-auto bg-(--shiki-background)"
    >
      <HtmlMount html={html} />
    </div>
  )
}

interface ParsedLine {
  line: string
  region: string
  inner: string
  length: number
}

function parseLines(html: string): ParsedLine[] {
  const template = document.createElement("template")
  template.innerHTML = html
  return [...template.content.querySelectorAll<HTMLElement>(".line")].map((el) => ({
    line: el.dataset.line ?? "",
    region: el.dataset.region ?? "",
    inner: el.innerHTML,
    length: el.textContent?.length ?? 0,
  }))
}

/** Long-file path: same markup and attributes per line, but only visible rows are mounted. */
function VirtualCode({ html, roles, label }: CodePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const lines = useMemo(() => parseLines(html), [html])
  const widthCh = useMemo(() => Math.max(0, ...lines.map((l) => l.length)) + 10, [lines])

  const virtualizer = useVirtualizer({
    count: lines.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => LINE_HEIGHT,
    overscan: 30,
  })

  // Rows mount and unmount while scrolling, so re-apply on every commit.
  useLayoutEffect(() => {
    if (scrollRef.current) applyRoles(scrollRef.current, roles)
  })

  useEffect(() => {
    const container = scrollRef.current
    if (!roles || !container) return
    const index = lines.findIndex((l) => roleForRegions(l.region, roles) === "primary")
    if (index === -1) return
    // Rows have a fixed height, so the target's offset is known without mounting it.
    const top = index * LINE_HEIGHT
    const { scrollTop, clientHeight } = container
    if (top >= scrollTop && top + LINE_HEIGHT <= scrollTop + clientHeight) return
    container.scrollTo({
      top: top - clientHeight / 3,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    })
  }, [lines, roles])

  return (
    <div
      ref={scrollRef}
      role="region"
      aria-label={label}
      className="mv-code h-full overflow-auto bg-(--shiki-background)"
    >
      <pre
        className="shiki css-variables"
        style={{ backgroundColor: "var(--shiki-background)", color: "var(--shiki-foreground)" }}
      >
        <code
          style={{
            position: "relative",
            display: "block",
            height: virtualizer.getTotalSize(),
            width: `max(100%, ${widthCh}ch)`,
          }}
        >
          {virtualizer.getVirtualItems().map((row) => {
            const line = lines[row.index]!
            return (
              <span
                key={row.index}
                className="line"
                data-line={line.line}
                data-region={line.region}
                style={{
                  position: "absolute",
                  insetInline: 0,
                  top: 0,
                  height: LINE_HEIGHT,
                  transform: `translateY(${row.start}px)`,
                }}
                dangerouslySetInnerHTML={{ __html: line.inner }}
              />
            )
          })}
        </code>
      </pre>
    </div>
  )
}
