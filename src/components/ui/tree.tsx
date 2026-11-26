import {
  Tree as SdkTree,
  TreeGroup as SdkTreeGroup,
  TreeItem,
  TreeItemIndicator as SdkTreeItemIndicator,
  TreeItemLabel as SdkTreeItemLabel,
  type TreeItemData,
  type TreeProps,
} from "@ui-sdk/react/tree"
import type { ComponentProps } from "react"
import { cn } from "./cn"

export { TreeItem, type TreeItemData }

type NavTreeProps = Omit<TreeProps<"none">, "mode" | "className"> & { className?: string }

/** A navigation tree: no selection, `current` marks the page being shown. */
export function NavTree({ className, ...props }: NavTreeProps) {
  return <SdkTree<"none"> mode="none" className={cn("text-sm", className)} {...props} />
}

type LabelProps = Omit<ComponentProps<typeof SdkTreeItemLabel>, "className"> & {
  className?: string
}

export function TreeItemLabel({ className, ...props }: LabelProps) {
  return (
    <SdkTreeItemLabel
      className={cn(
        "flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pe-2 text-(--app-fg) no-underline outline-none",
        "ps-[calc((var(--tree-level,1)-1)*1rem+0.5rem)] hover:bg-(--app-hover)",
        "in-[[data-slot=tree-item]:focus-visible]:ring-2 in-[[data-slot=tree-item]:focus-visible]:ring-(--app-ring)",
        "data-current:bg-(--app-selected) data-current:font-medium",
        className,
      )}
      {...props}
    />
  )
}

export function TreeItemIndicator() {
  return (
    <SdkTreeItemIndicator className="inline-block w-3 text-(--app-muted) transition-transform data-expanded:rotate-90 motion-reduce:transition-none">
      ›
    </SdkTreeItemIndicator>
  )
}

export function TreeGroup(props: ComponentProps<typeof SdkTreeGroup>) {
  return <SdkTreeGroup {...props} />
}
