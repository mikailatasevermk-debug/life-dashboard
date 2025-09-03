"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, ArrowRight, Plus, Calendar, Settings, Home, 
  FileText, Target, Heart, Briefcase, Users, Building2, 
  ShoppingBag, Church, Coins, Trophy, Download, RotateCcw,
  Moon, Sun, Volume2, VolumeX
} from "lucide-react"
import { useTransition } from "@/contexts/TransitionContext"
import { SPACES } from "@/lib/spaces"
import { useUserProgress } from "@/lib/user-progress"

interface CommandAction {
  id: string
  title: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  keywords: string[]
  action: () => void
  category: 'navigation' | 'create' | 'settings' | 'data'
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { slideToSpace, slideToHome } = useTransition()
  const { addCoins, COIN_REWARDS } = useUserProgress()

  // Define all available commands
  const commands: CommandAction[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      description: 'Return to main dashboard',
      icon: Home,
      keywords: ['home', 'dashboard', 'main'],
      category: 'navigation',
      action: () => { slideToHome(); onClose() }
    },
    {
      id: 'nav-schedule',
      title: 'Open Schedule',
      description: 'View and manage events',
      icon: Calendar,
      keywords: ['schedule', 'calendar', 'events', 'appointments'],
      category: 'navigation',
      action: () => { window.location.href = '/schedule'; onClose() }
    },
    
    // Space Navigation
    ...SPACES.map(space => ({
      id: `space-${space.type.toLowerCase()}`,
      title: `Open ${space.name}`,
      description: `Go to ${space.name} space`,
      icon: getSpaceIcon(space.iconName),
      keywords: [space.name.toLowerCase(), space.type.toLowerCase(), 'space', 'category'],
      category: 'navigation' as const,
      action: () => { slideToSpace(space); onClose() }
    })),

    // Creation Actions
    {
      id: 'new-note',
      title: 'New Note',
      description: 'Create a new note in current space',
      icon: FileText,
      keywords: ['note', 'write', 'journal', 'create', 'new'],
      category: 'create',
      action: () => { 
        // Trigger note creation in current space
        addCoins(COIN_REWARDS.CREATE_NOTE)
        onClose()
        // You could dispatch an event here to open note modal
      }
    },
    {
      id: 'new-goal',
      title: 'New Goal',
      description: 'Add a new goal to track',
      icon: Target,
      keywords: ['goal', 'target', 'objective', 'create', 'new'],
      category: 'create',
      action: () => { 
        addCoins(5)
        onClose()
        // Navigate to a space to add goal
        slideToSpace(SPACES[0])
      }
    },
    {
      id: 'new-event',
      title: 'New Event',
      description: 'Schedule a new event',
      icon: Calendar,
      keywords: ['event', 'appointment', 'meeting', 'schedule', 'create', 'new'],
      category: 'create',
      action: () => { 
        window.location.href = '/schedule'
        onClose()
      }
    },

    // Settings Actions
    {
      id: 'open-settings',
      title: 'Open Settings',
      description: 'Configure app preferences',
      icon: Settings,
      keywords: ['settings', 'preferences', 'config', 'options'],
      category: 'settings',
      action: () => {
        onClose()
        // Dispatch settings open event
        window.dispatchEvent(new CustomEvent('open-settings'))
      }
    },
    {
      id: 'toggle-sound',
      title: 'Toggle Sound Effects',
      description: 'Enable/disable sound effects',
      icon: Volume2,
      keywords: ['sound', 'audio', 'effects', 'mute', 'toggle'],
      category: 'settings',
      action: () => {
        const settings = JSON.parse(localStorage.getItem('app_settings') || '{"soundEnabled":true}')
        settings.soundEnabled = !settings.soundEnabled
        localStorage.setItem('app_settings', JSON.stringify(settings))
        onClose()
      }
    },

    // Data Actions
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download backup of all your data',
      icon: Download,
      keywords: ['export', 'backup', 'download', 'save', 'data'],
      category: 'data',
      action: () => {
        // Trigger export
        const data = {
          userProgress: localStorage.getItem('userProgress'),
          settings: localStorage.getItem('app_settings'),
          goals: Object.keys(localStorage).filter(key => key.startsWith('goals_')).reduce((acc, key) => {
            acc[key] = localStorage.getItem(key)
            return acc
          }, {} as Record<string, string | null>),
          notes: Object.keys(localStorage).filter(key => key.startsWith('notes_')).reduce((acc, key) => {
            acc[key] = localStorage.getItem(key)
            return acc
          }, {} as Record<string, string | null>),
          events: localStorage.getItem('calendar_events')
        }
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `life-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        onClose()
      }
    },
    {
      id: 'get-coins',
      title: 'Get 50 Coins',
      description: 'Reward yourself with coins',
      icon: Coins,
      keywords: ['coins', 'reward', 'bonus', 'currency'],
      category: 'data',
      action: () => {
        addCoins(50)
        onClose()
      }
    }
  ]

  // Filter commands based on search
  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(search.toLowerCase()) ||
    command.description?.toLowerCase().includes(search.toLowerCase()) ||
    command.keywords.some(keyword => keyword.toLowerCase().includes(search.toLowerCase()))
  )

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = []
    }
    acc[command.category].push(command)
    return acc
  }, {} as Record<string, CommandAction[]>)

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex])

  const categoryLabels = {
    navigation: 'Navigation',
    create: 'Create New',
    settings: 'Settings',
    data: 'Data & Tools'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[15%] left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50"
          >
            <div className="mx-4">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search for commands..."
                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500"
                  />
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
                    ESC
                  </kbd>
                </div>

                {/* Commands List */}
                <div className="max-h-96 overflow-auto">
                  {Object.entries(groupedCommands).map(([category, commands]) => (
                    <div key={category}>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                        {categoryLabels[category as keyof typeof categoryLabels]}
                      </div>
                      {commands.map((command, index) => {
                        const globalIndex = filteredCommands.indexOf(command)
                        const Icon = command.icon
                        return (
                          <motion.button
                            key={command.id}
                            onClick={() => command.action()}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-purple-50 transition-colors ${
                              selectedIndex === globalIndex ? 'bg-purple-100' : ''
                            }`}
                            whileHover={{ x: 4 }}
                          >
                            <div className={`p-2 rounded-lg ${
                              selectedIndex === globalIndex 
                                ? 'bg-purple-200 text-purple-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{command.title}</p>
                              {command.description && (
                                <p className="text-sm text-gray-500">{command.description}</p>
                              )}
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </motion.button>
                        )
                      })}
                    </div>
                  ))}

                  {filteredCommands.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No commands found</p>
                      <p className="text-sm">Try a different search term</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white rounded border">↑↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white rounded border">↵</kbd>
                      Select
                    </span>
                  </div>
                  <span>{filteredCommands.length} commands</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Helper function to get space icons
function getSpaceIcon(iconName: string) {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'briefcase': Briefcase,
    'users': Users,
    'home': Home,
    'heart': Heart,
    'shopping-bag': ShoppingBag,
    'building-2': Building2,
    'church': Church
  }
  return iconMap[iconName] || FileText
}