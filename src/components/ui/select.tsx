import {
  Select as SdkSelect,
  SelectContent as SdkSelectContent,
  SelectItem as SdkSelectItem,
  SelectItemIndicator,
  SelectTrigger as SdkSelectTrigger,
  SelectValue,
  type SelectProps,
} from "@ui-sdk/react/select"
import type { ComponentProps, ReactNode } from "react"
import { cn } from "./cn"

export { SelectValue }

export function Select(props: SelectProps<string, false>) {
  return <SdkSelect<string, false> {...props} />
}

type TriggerProps = Omit<ComponentProps<typeof SdkSelectTrigger>, "className" | "children"> & {
  className?: string
  children?: ReactNode
}

export function SelectTrigger({ className, children, ...props }: TriggerProps) {
  return (
    <SdkSelectTrigger
      className={cn(
        "inline-flex h-8 min-w-40 items-center justify-between gap-2 rounded-md border border-(--app-border)",
        "bg-(--app-surface) px-2.5 text-sm text-(--app-fg) outline-none hover:bg-(--app-hover)",
        "focus-visible:ring-2 focus-visible:ring-(--app-ring)",
        className,
      )}
      {...props}
    >
      {children}
      <span aria-hidden="true" className="text-(--app-muted)">
        ▾
      </span>
    </SdkSelectTrigger>
  )
}

type ContentProps = Omit<ComponentProps<typeof SdkSelectContent>, "className"> & {
  className?: string
}

export function SelectContent({ className, ...props }: ContentProps) {
  return (
    <SdkSelectContent
      sideOffset={4}
      className={cn(
        "min-w-(--anchor-width) rounded-lg border border-(--app-border) bg-(--app-surface) p-1 text-sm",
        "text-(--app-fg) shadow-lg",
        className,
      )}
      {...props}
    />
  )
}

type ItemProps = Omit<ComponentProps<typeof SdkSelectItem>, "className" | "children"> & {
  className?: string
  children?: ReactNode
}

export function SelectItem({ className, children, ...props }: ItemProps) {
  return (
    <SdkSelectItem
      className={cn(
        "flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 outline-none",
        "data-highlighted:bg-(--app-hover)",
        className,
      )}
      {...props}
    >
      {children}
      <SelectItemIndicator className="ms-auto">✓</SelectItemIndicator>
    </SdkSelectItem>
  )
}
