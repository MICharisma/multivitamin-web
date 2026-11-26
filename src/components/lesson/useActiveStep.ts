import { useCallback, useState } from "react"
import { useSearchParams } from "react-router"

/**
 * The active step lives in the URL (`?step=2`, 1-based) so it can be shared and survives
 * reloads. The preview (hover / keyboard focus in the step list) is transient local state.
 * The code panel shows `shown`: the preview when there is one, otherwise the active step.
 */
export function useActiveStep(stepCount: number) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [preview, setPreview] = useState<number | null>(null)

  const requested = Number(searchParams.get("step"))
  const active =
    stepCount === 0
      ? -1
      : Number.isInteger(requested) && requested >= 1
        ? Math.min(requested, stepCount) - 1
        : 0

  const setActive = useCallback(
    (index: number) => {
      setSearchParams(
        (params) => {
          params.set("step", String(index + 1))
          return params
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const validPreview = preview !== null && preview < stepCount ? preview : null
  return { active, preview: validPreview, shown: validPreview ?? active, setActive, setPreview }
}
