import { Listbox as SdkListbox, ListboxItem as SdkListboxItem } from "@ui-sdk/react/listbox"
import type { ComponentProps, FocusEventHandler, PointerEventHandler, ReactNode } from "react"
import { cn } from "./cn"

interface ListboxProps {
  "aria-label"?: string
  value: string | null
  onValueChange?: (value: string | null) => void
  /** Keyboard focus moved to an option (`null` when focus leaves the list). */
  onHighlight?: (value: string | null) => void
  activation?: "automatic" | "manual"
  onPointerLeave?: PointerEventHandler<HTMLDivElement>
  onBlur?: FocusEventHandler<HTMLDivElement>
  className?: string
  children: ReactNode
}

/** Single-select listbox with roving focus (one Tab stop, arrow keys move between options). */
export function Listbox({ className, value, onValueChange, onHighlight, ...props }: ListboxProps) {
  return (
    <SdkListbox<string, false>
      value={value}
      onValueChange={(next) => onValueChange?.(next)}
      onHighlight={(next) => onHighlight?.(next)}
      className={cn("outline-none", className)}
      {...props}
    />
  )
}

type ItemProps = Omit<ComponentProps<typeof SdkListboxItem<string>>, "className"> & {
  className?: string
}

export function ListboxItem({ className, ...props }: ItemProps) {
  return (
    <SdkListboxItem<string>
      className={cn(
        "cursor-default rounded-lg border border-transparent outline-none",
        "focus-visible:ring-2 focus-visible:ring-(--app-ring)",
        className,
      )}
      {...props}
    />
  )
}
