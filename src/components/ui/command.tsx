import {
  Command,
  CommandEmpty as SdkCommandEmpty,
  CommandGroup,
  CommandGroupLabel as SdkCommandGroupLabel,
  CommandInput as SdkCommandInput,
  CommandItem as SdkCommandItem,
  CommandList as SdkCommandList,
} from "@ui-sdk/react/command"
import type { ComponentProps } from "react"
import { cn } from "./cn"

export { Command, CommandGroup }

export function CommandInput(props: ComponentProps<typeof SdkCommandInput>) {
  return (
    <SdkCommandInput
      className="h-12 w-full border-b border-(--app-border) bg-transparent px-4 text-sm text-(--app-fg) outline-none placeholder:text-(--app-muted)"
      {...props}
    />
  )
}

export function CommandList(props: ComponentProps<typeof SdkCommandList>) {
  return <SdkCommandList className="max-h-[60vh] overflow-y-auto p-1.5" {...props} />
}

export function CommandEmpty(props: ComponentProps<typeof SdkCommandEmpty>) {
  return <SdkCommandEmpty className="p-6 text-center text-sm text-(--app-muted)" {...props} />
}

export function CommandGroupLabel(props: ComponentProps<typeof SdkCommandGroupLabel>) {
  return (
    <SdkCommandGroupLabel
      className="px-2 pt-2 pb-1 text-xs font-medium tracking-wide text-(--app-muted) uppercase"
      {...props}
    />
  )
}

type ItemProps = Omit<ComponentProps<typeof SdkCommandItem>, "className"> & { className?: string }

export function CommandItem({ className, ...props }: ItemProps) {
  return (
    <SdkCommandItem
      className={cn(
        "flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none",
        "data-highlighted:bg-(--app-hover)",
        className,
      )}
      {...props}
    />
  )
}
