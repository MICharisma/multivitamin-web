import {
  Dialog,
  DialogBackdrop as SdkDialogBackdrop,
  DialogContent as SdkDialogContent,
  DialogShortcut,
  DialogTitle,
  DialogTrigger as SdkDialogTrigger,
} from "@ui-sdk/react/dialog"
import type { ComponentProps } from "react"
import { cn } from "./cn"

export { Dialog, DialogShortcut }

type TriggerProps = Omit<ComponentProps<typeof SdkDialogTrigger>, "className"> & {
  className?: string
}

export function DialogTrigger({ className, ...props }: TriggerProps) {
  return (
    <SdkDialogTrigger
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-md border border-(--app-border) bg-(--app-surface) px-2.5",
        "text-sm text-(--app-muted) outline-none hover:bg-(--app-hover) focus-visible:ring-2 focus-visible:ring-(--app-ring)",
        className,
      )}
      {...props}
    />
  )
}

export function DialogBackdrop() {
  return (
    <SdkDialogBackdrop className="fixed inset-0 bg-black/40 transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none" />
  )
}

type ContentProps = Omit<ComponentProps<typeof SdkDialogContent>, "className"> & {
  className?: string
}

export function DialogContent({ className, ...props }: ContentProps) {
  return (
    <SdkDialogContent
      className={cn(
        "fixed top-[12vh] left-1/2 w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl",
        "border border-(--app-border) bg-(--app-surface) text-(--app-fg) shadow-2xl",
        "transition-[opacity,scale] duration-150 data-starting-style:scale-98 data-starting-style:opacity-0",
        "data-ending-style:scale-98 data-ending-style:opacity-0 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  )
}

export function DialogTitleHidden(props: ComponentProps<typeof DialogTitle>) {
  return <DialogTitle className="sr-only" {...props} />
}
