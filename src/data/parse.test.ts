import { describe, expect, it } from "vitest"
import { cleanHtml, parseHighlights, parseLesson, parseManifest, parseRegionRef } from "./parse"

describe("parseManifest", () => {
  const manifest = {
    formatVersion: 1,
    multivitamin: { name: "rubyllm", title: "RubyLLM multivitamin" },
    commit: "abc",
    features: [
      {
        folder: "01-chat-basics",
        feature: "chat-basics",
        title: "Chat basics",
        covers: ["RubyLLM.chat"],
        examples: [{ folder: "01-x", title: "X", source: "a/x.rb", html: "a/x.rb.html" }, { bogus: true }],
      },
    ],
  }

  it("reads a v1 manifest and drops malformed examples", () => {
    const parsed = parseManifest(manifest)
    expect(parsed.supported).toBe(true)
    expect(parsed.title).toBe("RubyLLM multivitamin")
    expect(parsed.features[0]?.examples).toHaveLength(1)
  })

  it("marks unknown format versions unsupported instead of failing", () => {
    const parsed = parseManifest({ ...manifest, formatVersion: 7 })
    expect(parsed.supported).toBe(false)
    expect(parsed.features[0]?.examples[0]?.html).toBe("a/x.rb.html")
  })
})

describe("parseLesson", () => {
  it("splits file#name references and skips unknown roles", () => {
    const lesson = parseLesson({
      steps: [
        {
          label: "Step",
          api: "RubyLLM.chat",
          regions: [
            { name: "helper.rb#open", role: "setup" },
            { name: "ask", role: "primary" },
            { name: "x", role: "decoration" },
          ],
        },
      ],
    })
    expect(lesson.steps[0]?.regions).toEqual([
      { file: "helper.rb", name: "open", role: "setup" },
      { name: "ask", role: "primary" },
    ])
  })
})

describe("parseHighlights", () => {
  it("flags unknown versions", () => {
    expect(parseHighlights({ version: 1, files: {} }).supported).toBe(true)
    expect(parseHighlights({ version: 2, files: {} }).supported).toBe(false)
  })
})

it("parseRegionRef handles bare names", () => {
  expect(parseRegionRef("open-chat")).toEqual({ name: "open-chat" })
})

it("cleanHtml strips the BOM", () => {
  expect(cleanHtml("\uFEFF<pre>")).toBe("<pre>")
})
