"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Menu, 
  X, 
  User,
  Settings, 
  Calendar, 
  Clock, 
  Users, 
  LogOut,
  Search,
  ChevronDown,
  Home
} from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  familyId?: string
  role: 'owner' | 'member'
  createdAt: string
}

interface MinimalNavigationProps {
  user: User
  userProgress: {
    level: number
    coins: number
    xp: number
  }
  onShowSettings: () => void
  onShowFamily: () => void
  onShowCommandPalette: () => void
  onLogout: () => void
}

export function MinimalNavigation({ 
  user, 
  userProgress, 
  onShowSettings, 
  onShowFamily, 
  onShowCommandPalette,
  onLogout 
}: MinimalNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navItems = [
    { name: "Home", href: "/dashboard", icon: "🏰", iconComponent: Home },
    { name: "Schedule", href: "/schedule", icon: "🗓️", iconComponent: Calendar },
    { name: "Timeline", href: "/timeline", icon: "⏱️", iconComponent: Clock },
    { name: "Family", action: onShowFamily, icon: "👨‍👩‍👧‍👦", iconComponent: Users }
  ]

  return (
    <>
      {/* Transparent Top Bar */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-40 bg-white/20 backdrop-blur-xl border-b border-white/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            
            {/* Left: Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-800 hover:text-purple-600 transition-colors">
              <motion.div 
                className="text-4xl transform hover:scale-110 transition-transform duration-200"
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
                transition={{ duration: 0.5 }}
              >
                🚀
              </motion.div>
              <span className="font-semibold text-sm hidden sm:block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Life Dashboard</span>
            </Link>

            {/* Center: Navigation (Desktop) */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <div key={item.name}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                    >
                      <motion.span 
                        className="text-2xl block"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        {item.icon}
                      </motion.span>
                      <span className="hidden lg:block font-medium">{item.name}</span>
                    </Link>
                  ) : (
                    <button
                      onClick={item.action}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                    >
                      <motion.span 
                        className="text-2xl block"
                        whileHover={{ scale: 1.2, rotate: -5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        {item.icon}
                      </motion.span>
                      <span className="hidden lg:block font-medium">{item.name}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              
              {/* Search */}
              <button
                onClick={onShowCommandPalette}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                title="Search (⌘K)"
              >
                <motion.span 
                  className="text-2xl block"
                  whileHover={{ scale: 1.3, rotate: 15 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  🔎
                </motion.span>
              </button>

              {/* Profile */}
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="p-2 text-gray-700 hover:bg-white/30 rounded-xl transition-all duration-200 backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-xl border-2 border-white/20"
                    whileHover={{ rotate: 45, scale: 1.1 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <span className="text-2xl">🔷</span>
                  </motion.div>
                </motion.button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-52 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/50 overflow-hidden z-50"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-white/30 bg-gradient-to-r from-purple-50 to-pink-50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">👨‍💻</span>
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        </div>
                        <p className="text-xs text-gray-600 truncate mb-1">{user.email}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span>🎯 Level {userProgress.level}</span>
                          <span>💰 {userProgress.coins}</span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-white/50 transition-colors">
                          <span className="text-xl">👨‍🎨</span>
                          <span className="font-medium">Profile</span>
                        </button>
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false)
                            onShowSettings()
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-white/50 transition-colors"
                        >
                          <span className="text-xl">🛠️</span>
                          <span className="font-medium">Settings</span>
                        </button>
                        <div className="border-t border-white/30 my-1"></div>
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false)
                            onLogout()
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <span className="text-xl">🚀</span>
                          <span className="font-medium">Blast Off!</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu */}
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.span 
                  className="text-2xl block"
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMenuOpen ? '🎭' : '🎪'}
                </motion.span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/10 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-14 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/50 z-40 md:hidden overflow-hidden"
            >
              <div className="py-2">
                {/* Search */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    onShowCommandPalette()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-white/50 transition-colors border-b border-white/30"
                >
                  <span className="text-xl">🔍</span>
                  <span className="font-medium">Search</span>
                  <span className="ml-auto text-xs text-gray-500">⌘K</span>
                </button>

                {/* Navigation */}
                {navItems.map((item) => (
                  <div key={item.name}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-white/50 transition-colors"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          item.action?.()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-white/50 transition-colors"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}