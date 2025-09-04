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
  Home,
  Trophy,
  BarChart3,
  Bell,
  Palette,
  Moon,
  Sun,
  Check,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/contexts/ThemeContext"
import { THEMES } from "@/lib/themes"

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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [notifications, setNotifications] = useState({ enabled: true, count: 3 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { resolvedSystemTheme, setSystemTheme, currentTheme, setTheme } = useTheme()

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
                    className="w-11 h-11 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center shadow-md border border-white/30 overflow-hidden relative"
                    whileHover={{ scale: 1.08, rotate: 2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {/* Artistic geometric pattern */}
                    <div className="relative flex flex-col items-center justify-center">
                      {/* Top curved line */}
                      <motion.div 
                        className="w-5 h-0.5 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full mb-1"
                        style={{ clipPath: 'ellipse(70% 100% at 50% 0%)' }}
                        whileHover={{ scaleX: 1.2 }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                      />
                      {/* Center circle with dot */}
                      <motion.div 
                        className="w-2 h-2 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full mb-1 relative"
                        whileHover={{ scale: 1.3, rotate: 45 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        <div className="absolute inset-0.5 bg-white rounded-full opacity-40"></div>
                      </motion.div>
                      {/* Bottom curved line */}
                      <motion.div 
                        className="w-5 h-0.5 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full"
                        style={{ clipPath: 'ellipse(70% 100% at 50% 100%)' }}
                        whileHover={{ scaleX: 1.2 }}
                        transition={{ duration: 0.2, delay: 0.15 }}
                      />
                    </div>
                    
                    {/* Subtle glow effect on hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-purple-400/0 rounded-xl"
                      whileHover={{ 
                        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)" 
                      }}
                      transition={{ duration: 0.3 }}
                    />
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
                      className="absolute right-0 top-full mt-2 w-72 bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* User Info Header */}
                      <div className="p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-b border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{user.name}</h4>
                            <p className="text-xs text-gray-600 truncate">{user.email}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                <span className="text-yellow-500">🎯</span> Level {userProgress.level}
                              </span>
                              <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                <span>💰</span> {userProgress.coins}
                              </span>
                              <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                <span>⭐</span> {userProgress.xp} XP
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Level Progress</span>
                            <span>{userProgress.xp % 100}/100 XP</span>
                          </div>
                          <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                              initial={{ width: 0 }}
                              animate={{ width: `${userProgress.xp % 100}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="p-2 border-b border-gray-100">
                        <div className="text-xs font-semibold text-gray-500 px-3 py-1 mb-1">QUICK ACTIONS</div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('My Profile clicked')
                            // Navigate to profile - implement this functionality
                            // setIsProfileOpen(false) // Only close when navigating
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span className="font-medium">My Profile</span>
                          <ChevronDown className="w-3 h-3 ml-auto transform -rotate-90" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('Achievements clicked')
                            setNotifications({ ...notifications, count: 0 }) // Clear notification count
                            // Show achievements - implement this functionality
                            // setIsProfileOpen(false) // Only close when showing achievements
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors relative"
                        >
                          <Trophy className="w-4 h-4" />
                          <span className="font-medium">Achievements</span>
                          {notifications.count > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                              {notifications.count}
                            </span>
                          )}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('Statistics clicked')
                            // Show statistics - implement this functionality
                            // setIsProfileOpen(false) // Only close when showing statistics
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span className="font-medium">Statistics</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('Family Hub clicked')
                            setIsProfileOpen(false)
                            onShowFamily()
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Users className="w-4 h-4" />
                          <span className="font-medium">Family Hub</span>
                        </button>
                      </div>

                      {/* Preferences */}
                      <div className="p-2 border-b border-gray-100">
                        <div className="text-xs font-semibold text-gray-500 px-3 py-1 mb-1">PREFERENCES</div>
                        
                        {/* Dark Mode Toggle */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('Dark Mode toggle clicked')
                            setSystemTheme(resolvedSystemTheme === 'dark' ? 'light' : 'dark')
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {resolvedSystemTheme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                            <span className="font-medium">Dark Mode</span>
                          </div>
                          <motion.div
                            className={`w-10 h-6 rounded-full p-1 ${resolvedSystemTheme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSystemTheme(resolvedSystemTheme === 'dark' ? 'light' : 'dark')
                            }}
                          >
                            <motion.div
                              className="w-4 h-4 bg-white rounded-full shadow-md"
                              animate={{ x: resolvedSystemTheme === 'dark' ? 16 : 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          </motion.div>
                        </button>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('Theme & Colors clicked')
                            setShowThemeSelector(!showThemeSelector)
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Palette className="w-4 h-4" />
                          <span className="font-medium">Theme & Colors</span>
                        </button>

                        {/* Theme Selector */}
                        <AnimatePresence>
                          {showThemeSelector && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="px-3 py-2 overflow-hidden"
                            >
                              <div className="grid grid-cols-4 gap-2 mt-2">
                                {THEMES.slice(0, 8).map((theme) => (
                                  <motion.button
                                    key={theme.id}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setTheme(theme.id)
                                      console.log(`Theme changed to: ${theme.name}`)
                                    }}
                                    className={`w-8 h-8 rounded-lg border-2 transition-all relative overflow-hidden ${
                                      currentTheme.id === theme.id 
                                        ? 'border-blue-500 ring-2 ring-blue-200' 
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    style={{ background: theme.background }}
                                    title={theme.name}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    {currentTheme.id === theme.id && (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white drop-shadow-lg" />
                                      </div>
                                    )}
                                  </motion.button>
                                ))}
                              </div>
                              <div className="text-xs text-gray-500 mt-2 text-center">
                                Current: {currentTheme.name}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('Notifications toggle clicked')
                            setNotifications({ ...notifications, enabled: !notifications.enabled })
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Bell className="w-4 h-4" />
                            <span className="font-medium">Notifications</span>
                          </div>
                          {notifications.enabled ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-gray-400" />
                          )}
                        </button>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('Settings clicked')
                            setIsProfileOpen(false)
                            onShowSettings()
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="font-medium">Settings</span>
                        </button>
                      </div>

                      {/* Sign Out */}
                      <div className="p-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('Sign Out clicked')
                            setIsProfileOpen(false)
                            setShowLogoutConfirm(true)
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>

                      {/* Keyboard Shortcuts Hint */}
                      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Quick Search</span>
                          <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 font-mono">⌘K</kbd>
                        </div>
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

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm overflow-hidden">
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Sign Out?
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to sign out? You'll need to sign in again to access your dashboard.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowLogoutConfirm(false)
                        onLogout()
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}