import { useMemo } from "react"
import { useNavigate } from "react-router"
import { examplePath } from "../../data/queries"
import type { Manifest } from "../../data/types"
import { NavTree, TreeGroup, TreeItem, TreeItemIndicator, TreeItemLabel, type TreeItemData } from "../ui/tree"

interface FeatureTreeProps {
  multivitaminId: string
  manifest: Manifest
  /** `feature/example` of the page being shown. */
  current: string | null
}

/** Features as branches, examples as links. Leaf values are `featureFolder/exampleFolder`. */
export function FeatureTree({ multivitaminId, manifest, current }: FeatureTreeProps) {
  const navigate = useNavigate()

  const { items, paths } = useMemo(() => {
    const paths = new Map<string, string>()
    const items: TreeItemData[] = manifest.features.map((feature) => ({
      value: feature.folder,
      label: feature.title,
      children: feature.examples.map((example) => {
        const value = `${feature.folder}/${example.folder}`
        const path = examplePath(multivitaminId, feature, example)
        paths.set(value, path)
        return { value, label: example.title, href: `#${path}` }
      }),
    }))
    return { items, paths }
  }, [manifest, multivitaminId])

  return (
    <NavTree
      aria-label="Features and examples"
      items={items}
      current={current}
      defaultExpanded={items.map((item) => item.value)}
      onAction={(value, { event }) => {
        const path = paths.get(value)
        if (!path) return
        event?.preventDefault()
        navigate(path)
      }}
    >
      {items.map((feature) => (
        <TreeItem key={feature.value} value={feature.value}>
          <TreeItemLabel className="font-medium">
            <TreeItemIndicator />
            {feature.label}
          </TreeItemLabel>
          <TreeGroup>
            {feature.children?.map((example) => (
              <TreeItem key={example.value} value={example.value}>
                <TreeItemLabel render={<a href={example.href} />}>
                  <span className="truncate" title={example.label}>
                    {example.label}
                  </span>
                </TreeItemLabel>
              </TreeItem>
            ))}
          </TreeGroup>
        </TreeItem>
      ))}
    </NavTree>
  )
}
