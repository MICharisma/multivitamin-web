import { useQuery } from "@tanstack/react-query"
import { findRegistryEntry, type RegistryEntry } from "../registry"
import {
  cleanHtml,
  parseFeatureInfo,
  parseHighlights,
  parseLesson,
  parseManifest,
} from "./parse"
import type { ExampleEntry, FeatureEntry, Manifest } from "./types"

export class ArtifactFetchError extends Error {
  override name = "ArtifactFetchError"
  constructor(
    readonly url: string,
    readonly status: number,
  ) {
    super(`GET ${url} failed with ${status}`)
  }
}

async function fetchArtifact(url: string, signal: AbortSignal): Promise<Response> {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new ArtifactFetchError(url, res.status)
  return res
}

const fetchJson = async (url: string, signal: AbortSignal) =>
  (await fetchArtifact(url, signal)).json() as Promise<unknown>
const fetchText = async (url: string, signal: AbortSignal) =>
  (await fetchArtifact(url, signal)).text()

/** Resolves a manifest-relative artifact path against the manifest URL. */
export function artifactUrl(entry: RegistryEntry, path: string): string {
  return new URL(path, entry.manifestUrl).href
}

/** Changes whenever the multivitamin is rebuilt, so cached artifacts from an older build are not reused. */
function versionStamp(manifest: Manifest): string {
  return manifest.commit ?? manifest.builtAt ?? String(manifest.formatVersion)
}

export function useManifest(multivitaminId: string | undefined) {
  const entry = findRegistryEntry(multivitaminId)
  return useQuery({
    queryKey: ["manifest", entry?.manifestUrl],
    enabled: entry !== undefined,
    queryFn: async ({ signal }) => parseManifest(await fetchJson(entry!.manifestUrl, signal)),
  })
}

interface ExampleContext {
  entry: RegistryEntry
  manifest: Manifest
  example: ExampleEntry
}

export function useExampleHtml({ entry, manifest, example }: ExampleContext) {
  return useQuery({
    queryKey: ["html", entry.id, versionStamp(manifest), example.html],
    queryFn: async ({ signal }) =>
      cleanHtml(await fetchText(artifactUrl(entry, example.html), signal)),
    staleTime: Infinity,
  })
}

export function useLesson({ entry, manifest, example }: ExampleContext) {
  return useQuery({
    queryKey: ["lesson", entry.id, versionStamp(manifest), example.lesson],
    enabled: manifest.supported && example.lesson !== undefined,
    queryFn: async ({ signal }) =>
      parseLesson(await fetchJson(artifactUrl(entry, example.lesson!), signal)),
    staleTime: Infinity,
  })
}

export function useHighlights({ entry, manifest, example }: ExampleContext) {
  return useQuery({
    queryKey: ["highlights", entry.id, versionStamp(manifest), example.highlights],
    enabled: manifest.supported && example.highlights !== undefined,
    queryFn: async ({ signal }) =>
      parseHighlights(await fetchJson(artifactUrl(entry, example.highlights!), signal)),
    staleTime: Infinity,
  })
}

/**
 * `feature.json` lives in the feature folder. The manifest already carries `covers`,
 * so this is only used to pick up anything the manifest omits; failures are tolerated.
 */
export function useFeatureInfo(entry: RegistryEntry, manifest: Manifest, feature: FeatureEntry) {
  return useQuery({
    queryKey: ["feature", entry.id, versionStamp(manifest), feature.folder],
    enabled: manifest.supported,
    queryFn: async ({ signal }) =>
      parseFeatureInfo(
        await fetchJson(artifactUrl(entry, `${feature.folder}/feature.json`), signal),
      ),
    staleTime: Infinity,
    retry: false,
  })
}

export function findExample(
  manifest: Manifest,
  featureFolder: string | undefined,
  exampleFolder: string | undefined,
): { feature: FeatureEntry; example: ExampleEntry } | undefined {
  const feature = manifest.features.find((f) => f.folder === featureFolder)
  const example = feature?.examples.find((e) => e.folder === exampleFolder)
  return feature && example ? { feature, example } : undefined
}

export function examplePath(multivitaminId: string, feature: FeatureEntry, example: ExampleEntry) {
  return `/${multivitaminId}/${feature.folder}/${example.folder}`
}
