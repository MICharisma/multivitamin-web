export interface RegistryEntry {
  /** URL segment, e.g. `/rubyllm/...`. Must be unique. */
  id: string
  /** Shown in the picker until the manifest has loaded. */
  title: string
  /** Absolute URL of the published `manifest.json`. Artifact paths resolve against it. */
  manifestUrl: string
}

export const registry: readonly RegistryEntry[] = [
  {
    id: "rubyllm",
    title: "RubyLLM",
    manifestUrl: "https://micharisma.github.io/rubyllm-multivitamin/manifest.json",
  },
]

export function findRegistryEntry(id: string | undefined): RegistryEntry | undefined {
  return registry.find((entry) => entry.id === id)
}
