import { expect, it } from "vitest"
import { roleForRegions, stepRoleMap } from "./roles"

const step = {
  label: "Ask",
  regions: [
    { name: "ask", role: "primary" as const },
    { name: "open", role: "setup" as const },
    { name: "open", role: "primary" as const },
    { name: "elsewhere", file: "helper.rb", role: "result" as const },
    { name: "here", file: "feature/main.rb", role: "result" as const },
  ],
}

it("keeps the strongest role per region and drops regions from other files", () => {
  const roles = stepRoleMap(step, "01-feature/01-example/main.rb")
  expect(Object.fromEntries(roles)).toEqual({ ask: "primary", open: "primary", here: "result" })
})

it("picks the strongest role among space-separated regions", () => {
  const roles = new Map([
    ["a", "result" as const],
    ["b", "setup" as const],
  ])
  expect(roleForRegions("a b c", roles)).toBe("setup")
  expect(roleForRegions("c", roles)).toBeUndefined()
  expect(roleForRegions("", roles)).toBeUndefined()
})
