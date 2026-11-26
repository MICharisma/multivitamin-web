# multivitamin-web

Shared web client that renders any multivitamin catalog with source highlighting.

One static site (React 19 + Vite + TypeScript) loads a multivitamin's **published build
artifacts** at runtime and renders them as a browsable catalog: features → examples →
lesson steps, with the active step's code regions highlighted in the source. There is no
server and nothing is generated at build time; adding a multivitamin is one registry entry.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check (tsc -b) + production build into dist/
npm test           # a few unit tests for parsing and role logic
```

`dist/` is a plain static site (relative asset paths and hash routing), so it can be served
from any path on any static host. This repo deliberately has no deploy workflow.

## How the client consumes artifacts

A separate build package publishes each multivitamin as a folder of static files. The
client only ever reads these files over HTTP (they must be served with CORS, as GitHub
Pages does).

| Artifact | Where | Used for |
| --- | --- | --- |
| `manifest.json` | the URL in `src/registry.ts` | Catalog: `formatVersion`, multivitamin title, version stamp (`commit` / `builtAt`), features (`folder`, `title`, `covers`) and their examples (`folder`, `title`, and manifest-relative paths to `source`, `html`, `highlights`, `lesson`). |
| `<example>/<file>.html` | `example.html` | Shiki output using the `css-variables` theme. Each `.line` carries `data-line` and `data-region` (space-separated region names); focus spans are `<span class="mv-focus" data-region=…>`. |
| `<example>/lesson.json` | `example.lesson` | `{ steps: [{ label, api, regions: [{ name, role }] }] }`, role ∈ `primary` / `setup` / `result`. A region name may be prefixed `file#name`. |
| `<example>/highlights.json` | `example.highlights` | `{ version, files: { [file]: { regions: [{ name, startLine, endLine, focus }] } } }`. Used to gate highlighting on a known version and to show line ranges next to steps. |
| `<feature>/feature.json` | feature folder | `{ feature, title, covers }`. Optional; the manifest already carries `covers`. |

All artifact paths resolve relative to the manifest URL. Per-example queries include the
manifest's version stamp in their cache key, so a rebuilt multivitamin never mixes old and
new artifacts.

### Highlighting

`CodePanel` mounts the build's HTML once per example (it's trusted, from our own repos).
After that, a single effect walks the lines:

- lines whose `data-region` matches a region of the shown step get `data-role="primary|setup|result"`;
- every other line gets `data-dimmed`;
- `.mv-focus` spans in a matching region get `data-role` too (rendered as an underline);
- the first primary line is scrolled into view if it isn't visible.

The shown step is the **previewed** step (hover or keyboard focus in the step list) or else
the **active** step (selected; stored in the URL as `?step=N`).

`src/styles/palette.css` is the one shared palette. Shiki owns token text color
(`--shiki-token-*`, light and dark). The highlight layer only owns line background tints,
a 3px left bar for primary, the focus underline, and opacity for dimmed lines, so syntax
colors stay visible under highlights. Colors are keyed to role, never to API. Transitions
are ~200ms and are disabled under `prefers-reduced-motion`.

Files over 1,500 lines switch to a virtualized renderer (TanStack Virtual) that mounts the
same per-line markup only for visible rows.

### Unknown versions

- `manifest.json` with an unknown `formatVersion`: examples still render as plain code; lesson
  and highlights are not fetched, and a notice explains why.
- `highlights.json` with an unknown `version`: steps are listed but code is not highlighted.
- A missing or failing lesson/highlights file degrades the same way; only a missing manifest
  or source HTML is an error (with a retry button).

## Adding a multivitamin

Add one entry to `src/registry.ts`:

```ts
{
  id: "langchain",               // URL segment: #/langchain/<feature>/<example>
  title: "LangChain",            // picker label
  manifestUrl: "https://<owner>.github.io/<repo>/manifest.json",
},
```

That's it: the picker, catalog tree, search palette and routes all come from the manifest.

## Code map

```
src/
  registry.ts                 multivitamin manifest URLs
  data/                       artifact types, tolerant parsers, TanStack Query hooks
  routes/                     hash routes: /:multivitamin/:feature/:example
  components/ui/              thin wrappers around Vercel Labs' UI SDK (@ui-sdk/react)
  components/nav/             multivitamin picker (Select), catalog tree (Tree),
                              search palette (Dialog + Command, Cmd/Ctrl+K), theme toggle
  components/lesson/          StepList (Listbox), CodePanel, useActiveStep, role logic
  styles/palette.css          shared Shiki + highlight palette, light and dark
```

The rest of the app imports UI components only from `src/components/ui/`, so the UI SDK
(beta) can later be swapped for shadcn/ui on Base UI by rewriting those wrappers.
