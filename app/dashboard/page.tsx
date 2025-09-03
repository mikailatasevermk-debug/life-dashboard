"use client"

import { useState, useEffect } from "react"
import { SpaceCard } from "@/components/dashboard/SpaceCard"
import { SPACES } from "@/lib/spaces"
import { Calendar, Settings, Sparkles, Coins, Zap, Star, Users, User, LogOut, Clock } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { TransitionProvider, useTransition } from "@/contexts/TransitionContext"
import { SpaceDashboard } from "@/components/space/SpaceDashboard"
import { CoinAnimation, useCoins } from "@/components/ui/CoinAnimation"
import { gameSounds } from "@/lib/sounds"
import { useUserProgress } from "@/lib/user-progress"
import { SettingsModal } from "@/components/settings/SettingsModal"
import { CommandPalette } from "@/components/ui/CommandPalette"
import { FamilyManager } from "@/components/family/FamilyManager"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  familyId?: string
  role: 'owner' | 'member'
  createdAt: string
}

function DashboardContent() {
  const { currentView, currentSpace, slideToSpace } = useTransition()
  const { coins: animationCoins, addCoins: addAnimationCoins, showAnimation, lastAmount } = useCoins()
  const { progress: userProgress, addCoins, checkDailyLogin } = useUserProgress()
  const [powerUp, setPowerUp] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showFamily, setShowFamily] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  
  useEffect(() => {
    // Load current user
    const savedUser = localStorage.getItem('current_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    checkDailyLogin()
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
        setShowFamily(false)
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
  
  const level = userProgress.level
  const progressPercent = ((userProgress.xp % 100) / 100) * 100

  const logout = () => {
    localStorage.removeItem('current_user')
    window.location.href = '/'
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('current_user', JSON.stringify(updatedUser))
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen">
      <CoinAnimation show={showAnimation} amount={lastAmount} x={50} y={20} />
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
            className="min-h-screen p-8 md:p-12"
          >
            <div className="max-w-7xl mx-auto">
        <motion.header 
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <motion.div 
                className="p-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50"
                whileHover={{ 
                  scale: 1.1,
                  rotate: 15,
                  boxShadow: "0 20px 40px rgba(255, 143, 163, 0.3)"
                }}
                onClick={() => {
                  addCoins(10)
                  addAnimationCoins(10)
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
                  className={`text-5xl font-bold bg-gradient-to-r ${powerUp ? 'from-yellow-400 via-pink-500 to-purple-600' : 'from-purple-600 to-pink-600'} bg-clip-text text-transparent tracking-tight`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Life Dashboard
                </motion.h1>
                <motion.p 
                  className="text-gray-700 text-lg font-semibold mt-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  Level {level} Player | 🪙 {userProgress.coins} coins | ⭐ XP: {userProgress.xp}
                </motion.p>
              </div>
              {/* Level Progress Bar */}
              <motion.div 
                className="mt-3 w-64 bg-white/50 backdrop-blur rounded-full h-3 overflow-hidden shadow-inner"
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
            
            {/* User Menu */}
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {/* User Info */}
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
                {user.familyId && (
                  <p className="text-xs text-pink-600 font-medium">👨‍👩‍👧‍👦 Family Member</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/schedule"
                    className="p-3 bg-white/90 backdrop-blur-xl rounded-xl hover:bg-white transition-all duration-200 shadow-xl border border-white/50 hover:shadow-2xl"
                  >
                    <Calendar className="w-6 h-6 text-blue-500" />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/timeline"
                    className="p-3 bg-white/90 backdrop-blur-xl rounded-xl hover:bg-white transition-all duration-200 shadow-xl border border-white/50 hover:shadow-2xl"
                    title="Notes Timeline"
                  >
                    <Clock className="w-6 h-6 text-purple-500" />
                  </Link>
                </motion.div>

                <motion.button 
                  onClick={() => setShowFamily(true)}
                  className="p-3 bg-white/90 backdrop-blur-xl rounded-xl hover:bg-white transition-all duration-200 shadow-xl border border-white/50 hover:shadow-2xl"
                  whileHover={{ y: -2 }} 
                  whileTap={{ scale: 0.95 }}
                  title="Family Dashboard"
                >
                  <Users className="w-6 h-6 text-pink-600" />
                </motion.button>

                <motion.button 
                  onClick={() => setShowSettings(true)}
                  className="p-3 bg-white/90 backdrop-blur-xl rounded-xl hover:bg-white transition-all duration-200 shadow-xl border border-white/50 hover:shadow-2xl"
                  whileHover={{ y: -2, rotate: 90 }} 
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Settings className="w-6 h-6 text-gray-600" />
                </motion.button>

                <motion.button 
                  onClick={logout}
                  className="p-3 bg-white/90 backdrop-blur-xl rounded-xl hover:bg-white transition-all duration-200 shadow-xl border border-white/50 hover:shadow-2xl"
                  whileHover={{ y: -2 }} 
                  whileTap={{ scale: 0.95 }}
                  title="Sign Out"
                >
                  <LogOut className="w-6 h-6 text-red-500" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.header>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 max-w-5xl mx-auto">
                {SPACES.map((space, index) => (
                  <motion.div 
                    key={space.type} 
                    onClick={() => {
                      addCoins(2)
                      addAnimationCoins(2)
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

        <motion.div 
          className="mt-16 p-8 bg-white/80 backdrop-blur-xl rounded-3xl text-center shadow-2xl border border-white/50 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <motion.p 
            className="text-base text-gray-800 font-semibold"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            🚀 Click any space to start journaling • Press{" "}
            <motion.kbd 
              className="px-3 py-2 bg-white/90 rounded-lg text-sm font-bold shadow-md border border-white/50"
              whileHover={{ scale: 1.1, y: -2 }}
            >
              Cmd+K
            </motion.kbd>{" "}
            for quick actions ✨
          </motion.p>
        </motion.div>
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

      {/* Family Manager */}
      <FamilyManager
        currentUser={user}
        isOpen={showFamily}
        onClose={() => setShowFamily(false)}
        onUserUpdate={updateUser}
      />
    </div>
  )
}

export default function AuthenticatedDashboard() {
  return (
    <TransitionProvider>
      <DashboardContent />
    </TransitionProvider>
  )
}