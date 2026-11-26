import { Navigate } from "react-router"
import { examplePath } from "../data/queries"
import { useMultivitamin } from "./MultivitaminLayout"

/** `/:multivitamin` opens the first example of the first feature. */
export function MultivitaminIndex() {
  const { entry, manifest } = useMultivitamin()
  const feature = manifest.features.find((f) => f.examples.length > 0)
  const example = feature?.examples[0]
  if (!feature || !example) {
    return <p className="p-6 text-sm text-(--app-muted)">This multivitamin has no examples yet.</p>
  }
  return <Navigate replace to={examplePath(entry.id, feature, example)} />
}
