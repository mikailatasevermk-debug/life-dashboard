"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, Target, Trophy, Calendar, MapPin, Link as LinkIcon, 
  FileText, TrendingUp, Clock, Zap, Award, Users, 
  Activity, BarChart3, Timer, Play, Pause, Square,
  Edit3, Trash2, ExternalLink, Star, Medal, Flame
} from "lucide-react"
import { PracticeTracker } from "./PracticeTracker"
import { AchievementSystem } from "./AchievementSystem"
import { ResourceLinks } from "./ResourceLinks"
import { SportsAnalytics } from "./SportsAnalytics"

interface Sport {
  id: string
  name: string
  category: 'cardio' | 'strength' | 'flexibility' | 'team' | 'individual' | 'outdoor' | 'indoor'
  emoji: string
  color: string
  createdAt: Date
  isActive: boolean
}

interface Practice {
  id: string
  sportId: string
  name: string
  duration: number // in minutes
  intensity: 1 | 2 | 3 | 4 | 5
  notes?: string
  date: Date
  isCompleted: boolean
  metrics?: {
    distance?: number
    reps?: number
    weight?: number
    heartRate?: number
    calories?: number
  }
}

interface Achievement {
  id: string
  sportId: string
  title: string
  description: string
  type: 'milestone' | 'personal_record' | 'consistency' | 'improvement'
  icon: string
  unlockedAt?: Date
  progress: number
  target: number
  unit?: string
}

interface SportLink {
  id: string
  sportId: string
  title: string
  url: string
  type: 'video' | 'article' | 'tool' | 'community'
  description?: string
  addedAt: Date
}

