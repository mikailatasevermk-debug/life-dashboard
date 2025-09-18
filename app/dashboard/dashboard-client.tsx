"use client"

import { useState, useEffect, useRef } from "react"
import { SpaceCard } from "@/components/dashboard/SpaceCard"
import { SPACES } from "@/lib/spaces"
import { Calendar, Settings, Sparkles, Coins, Zap, Star, Users, User, LogOut, Clock } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { TransitionProvider, useTransition } from "@/contexts/TransitionContext"
import { useUserProgress } from "@/lib/user-progress"
import { gameSounds } from "@/lib/sounds"
import { SpaceDashboard } from "@/components/space/SpaceDashboard"
import { SettingsModal } from "@/components/settings/SettingsModal"
import { CommandPalette } from "@/components/ui/CommandPalette"
import { AIVoiceAssistant } from "@/components/ai/AIVoiceAssistant"
import { MinimalNavigation } from "@/components/navigation/MinimalNavigation"
import { signOut } from "next-auth/react"

interface DashboardClientProps {
  user: {
    id?: string
    email?: string | null
    name?: string | null
    image?: string | null
  }
}

function DashboardContent({ user }: DashboardClientProps) {
  // Hook usage counter for debugging
  const hookCountRef = useRef(0)
  hookCountRef.current++
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[HOOK DEBUG] DashboardContent render #${hookCountRef.current}`)
  }
  
  const { currentView, currentSpace, slideToSpace } = useTransition()
  const { progress: userProgress, addCoins, isLoading } = useUserProgress()
  const [powerUp, setPowerUp] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[HOOK DEBUG] All state hooks called:', {
      powerUp, showSettings, showCommandPalette, isMobile,
      currentView, currentSpace, isLoading
    })
  }
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[HOOK DEBUG] Mobile detection useEffect running')
    }
    
    // Detect mobile device
    const checkMobile = window.innerWidth <= 768
    setIsMobile(checkMobile)
    
    // Daily login check is handled automatically when fetching progress
    // No need to call checkDailyLogin() here
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[HOOK DEBUG] Mobile detection complete:', checkMobile)
    }
  }, [])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false)
        setShowSettings(false)
      }
    }

    const handleOpenSettings = () => {
      setShowSettings(true)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-settings', handleOpenSettings)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-settings', handleOpenSettings)
    }
  }, [])
  
  // Show loading state while fetching user progress
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const level = userProgress?.level || 1
  const progressPercent = ((userProgress?.xp || 0) % 100) / 100 * 100

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth/signin" })
  }

  const handleAIAction = (action: any) => {
    // Handle custom actions from AI assistant
    console.log('AI Action:', action)
  }

  const handleShowFamily = () => {
    // TODO: Implement family functionality
    console.log('Show family clicked')
  }

  // Set up event listeners for AI assistant actions
  useEffect(() => {
    const handleNavigateToSpace = (e: CustomEvent) => {
      const space = SPACES.find(s => s.type === e.detail.space)
      if (space) {
        slideToSpace(space)
      }
    }

    const handleOpenSettings = () => setShowSettings(true)
    const handleCreateNote = (e: CustomEvent) => {
      // This will be handled by the current space
      if (currentSpace) {
        // Trigger note creation in current space
        window.dispatchEvent(new CustomEvent('trigger-note-creation', { detail: e.detail }))
      }
    }

    window.addEventListener('navigate-to-space', handleNavigateToSpace as any)
    window.addEventListener('open-settings', handleOpenSettings)
    window.addEventListener('create-note', handleCreateNote as any)

    return () => {
      window.removeEventListener('navigate-to-space', handleNavigateToSpace as any)
      window.removeEventListener('open-settings', handleOpenSettings)
      window.removeEventListener('create-note', handleCreateNote as any)
    }
  }, [currentSpace, slideToSpace, setShowSettings])

  // Format user for navigation
  const formattedUser = {
    id: user.id || 'user',
    email: user.email || '',
    name: user.name || 'User',
    avatar: user.image,
    familyId: undefined,
    role: 'owner' as const,
    createdAt: new Date().toISOString()
  }

  return (
    <div 
      className="min-h-screen transition-all duration-500"
      style={{ 
        background: 'var(--theme-background, linear-gradient(135deg, #ffffff 0%, #f8f9fa 25%, #e9ecef 50%, #dee2e6 75%, #ced4da 100%))'
      }}
    >
      {/* Navigation */}
      <MinimalNavigation
        user={formattedUser}
        userProgress={userProgress}
        onShowSettings={() => setShowSettings(true)}
        onShowFamily={handleShowFamily}
        onShowCommandPalette={() => setShowCommandPalette(true)}
        onLogout={handleLogout}
      />
      
      <AnimatePresence mode="wait">
        {currentView === 'home' ? (
          <motion.div
            key="home"
            initial={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.5
            }}
            className="min-h-screen pt-16 p-4 sm:p-6 md:p-8 lg:p-12"
          >
            <div className="max-w-7xl mx-auto">
              <motion.header 
                className="mb-6 sm:mb-8 md:mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4">
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <motion.div 
                      className="p-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50"
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 15,
                        boxShadow: "0 20px 40px rgba(255, 143, 163, 0.3)"
                      }}
                      onClick={() => {
                        addCoins(10)
                        setPowerUp(true)
                        gameSounds?.playPowerUpSound()
                        setTimeout(() => setPowerUp(false), 1000)
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Sparkles className="w-8 h-8 text-purple-500" />
                    </motion.div>
                    <div>
                      <motion.h1 
                        className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r ${powerUp ? 'from-yellow-400 via-pink-500 to-purple-600' : 'from-purple-600 to-pink-600'} bg-clip-text text-transparent tracking-tight`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                      >
                        Life Dashboard
                      </motion.h1>
                      <motion.p 
                        className="text-gray-700 text-sm sm:text-base md:text-lg font-semibold mt-1 sm:mt-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                      >
                        <span className="block sm:inline">Level {level} Player</span>
                        <span className="hidden sm:inline"> | </span>
                        <span className="block sm:inline">🪙 {userProgress?.coins || 0} coins</span>
                        <span className="hidden md:inline"> | ⭐ XP: {userProgress?.xp || 0}</span>
                      </motion.p>
                    </div>
                    {/* Level Progress Bar */}
                    <motion.div 
                      className="mt-2 sm:mt-3 w-full sm:w-48 md:w-64 bg-white/50 backdrop-blur rounded-full h-2 sm:h-3 overflow-hidden shadow-inner"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    >
                      <motion.div 
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-full shadow-sm"
                        style={{ width: `${progressPercent}%` }}
                        animate={{ 
                          width: `${progressPercent}%`,
                          boxShadow: powerUp ? "0 0 20px rgba(255, 193, 7, 0.6)" : "none"
                        }}
                        transition={{ type: "spring", stiffness: 100 }}
                      />
                    </motion.div>
                  </div>
                </div>
              </motion.header>

              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-6xl mx-auto px-2 sm:px-4">
                {SPACES.map((space, index) => (
                  <motion.div 
                    key={space.type} 
                    onClick={() => {
                      addCoins(2)
                      gameSounds?.playCoinSound()
                      slideToSpace(space)
                    }} 
                    className="w-full"
                    whileTap={{ 
                      scale: 0.95,
                      rotate: [0, -5, 5, -5, 0],
                      transition: { duration: 0.5 }
                    }}
                  >
                    <SpaceCard
                      type={space.type}
                      name={space.name}
                      color={space.color}
                      cardClass={space.cardClass}
                      iconName={space.iconName}
                      description={space.description}
                      recentNotes={[]}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <SpaceDashboard key="space" space={currentSpace} />
        )}
      </AnimatePresence>
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
      
      {/* Command Palette */}
      <CommandPalette 
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />
      
      {/* AI Voice Assistant */}
      <AIVoiceAssistant onAction={handleAIAction} />
    </div>
  )
}

export default function DashboardClient({ user }: DashboardClientProps) {
  return (
    <TransitionProvider>
      <DashboardContent user={user} />
    </TransitionProvider>
  )
}