import type { LessonStep, Role } from "../../data/types"

/** Region name → role for the step being shown. */
export type RoleMap = ReadonlyMap<string, Role>

const PRECEDENCE: Record<Role, number> = { primary: 0, setup: 1, result: 2 }

const basename = (path: string) => path.slice(path.lastIndexOf("/") + 1)

/**
 * Regions of `step` that live in `sourceFile`. A region named `other.rb#name` belongs to
 * another file's panel and is left out; an unprefixed name belongs to the lesson's main file.
 */
export function stepRoleMap(step: LessonStep | undefined, sourceFile: string): RoleMap {
  const map = new Map<string, Role>()
  if (!step) return map
  const file = basename(sourceFile)
  for (const region of step.regions) {
    if (region.file && basename(region.file) !== file) continue
    const existing = map.get(region.name)
    if (!existing || PRECEDENCE[region.role] < PRECEDENCE[existing]) {
      map.set(region.name, region.role)
    }
  }
  return map
}

/** Picks the strongest role among a space-separated `data-region` value. */
export function roleForRegions(dataRegion: string | null | undefined, roles: RoleMap) {
  if (!dataRegion) return undefined
  let best: Role | undefined
  for (const name of dataRegion.split(/\s+/)) {
    const role = roles.get(name)
    if (role && (!best || PRECEDENCE[role] < PRECEDENCE[best])) best = role
  }
  return best
}

/**
 * Sets `data-role` on matching lines and focus spans and `data-dimmed` on every other line.
 * Pass `null` to clear all highlighting (unsupported artifacts, or no lesson).
 */
export function applyRoles(container: ParentNode, roles: RoleMap | null) {
  for (const line of container.querySelectorAll<HTMLElement>(".line")) {
    const role = roles ? roleForRegions(line.dataset.region, roles) : undefined
    if (role) line.dataset.role = role
    else delete line.dataset.role
    if (roles && !role) line.dataset.dimmed = ""
    else delete line.dataset.dimmed
  }
  for (const span of container.querySelectorAll<HTMLElement>(".mv-focus")) {
    const role = roles ? roleForRegions(span.dataset.region, roles) : undefined
    if (role) span.dataset.role = role
    else delete span.dataset.role
  }
}
