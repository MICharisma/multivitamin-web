import { Link } from "react-router"
import { registry } from "../registry"

export function NotFound({ what = "page" }: { what?: string }) {
  return (
    <div className="mx-auto max-w-md p-10 text-sm">
      <h1 className="mb-2 text-lg font-semibold">Not found</h1>
      <p className="mb-4 text-(--app-muted)">There is no {what} here.</p>
      <ul className="list-disc ps-5">
        {registry.map((entry) => (
          <li key={entry.id}>
            <Link className="underline" to={`/${entry.id}`}>
              {entry.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
