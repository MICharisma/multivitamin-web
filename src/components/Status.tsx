import type { ReactNode } from "react"
import { Button } from "./ui/button"

export function Loading({ children = "Loading…" }: { children?: ReactNode }) {
  return (
    <div role="status" className="p-6 text-sm text-(--app-muted)">
      {children}
    </div>
  )
}

export function ErrorNotice({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div role="alert" className="m-6 flex flex-col items-start gap-3 rounded-lg border border-(--app-border) bg-(--app-surface) p-4 text-sm">
      <p>{error instanceof Error ? error.message : "Something went wrong."}</p>
      {onRetry && <Button onClick={onRetry}>Retry</Button>}
    </div>
  )
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-(--app-border) bg-(--app-surface) px-3 py-2 text-xs text-(--app-muted)">
      {children}
    </p>
  )
}