export function SportsManager() {
  const [sports, setSports] = useState<Sport[]>([])
  const [practices, setPractices] = useState<Practice[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [links, setLinks] = useState<SportLink[]>([])
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null)
  const [showCreateSport, setShowCreateSport] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'practices' | 'achievements' | 'links' | 'analytics'>('overview')

  // Load data from localStorage
  useEffect(() => {
    const savedSports = localStorage.getItem('sports_data')
    const savedPractices = localStorage.getItem('sports_practices')
    const savedAchievements = localStorage.getItem('sports_achievements')
    const savedLinks = localStorage.getItem('sports_links')

    if (savedSports) setSports(JSON.parse(savedSports))
    if (savedPractices) setPractices(JSON.parse(savedPractices))
    if (savedAchievements) setAchievements(JSON.parse(savedAchievements))
    if (savedLinks) setLinks(JSON.parse(savedLinks))
  }, [])

  // Save data to localStorage
  const saveData = () => {
    localStorage.setItem('sports_data', JSON.stringify(sports))
    localStorage.setItem('sports_practices', JSON.stringify(practices))
    localStorage.setItem('sports_achievements', JSON.stringify(achievements))
    localStorage.setItem('sports_links', JSON.stringify(links))
  }

  useEffect(() => {
    saveData()
  }, [sports, practices, achievements, links])

  const sportCategories = [
    { id: 'cardio', name: 'Cardio', emoji: '🏃', color: '#EF4444' },
    { id: 'strength', name: 'Strength', emoji: '💪', color: '#F59E0B' },
    { id: 'flexibility', name: 'Flexibility', emoji: '🧘', color: '#10B981' },
    { id: 'team', name: 'Team Sports', emoji: '⚽', color: '#3B82F6' },
    { id: 'individual', name: 'Individual', emoji: '🎯', color: '#8B5CF6' },
    { id: 'outdoor', name: 'Outdoor', emoji: '🏔️', color: '#06B6D4' },
    { id: 'indoor', name: 'Indoor', emoji: '🏠', color: '#84CC16' }
  ]

  const createSport = (sportData: Omit<Sport, 'id' | 'createdAt'>) => {
    const newSport: Sport = {
      ...sportData,
      id: Date.now().toString(),
      createdAt: new Date()
    }
    setSports([...sports, newSport])
    setShowCreateSport(false)
  }

  const getRecentPractices = (sportId: string, limit = 5) => {
    return practices
      .filter(p => p.sportId === sportId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
  }

  const getSportAchievements = (sportId: string) => {
    return achievements.filter(a => a.sportId === sportId)
  }

  const getSportLinks = (sportId: string) => {
    return links.filter(l => l.sportId === sportId)
  }

  const getTotalPracticeTime = (sportId: string) => {
    return practices
      .filter(p => p.sportId === sportId && p.isCompleted)
      .reduce((total, p) => total + p.duration, 0)
  }

  const getStreakDays = (sportId: string) => {
    const sportPractices = practices
      .filter(p => p.sportId === sportId && p.isCompleted)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const practice of sportPractices) {
      const practiceDate = new Date(practice.date)
      practiceDate.setHours(0, 0, 0, 0)
      
      const diffDays = Math.floor((currentDate.getTime() - practiceDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === streak) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  if (sports.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center"
          >
            <span className="text-3xl">🏃</span>
          </motion.div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Start Your Sports Journey</h3>
          <p className="text-gray-600 mb-6">Track your favorite sports, log practices, and achieve your fitness goals</p>
          
          <motion.button
            onClick={() => setShowCreateSport(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            Add Your First Sport
          </motion.button>
        </div>

        {/* Quick Sport Templates */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { name: 'Running', emoji: '🏃', category: 'cardio' as const },
            { name: 'Gym', emoji: '💪', category: 'strength' as const },
            { name: 'Yoga', emoji: '🧘', category: 'flexibility' as const },
            { name: 'Football', emoji: '⚽', category: 'team' as const },
            { name: 'Swimming', emoji: '🏊', category: 'cardio' as const },
            { name: 'Cycling', emoji: '🚴', category: 'cardio' as const },
            { name: 'Tennis', emoji: '🎾', category: 'individual' as const },
            { name: 'Basketball', emoji: '🏀', category: 'team' as const }
          ].map(sport => (
            <motion.button
              key={sport.name}
              onClick={() => createSport({
                name: sport.name,
                category: sport.category,
                emoji: sport.emoji,
                color: sportCategories.find(c => c.id === sport.category)?.color || '#F59E0B',
                isActive: true
              })}
              className="p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-2xl mb-2">{sport.emoji}</div>
              <div className="text-sm font-medium text-gray-900">{sport.name}</div>
              <div className="text-xs text-gray-500 capitalize">{sport.category}</div>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  if (!selectedSport) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Your Sports</h3>
          <motion.button
            onClick={() => setShowCreateSport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            Add Sport
          </motion.button>
        </div>

        {/* Sports Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sports.map(sport => {
            const recentPractices = getRecentPractices(sport.id, 3)
            const totalTime = getTotalPracticeTime(sport.id)
            const streak = getStreakDays(sport.id)
            const sportAchievements = getSportAchievements(sport.id)

            return (
              <motion.div
                key={sport.id}
                onClick={() => setSelectedSport(sport)}
                className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${sport.color}20` }}
                  >
                    {sport.emoji}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{sport.name}</h4>
                    <p className="text-sm text-gray-500 capitalize">{sport.category}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Time</span>
                    <span className="font-semibold">{Math.floor(totalTime / 60)}h {totalTime % 60}m</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Streak</span>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold">{streak} days</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Achievements</span>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold">{sportAchievements.filter(a => a.unlockedAt).length}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Recent Activity</span>
                    <span className="font-semibold">
                      {recentPractices.length > 0 
                        ? `${recentPractices.length} practices` 
                        : 'No activity'
                      }
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  // Individual Sport Dashboard will continue in the next part...
  return (
    <div className="space-y-6">
      {/* Sport Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSelectedSport(null)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ←
        </button>
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${selectedSport.color}20` }}
        >
          {selectedSport.emoji}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{selectedSport.name}</h2>
          <p className="text-sm text-gray-500 capitalize">{selectedSport.category} Sport</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', name: 'Overview', icon: Activity },
          { id: 'practices', name: 'Practices', icon: Timer },
          { id: 'achievements', name: 'Achievements', icon: Trophy },
          { id: 'links', name: 'Resources', icon: LinkIcon },
          { id: 'analytics', name: 'Analytics', icon: BarChart3 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:block">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Total Time</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {Math.floor(getTotalPracticeTime(selectedSport.id) / 60)}h {getTotalPracticeTime(selectedSport.id) % 60}m
                </div>
                <div className="text-xs text-blue-600">all time</div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Streak</span>
                </div>
                <div className="text-2xl font-bold text-orange-900">{getStreakDays(selectedSport.id)}</div>
                <div className="text-xs text-orange-600">days</div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Achievements</span>
                </div>
                <div className="text-2xl font-bold text-yellow-900">
                  {getSportAchievements(selectedSport.id).filter(a => a.unlockedAt).length}
                </div>
                <div className="text-xs text-yellow-600">unlocked</div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Practices</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {practices.filter(p => p.sportId === selectedSport.id && p.isCompleted).length}
                </div>
                <div className="text-xs text-green-600">completed</div>
              </div>
            </div>
            
            {/* Recent Practices */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Recent Activity</h4>
              {getRecentPractices(selectedSport.id, 5).length > 0 ? (
                <div className="space-y-2">
                  {getRecentPractices(selectedSport.id, 5).map(practice => (
                    <div key={practice.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{practice.name}</div>
                        <div className="text-xs text-gray-500">
                          {practice.duration}m • Intensity {practice.intensity}/5 • {new Date(practice.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No recent practices. Start your first micro-practice!</p>
              )}
            </div>
          </div>
        )}
        {activeTab === 'practices' && (
          <PracticeTracker 
            sportId={selectedSport.id} 
            sportName={selectedSport.name} 
            sportEmoji={selectedSport.emoji} 
          />
        )}
        {activeTab === 'achievements' && (
          <AchievementSystem 
            sportId={selectedSport.id} 
            sportName={selectedSport.name} 
            sportEmoji={selectedSport.emoji} 
          />
        )}
        {activeTab === 'links' && (
          <ResourceLinks 
            sportId={selectedSport.id} 
            sportName={selectedSport.name} 
            sportEmoji={selectedSport.emoji} 
          />
        )}
        {activeTab === 'analytics' && (
          <SportsAnalytics 
            sportId={selectedSport.id} 
            sportName={selectedSport.name} 
            sportEmoji={selectedSport.emoji} 
          />
        )}
      </div>
    </div>
  )
}