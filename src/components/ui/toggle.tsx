import { Toggle as SdkToggle } from "@ui-sdk/react/toggle"
import type { ComponentProps } from "react"
import { cn } from "./cn"

type ToggleProps = Omit<ComponentProps<typeof SdkToggle>, "className"> & { className?: string }

export function Toggle({ className, ...props }: ToggleProps) {
  return (
    <SdkToggle
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-md border border-(--app-border) px-2 text-sm",
        "text-(--app-fg) outline-none hover:bg-(--app-hover) focus-visible:ring-2 focus-visible:ring-(--app-ring)",
        className,
      )}
      {...props}
    />
  )
}
