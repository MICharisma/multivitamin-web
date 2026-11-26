import { useTheme } from "../../theme"
import { Toggle } from "../ui/toggle"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Toggle
      aria-label="Dark theme"
      pressed={theme === "dark"}
      onPressedChange={(pressed) => setTheme(pressed ? "dark" : "light")}
    >
      <span aria-hidden="true">{theme === "dark" ? "☾" : "☀"}</span>
    </Toggle>
  )
}
