import { Button as SdkButton } from "@ui-sdk/react/button"
import type { ComponentProps } from "react"
import { cn } from "./cn"

type ButtonProps = Omit<ComponentProps<typeof SdkButton>, "className"> & {
  className?: string
  variant?: "default" | "ghost"
}

const variants = {
  default:
    "border border-(--app-border) bg-(--app-surface) hover:bg-(--app-hover) data-pressed:bg-(--app-hover)",
  ghost: "hover:bg-(--app-hover)",
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <SdkButton
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm text-(--app-fg) outline-none",
        "focus-visible:ring-2 focus-visible:ring-(--app-ring) data-disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
