"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { getThemeById, getDefaultTheme, type Theme } from "@/lib/themes"

interface ThemeContextType {
  currentTheme: Theme
  themeId: string
  setTheme: (themeId: string) => void
  isThemeLoaded: boolean
  systemTheme: 'light' | 'dark' | 'auto'
  resolvedSystemTheme: 'light' | 'dark'
  setSystemTheme: (theme: 'light' | 'dark' | 'auto') => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<string>("clean-white")
  const [isThemeLoaded, setIsThemeLoaded] = useState(false)
  const [systemTheme, setSystemThemeState] = useState<'light' | 'dark' | 'auto'>('auto')
  const [resolvedSystemTheme, setResolvedSystemTheme] = useState<'light' | 'dark'>('light')

  // Load themes from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("dashboard_theme")
    if (savedTheme) {
      setThemeId(savedTheme)
    }

    const savedSettings = localStorage.getItem('app_settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setSystemThemeState(settings.theme || 'auto')
      } catch (error) {
        console.error('Error loading system theme:', error)
      }
    }

    setIsThemeLoaded(true)
  }, [])

  // Save theme to localStorage when changed
  const setTheme = (newThemeId: string) => {
    setThemeId(newThemeId)
    localStorage.setItem("dashboard_theme", newThemeId)
  }

  // Handle system theme changes
  const setSystemTheme = (theme: 'light' | 'dark' | 'auto') => {
    setSystemThemeState(theme)
    // Update localStorage
    const savedSettings = localStorage.getItem('app_settings')
    const settings = savedSettings ? JSON.parse(savedSettings) : {}
    const updatedSettings = { ...settings, theme }
    localStorage.setItem('app_settings', JSON.stringify(updatedSettings))
  }

  // Resolve system theme based on preference
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (systemTheme === 'auto') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setResolvedSystemTheme(isDark ? 'dark' : 'light')
      } else {
        setResolvedSystemTheme(systemTheme as 'light' | 'dark')
      }
    }

    updateResolvedTheme()

    // Listen for system theme changes when in auto mode
    if (systemTheme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = (e: MediaQueryListEvent) => {
        setResolvedSystemTheme(e.matches ? 'dark' : 'light')
      }
      
      mediaQuery.addEventListener('change', listener)
      return () => mediaQuery.removeEventListener('change', listener)
    }
  }, [systemTheme])

  const currentTheme = getThemeById(themeId)

  // Apply theme to document root
  useEffect(() => {
    if (!isThemeLoaded) return

    const root = document.documentElement
    
    // Set CSS custom properties for the background theme
    root.style.setProperty('--theme-background', currentTheme.background)
    root.style.setProperty('--theme-accent', currentTheme.accent || '#6366f1')
    root.style.setProperty('--theme-text', currentTheme.textColor || '#1f2937')
    
    // Set CSS custom properties for system theme
    if (resolvedSystemTheme === 'dark') {
      root.style.setProperty('--system-bg', '#1a1a1a')
      root.style.setProperty('--system-text', '#ffffff')
      root.style.setProperty('--system-border', '#374151')
      root.style.setProperty('--system-card', '#2d2d2d')
    } else {
      root.style.setProperty('--system-bg', '#ffffff')
      root.style.setProperty('--system-text', '#1f2937')
      root.style.setProperty('--system-border', '#e5e7eb')
      root.style.setProperty('--system-card', '#f9fafb')
    }
    
    // Add theme classes to document
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedSystemTheme)
    
    // Add background theme class to body
    document.body.className = document.body.className.replace(/theme-\w+/g, '')
    document.body.classList.add(`theme-${currentTheme.id}`)
  }, [currentTheme, isThemeLoaded, resolvedSystemTheme])

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      themeId,
      setTheme,
      isThemeLoaded,
      systemTheme,
      resolvedSystemTheme,
      setSystemTheme
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}