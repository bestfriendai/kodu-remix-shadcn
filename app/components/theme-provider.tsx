import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement
    const savedTheme = window.localStorage.getItem(storageKey) as Theme | null

    if (savedTheme) {
      setTheme(savedTheme)
      if (disableTransitionOnChange) {
        root.classList.add("[&_*]:!transition-none")
        setTimeout(() => root.classList.remove("[&_*]:!transition-none"), 0)
      }
      
      root.classList.remove("light", "dark")
      root.classList.add(savedTheme === "system" 
        ? (enableSystem && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : savedTheme)
    }
  }, [storageKey, enableSystem, disableTransitionOnChange])

  useEffect(() => {
    const root = window.document.documentElement

    if (disableTransitionOnChange) {
      root.classList.add("[&_*]:!transition-none")
      setTimeout(() => root.classList.remove("[&_*]:!transition-none"), 0)
    }

    root.classList.remove("light", "dark")

    if (theme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme, disableTransitionOnChange, enableSystem])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}