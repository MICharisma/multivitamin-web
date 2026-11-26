import { useCallback, useState } from "react"

export type Theme = "light" | "dark"

const STORAGE_KEY = "mv-theme"

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light"
}

/** `index.html` applies the saved or system theme before first paint; this keeps it in sync. */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(currentTheme)
  const setTheme = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage can be unavailable (private mode); the toggle still works for this visit.
    }
    setThemeState(next)
  }, [])
  return { theme, setTheme }
}
