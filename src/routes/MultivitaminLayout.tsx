import { Link, Outlet, useOutletContext, useParams } from "react-router"
import { useManifest } from "../data/queries"
import type { Manifest } from "../data/types"
import { findRegistryEntry, type RegistryEntry } from "../registry"
import { ErrorNotice, Loading } from "../components/Status"
import { FeatureTree } from "../components/nav/FeatureTree"
import { MultivitaminPicker } from "../components/nav/MultivitaminPicker"
import { SearchPalette } from "../components/nav/SearchPalette"
import { ThemeToggle } from "../components/nav/ThemeToggle"
import { NotFound } from "./NotFound"

export interface MultivitaminContext {
  entry: RegistryEntry
  manifest: Manifest
}

export function useMultivitamin() {
  return useOutletContext<MultivitaminContext>()
}

export function MultivitaminLayout() {
  const params = useParams()
  const entry = findRegistryEntry(params.multivitamin)
  const manifest = useManifest(entry?.id)

  if (!entry) return <NotFound what={`multivitamin “${params.multivitamin}”`} />

  const current = params.feature && params.example ? `${params.feature}/${params.example}` : null

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-(--app-border) bg-(--app-surface) px-4">
        <Link to={`/${entry.id}`} className="font-semibold tracking-tight">
          multivitamin
        </Link>
        <MultivitaminPicker current={entry.id} />
        <div className="ms-auto flex items-center gap-2">
          <SearchPalette multivitaminId={entry.id} manifest={manifest.data} />
          <ThemeToggle />
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <nav
          aria-label="Catalog"
          className="hidden w-72 shrink-0 overflow-y-auto border-e border-(--app-border) bg-(--app-surface) p-2 md:block"
        >
          {manifest.data && (
            <FeatureTree multivitaminId={entry.id} manifest={manifest.data} current={current} />
          )}
        </nav>
        <main className="flex min-w-0 flex-1 flex-col">
          {manifest.isPending ? (
            <Loading>Loading {entry.title} manifest…</Loading>
          ) : manifest.isError ? (
            <ErrorNotice error={manifest.error} onRetry={() => void manifest.refetch()} />
          ) : (
            <Outlet context={{ entry, manifest: manifest.data } satisfies MultivitaminContext} />
          )}
        </main>
      </div>
    </div>
  )
}
