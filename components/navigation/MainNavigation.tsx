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
  Bell,
  Search,
  Home,
  ChevronDown,
  Sparkles,
  Activity,
  BookOpen,
  HelpCircle
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

interface MainNavigationProps {
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

export function MainNavigation({ 
  user, 
  userProgress, 
  onShowSettings, 
  onShowFamily, 
  onShowCommandPalette,
  onLogout 
}: MainNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navigationItems = [
    {
      group: "Dashboard",
      items: [
        { name: "Home", href: "/dashboard", icon: Home, color: "text-blue-600" },
        { name: "Activity", href: "/activity", icon: Activity, color: "text-green-600" }
      ]
    },
    {
      group: "Tools",
      items: [
        { name: "Calendar", href: "/schedule", icon: Calendar, color: "text-purple-600" },
        { name: "Timeline", href: "/timeline", icon: Clock, color: "text-orange-600" },
        { name: "Notes", href: "/notes", icon: BookOpen, color: "text-indigo-600" }
      ]
    },
    {
      group: "Social",
      items: [
        { name: "Family", action: onShowFamily, icon: Users, color: "text-pink-600" }
      ]
    }
  ]

  return (
    <>
      {/* Main Navigation Bar */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo/Brand */}
            <div className="flex items-center gap-3">
              <motion.div 
                className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Life Dashboard
                </h1>
                <p className="text-xs text-gray-600">Level {userProgress.level} • {userProgress.coins} 🪙</p>
              </div>
            </div>

            {/* Center: Search & Quick Actions (Desktop) */}
            <div className="hidden md:flex items-center gap-4">
              <motion.button
                onClick={onShowCommandPalette}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100/80 hover:bg-gray-200/80 rounded-xl transition-all duration-200 text-sm text-gray-600"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Search className="w-4 h-4" />
                <span>Quick actions...</span>
                <kbd className="px-2 py-1 bg-white/70 rounded text-xs font-semibold">⌘K</kbd>
              </motion.button>
            </div>

            {/* Right: Navigation & Profile */}
            <div className="flex items-center gap-3">
              {/* Desktop Navigation Links */}
              <div className="hidden lg:flex items-center gap-2">
                <motion.div whileHover={{ y: -1 }}>
                  <Link
                    href="/schedule"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100/80 transition-all duration-200 text-sm font-medium text-gray-700"
                  >
                    <Calendar className="w-4 h-4 text-purple-600" />
                    Schedule
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ y: -1 }}>
                  <Link
                    href="/timeline"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100/80 transition-all duration-200 text-sm font-medium text-gray-700"
                  >
                    <Clock className="w-4 h-4 text-orange-600" />
                    Timeline
                  </Link>
                </motion.div>

                <motion.button
                  onClick={onShowFamily}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100/80 transition-all duration-200 text-sm font-medium text-gray-700"
                  whileHover={{ y: -1 }}
                >
                  <Users className="w-4 h-4 text-pink-600" />
                  Family
                </motion.button>
              </div>

              {/* Notifications */}
              <motion.button
                className="p-2 rounded-lg hover:bg-gray-100/80 transition-all duration-200 relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </motion.button>

              {/* Search Button (Mobile) */}
              <motion.button
                onClick={onShowCommandPalette}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100/80 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="w-5 h-5 text-gray-600" />
              </motion.button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100/80 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-800 truncate max-w-32">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-600 truncate">Level {userProgress.level}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </motion.button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden z-50"
                    >
                      {/* User Info Header */}
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-b border-gray-200/50">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-lg font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                            <p className="text-sm text-gray-600 truncate">{user.email}</p>
                            {user.familyId && (
                              <p className="text-xs text-pink-600 font-medium mt-1">
                                👨‍👩‍👧‍👦 Family Member
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Progress Stats */}
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <div className="flex items-center gap-3">
                            <span className="text-purple-600 font-semibold">Lv. {userProgress.level}</span>
                            <span className="text-yellow-600 font-semibold">🪙 {userProgress.coins}</span>
                            <span className="text-blue-600 font-semibold">⭐ {userProgress.xp}</span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <motion.button
                          onClick={() => {
                            setIsProfileDropdownOpen(false)
                            // Navigate to profile page
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                          whileHover={{ x: 4 }}
                        >
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">My Profile</span>
                        </motion.button>

                        <motion.button
                          onClick={() => {
                            setIsProfileDropdownOpen(false)
                            onShowSettings()
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                          whileHover={{ x: 4 }}
                        >
                          <Settings className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium">Settings</span>
                        </motion.button>

                        <motion.button
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                          whileHover={{ x: 4 }}
                        >
                          <HelpCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">Help & Support</span>
                        </motion.button>

                        <div className="my-2 border-t border-gray-200"></div>

                        <motion.button
                          onClick={() => {
                            setIsProfileDropdownOpen(false)
                            onLogout()
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors text-left"
                          whileHover={{ x: 4 }}
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm font-medium">Sign Out</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100/80 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Slide-out Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl shadow-2xl border-l border-gray-200/50 z-40 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Navigation</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Quick Search */}
                <motion.button
                  onClick={() => {
                    setIsMenuOpen(false)
                    onShowCommandPalette()
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-gray-100/80 rounded-xl mb-6 hover:bg-gray-200/80 transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  <Search className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Search & Quick Actions</span>
                  <kbd className="ml-auto px-2 py-1 bg-white/70 rounded text-xs font-semibold">⌘K</kbd>
                </motion.button>

                {/* Navigation Groups */}
                <div className="space-y-6">
                  {navigationItems.map((group, groupIndex) => (
                    <div key={group.group}>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        {group.group}
                      </h3>
                      <div className="space-y-1">
                        {group.items.map((item, itemIndex) => (
                          <motion.div
                            key={item.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (groupIndex * 0.1) + (itemIndex * 0.05) }}
                          >
                            {item.href ? (
                              <Link
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                                <span className="font-medium text-gray-900">{item.name}</span>
                              </Link>
                            ) : (
                              <button
                                onClick={() => {
                                  setIsMenuOpen(false)
                                  item.action?.()
                                }}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 transition-colors text-left"
                              >
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                                <span className="font-medium text-gray-900">{item.name}</span>
                              </button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}