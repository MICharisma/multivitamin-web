import { useState } from "react"
import { useNavigate } from "react-router"
import { examplePath } from "../../data/queries"
import type { Manifest } from "../../data/types"
import { registry } from "../../registry"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command"
import { Dialog, DialogBackdrop, DialogContent, DialogShortcut, DialogTitleHidden, DialogTrigger } from "../ui/dialog"

interface SearchPaletteProps {
  multivitaminId: string
  manifest: Manifest | undefined
}

/**
 * Cmd/Ctrl+K palette over the loaded manifest: examples (searchable by feature title and the
 * API symbols the feature covers) plus the other registered multivitamins.
 */
export function SearchPalette({ multivitaminId, manifest }: SearchPaletteProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger shortcut="mod+k" className="min-w-56 justify-between">
        <span>Search examples…</span>
        <DialogShortcut className="rounded border border-(--app-border) px-1 font-mono text-xs" />
      </DialogTrigger>
      <DialogBackdrop />
      <DialogContent>
        <DialogTitleHidden>Search</DialogTitleHidden>
        <Command
          onAction={(value) => {
            setOpen(false)
            navigate(value)
          }}
        >
          <CommandInput aria-label="Search examples" placeholder="Search examples, features, APIs…" />
          <CommandEmpty>No matches.</CommandEmpty>
          <CommandList>
            {manifest?.features.map((feature) => (
              <CommandGroup key={feature.folder}>
                <CommandGroupLabel>{feature.title}</CommandGroupLabel>
                {feature.examples.map((example) => (
                  <CommandItem
                    key={example.folder}
                    value={examplePath(multivitaminId, feature, example)}
                    label={example.title}
                    keywords={[feature.title, feature.feature, ...feature.covers]}
                  >
                    <span className="truncate">{example.title}</span>
                    {example.stepCount !== undefined && (
                      <span className="ms-auto shrink-0 text-xs text-(--app-muted)">
                        {example.stepCount} steps
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            {registry.length > 1 && (
              <CommandGroup>
                <CommandGroupLabel>Multivitamins</CommandGroupLabel>
                {registry
                  .filter((entry) => entry.id !== multivitaminId)
                  .map((entry) => (
                    <CommandItem key={entry.id} value={`/${entry.id}`} label={entry.title}>
                      {entry.title}
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
