"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { ReactNode } from "react"

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}