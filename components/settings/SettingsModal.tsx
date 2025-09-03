"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, Settings, User, Bell, Palette, Database, Download, 
  Upload, Trash2, RefreshCw, Moon, Sun, Monitor, 
  Volume2, VolumeX, Coins, Trophy, RotateCcw
} from "lucide-react"
import { ThemeSelector } from "./ThemeSelector"
import { useTheme } from "@/contexts/ThemeContext"

interface SettingsData {
  theme: 'light' | 'dark' | 'auto'
  soundEnabled: boolean
  notifications: {
    goals: boolean
    events: boolean
    achievements: boolean
  }
  appearance: {
    animations: boolean
    coinAnimations: boolean
    backgroundEffects: boolean
  }
  privacy: {
    analytics: boolean
    shareData: boolean
  }
}

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { themeId, setTheme, systemTheme, setSystemTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'data' | 'about'>('general')
  const [settings, setSettings] = useState<SettingsData>({
    theme: 'auto',
    soundEnabled: true,
    notifications: {
      goals: true,
      events: true,
      achievements: true
    },
    appearance: {
      animations: true,
      coinAnimations: true,
      backgroundEffects: true
    },
    privacy: {
      analytics: false,
      shareData: false
    }
  })

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = (newSettings: SettingsData) => {
    setSettings(newSettings)
    localStorage.setItem('app_settings', JSON.stringify(newSettings))
  }

  const exportData = () => {
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
      events: localStorage.getItem('calendar_events'),
      loveCounts: Object.keys(localStorage).filter(key => key.startsWith('loveCount_')).reduce((acc, key) => {
        acc[key] = localStorage.getItem(key)
        return acc
      }, {} as Record<string, string | null>),
      moods: Object.keys(localStorage).filter(key => key.startsWith('mood_')).reduce((acc, key) => {
        acc[key] = localStorage.getItem(key)
        return acc
      }, {} as Record<string, string | null>)
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `life-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        
        // Restore all data
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'goals' || key === 'notes' || key === 'loveCounts' || key === 'moods') {
            Object.entries(value as Record<string, string>).forEach(([subKey, subValue]) => {
              if (subValue) localStorage.setItem(subKey, subValue)
            })
          } else if (value) {
            localStorage.setItem(key === 'userProgress' ? 'userProgress' : 
                              key === 'settings' ? 'app_settings' : 
                              key === 'events' ? 'calendar_events' : key, value as string)
          }
        })
        
        alert('Data imported successfully! Please refresh the page.')
      } catch (error) {
        alert('Error importing data. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  const resetData = () => {
    if (!confirm('Are you sure? This will delete ALL your data (notes, goals, events, progress). This cannot be undone.')) return
    
    // Clear all app data
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.startsWith('userProgress') || 
      key.startsWith('goals_') || 
      key.startsWith('notes_') || 
      key.startsWith('loveCount_') || 
      key.startsWith('mood_') ||
      key === 'calendar_events' ||
      key === 'app_settings'
    )
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    alert('All data has been reset. Please refresh the page.')
  }

  const resetProgress = () => {
    if (!confirm('Reset your coins, XP, and level? Your notes and goals will remain.')) return
    
    localStorage.removeItem('userProgress')
    alert('Progress reset! Please refresh the page.')
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'data', name: 'Data', icon: Database },
    { id: 'about', name: 'About', icon: User }
  ] as const

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Settings className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Settings</h2>
                    <p className="text-sm text-gray-600">Customize your Life Dashboard</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex h-[600px]">
                {/* Sidebar */}
                <div className="w-64 bg-gray-50/50 border-r border-gray-200 p-4">
                  <nav className="space-y-1">
                    {tabs.map(tab => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            activeTab === tab.id 
                              ? 'bg-purple-100 text-purple-700 font-medium' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.name}
                        </button>
                      )
                    })}
                  </nav>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-auto">
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h3>
                        
                        {/* Sound */}
                        <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-purple-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                            <div>
                              <p className="font-medium text-gray-800">Sound Effects</p>
                              <p className="text-sm text-gray-600">Play sounds for coin collection and interactions</p>
                            </div>
                          </div>
                          <button
                            onClick={() => saveSettings({...settings, soundEnabled: !settings.soundEnabled})}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.soundEnabled ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>

                        {/* Notifications */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800">Notifications</h4>
                          {Object.entries(settings.notifications).map(([key, enabled]) => (
                            <div key={key} className="flex items-center justify-between p-3 bg-white/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Bell className="w-4 h-4 text-gray-500" />
                                <span className="text-sm capitalize">{key} notifications</span>
                              </div>
                              <button
                                onClick={() => saveSettings({
                                  ...settings, 
                                  notifications: { ...settings.notifications, [key]: !enabled }
                                })}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                  enabled ? 'bg-purple-600' : 'bg-gray-300'
                                }`}
                              >
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                  enabled ? 'translate-x-5' : 'translate-x-1'
                                }`} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'appearance' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Appearance Settings</h3>
                        
                        {/* Background Themes */}
                        <ThemeSelector 
                          currentTheme={themeId}
                          onThemeChange={setTheme}
                        />
                        
                        <hr className="my-6" />
                        
                        {/* System Theme (kept for compatibility) */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800">System Theme</h4>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { key: 'light', name: 'Light', icon: Sun },
                              { key: 'dark', name: 'Dark', icon: Moon },
                              { key: 'auto', name: 'Auto', icon: Monitor }
                            ].map(theme => {
                              const Icon = theme.icon
                              return (
                                <button
                                  key={theme.key}
                                  onClick={() => setSystemTheme(theme.key as any)}
                                  className={`p-3 rounded-lg border-2 transition-colors ${
                                    systemTheme === theme.key 
                                      ? 'border-purple-500 bg-purple-50' 
                                      : 'border-gray-200 bg-white/50 hover:bg-white/70'
                                  }`}
                                >
                                  <Icon className="w-6 h-6 mx-auto mb-2" />
                                  <p className="text-sm font-medium">{theme.name}</p>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Animations */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800">Visual Effects</h4>
                          {Object.entries(settings.appearance).map(([key, enabled]) => (
                            <div key={key} className="flex items-center justify-between p-3 bg-white/30 rounded-lg">
                              <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                              <button
                                onClick={() => saveSettings({
                                  ...settings, 
                                  appearance: { ...settings.appearance, [key]: !enabled }
                                })}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                  enabled ? 'bg-purple-600' : 'bg-gray-300'
                                }`}
                              >
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                  enabled ? 'translate-x-5' : 'translate-x-1'
                                }`} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'data' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Management</h3>
                        
                        <div className="space-y-4">
                          {/* Export Data */}
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3 mb-2">
                              <Download className="w-5 h-5 text-blue-600" />
                              <h4 className="font-medium text-blue-800">Export Data</h4>
                            </div>
                            <p className="text-sm text-blue-700 mb-3">Download a backup of all your notes, goals, events, and progress.</p>
                            <button
                              onClick={exportData}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Download Backup
                            </button>
                          </div>

                          {/* Import Data */}
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-3 mb-2">
                              <Upload className="w-5 h-5 text-green-600" />
                              <h4 className="font-medium text-green-800">Import Data</h4>
                            </div>
                            <p className="text-sm text-green-700 mb-3">Restore from a previous backup file.</p>
                            <label className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                              <input type="file" accept=".json" onChange={importData} className="hidden" />
                              Choose Backup File
                            </label>
                          </div>

                          {/* Reset Progress */}
                          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center gap-3 mb-2">
                              <RotateCcw className="w-5 h-5 text-yellow-600" />
                              <h4 className="font-medium text-yellow-800">Reset Progress</h4>
                            </div>
                            <p className="text-sm text-yellow-700 mb-3">Reset coins, XP, and level. Notes and goals will remain.</p>
                            <button
                              onClick={resetProgress}
                              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                            >
                              Reset Progress
                            </button>
                          </div>

                          {/* Reset All Data */}
                          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center gap-3 mb-2">
                              <Trash2 className="w-5 h-5 text-red-600" />
                              <h4 className="font-medium text-red-800">Reset All Data</h4>
                            </div>
                            <p className="text-sm text-red-700 mb-3">⚠️ This will delete everything. Make sure to export your data first!</p>
                            <button
                              onClick={resetData}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Delete All Data
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'about' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">About Life Dashboard</h3>
                        
                        <div className="space-y-4">
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                            <h4 className="font-medium text-purple-800 mb-2">Version 1.0.0</h4>
                            <p className="text-sm text-purple-700">A gamified life tracking dashboard built with Next.js, TypeScript, and Tailwind CSS.</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/50 rounded-lg text-center">
                              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                              <h4 className="font-medium text-gray-800">Achievements</h4>
                              <p className="text-sm text-gray-600">Track your progress</p>
                            </div>
                            <div className="p-4 bg-white/50 rounded-lg text-center">
                              <Coins className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                              <h4 className="font-medium text-gray-800">Gamification</h4>
                              <p className="text-sm text-gray-600">Earn rewards</p>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-2">Features</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Notes and journaling in life categories</li>
                              <li>• Goal tracking with progress bars</li>
                              <li>• Event scheduling and calendar</li>
                              <li>• Mood tracking and love counter</li>
                              <li>• Coin/XP system with achievements</li>
                              <li>• Data export/import and backup</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}