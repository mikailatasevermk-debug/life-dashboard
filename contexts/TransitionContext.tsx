"use client"

import { createContext, useContext, useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TransitionContextType {
  currentView: 'home' | 'space'
  currentSpace: any | null
  slideToSpace: (space: any) => void
  slideToHome: () => void
  isTransitioning: boolean
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined)

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<'home' | 'space'>('home')
  const [currentSpace, setCurrentSpace] = useState<any | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const slideToSpace = (space: any) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSpace(space)
      setCurrentView('space')
      setIsTransitioning(false)
    }, 150)
  }

  const slideToHome = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSpace(null)
      setCurrentView('home')
      setIsTransitioning(false)
    }, 150)
  }

  return (
    <TransitionContext.Provider value={{
      currentView,
      currentSpace,
      slideToSpace,
      slideToHome,
      isTransitioning
    }}>
      {children}
    </TransitionContext.Provider>
  )
}

export function useTransition() {
  const context = useContext(TransitionContext)
  if (context === undefined) {
    throw new Error('useTransition must be used within a TransitionProvider')
  }
  return context
}