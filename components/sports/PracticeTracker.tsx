"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Play, Pause, Square, Plus, Clock, Zap, Target, 
  CheckCircle, Calendar, TrendingUp, Timer, 
  Activity, Heart, Flame, Award, RotateCcw
} from "lucide-react"

interface MicroPractice {
  id: string
  sportId: string
  name: string
  description?: string
  estimatedMinutes: number
  category: 'warm-up' | 'skill' | 'strength' | 'endurance' | 'cool-down' | 'technique'
  difficulty: 1 | 2 | 3 | 4 | 5
  equipment?: string[]
  tips?: string[]
}

interface PracticeSession {
  id: string
  sportId: string
  practiceId: string
  startTime: Date
  endTime?: Date
  duration: number // actual duration in minutes
  intensity: 1 | 2 | 3 | 4 | 5
  notes?: string
  mood: 'great' | 'good' | 'okay' | 'tired' | 'exhausted'
  completionRate: number // percentage of practice completed
  personalRecords?: {
    reps?: number
    weight?: number
    distance?: number
    time?: number
  }
}

interface PracticeTrackerProps {
  sportId: string
  sportName: string
  sportEmoji: string
}

export function PracticeTracker({ sportId, sportName, sportEmoji }: PracticeTrackerProps) {
  const [microPractices, setMicroPractices] = useState<MicroPractice[]>([])
  const [sessions, setSessions] = useState<PracticeSession[]>([])
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [showCreatePractice, setShowCreatePractice] = useState(false)
  const [selectedPractice, setSelectedPractice] = useState<MicroPractice | null>(null)

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isTimerRunning && currentSession) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1)
      }, 1000)
    }
    
    return () => clearInterval(interval)
  }, [isTimerRunning, currentSession])

  // Pre-defined micro-practices
  const defaultPractices: Omit<MicroPractice, 'id' | 'sportId'>[] = [
    // Universal practices
    { name: "5-Minute Dynamic Warm-up", estimatedMinutes: 5, category: 'warm-up', difficulty: 1, description: "Light movements to prepare your body" },
    { name: "Perfect Form Practice", estimatedMinutes: 3, category: 'technique', difficulty: 2, description: "Focus on technique with slow, controlled movements" },
    { name: "60-Second Interval", estimatedMinutes: 1, category: 'skill', difficulty: 3, description: "High-intensity practice for 60 seconds" },
    { name: "Breathing & Recovery", estimatedMinutes: 2, category: 'cool-down', difficulty: 1, description: "Deep breathing and gentle stretching" },
    { name: "Core Activation", estimatedMinutes: 4, category: 'strength', difficulty: 2, description: "Quick core strengthening exercises" },
    { name: "Balance Challenge", estimatedMinutes: 3, category: 'skill', difficulty: 2, description: "Practice balance and stability" },
    { name: "Speed Drill", estimatedMinutes: 2, category: 'skill', difficulty: 4, description: "Quick movements to improve reaction time" },
    { name: "Flexibility Flow", estimatedMinutes: 5, category: 'cool-down', difficulty: 1, description: "Gentle stretching sequence" },
  ]

  // Load data
  useEffect(() => {
    const savedPractices = localStorage.getItem(`micro_practices_${sportId}`)
    const savedSessions = localStorage.getItem(`practice_sessions_${sportId}`)

    if (savedPractices) {
      setMicroPractices(JSON.parse(savedPractices))
    } else {
      // Initialize with default practices
      const initialPractices = defaultPractices.map((practice, index) => ({
        ...practice,
        id: `default_${index}`,
        sportId
      }))
      setMicroPractices(initialPractices)
    }

    if (savedSessions) {
      setSessions(JSON.parse(savedSessions).map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: s.endTime ? new Date(s.endTime) : undefined
      })))
    }
  }, [sportId])

  // Save data
  useEffect(() => {
    localStorage.setItem(`micro_practices_${sportId}`, JSON.stringify(microPractices))
  }, [microPractices, sportId])

  useEffect(() => {
    localStorage.setItem(`practice_sessions_${sportId}`, JSON.stringify(sessions))
  }, [sessions, sportId])

  const startPractice = (practice: MicroPractice) => {
    const newSession: PracticeSession = {
      id: Date.now().toString(),
      sportId,
      practiceId: practice.id,
      startTime: new Date(),
      duration: 0,
      intensity: 3,
      mood: 'good',
      completionRate: 0
    }
    
    setCurrentSession(newSession)
    setSelectedPractice(practice)
    setIsTimerRunning(true)
    setTimerSeconds(0)
  }

  const pauseResumePractice = () => {
    setIsTimerRunning(!isTimerRunning)
  }

  const completePractice = () => {
    if (!currentSession || !selectedPractice) return

    const completedSession: PracticeSession = {
      ...currentSession,
      endTime: new Date(),
      duration: Math.floor(timerSeconds / 60),
      completionRate: 100
    }

    setSessions([...sessions, completedSession])
    setCurrentSession(null)
    setSelectedPractice(null)
    setIsTimerRunning(false)
    setTimerSeconds(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTodaysSessions = () => {
    const today = new Date().toDateString()
    return sessions.filter(s => s.startTime.toDateString() === today)
  }

  const getWeeklyStats = () => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const weekSessions = sessions.filter(s => s.startTime >= weekAgo)
    const totalTime = weekSessions.reduce((sum, s) => sum + s.duration, 0)
    const avgIntensity = weekSessions.length > 0 
      ? weekSessions.reduce((sum, s) => sum + s.intensity, 0) / weekSessions.length 
      : 0

    return {
      sessions: weekSessions.length,
      totalTime,
      avgIntensity: Math.round(avgIntensity * 10) / 10
    }
  }

  const createCustomPractice = (practiceData: Omit<MicroPractice, 'id' | 'sportId'>) => {
    const newPractice: MicroPractice = {
      ...practiceData,
      id: Date.now().toString(),
      sportId
    }
    setMicroPractices([...microPractices, newPractice])
    setShowCreatePractice(false)
  }

  const weeklyStats = getWeeklyStats()
  const todaysSessions = getTodaysSessions()

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Today</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{todaysSessions.length}</div>
          <div className="text-xs text-blue-600">practices</div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">This Week</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{weeklyStats.totalTime}m</div>
          <div className="text-xs text-green-600">total time</div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Intensity</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">{weeklyStats.avgIntensity}/5</div>
          <div className="text-xs text-orange-600">average</div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Sessions</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{weeklyStats.sessions}</div>
          <div className="text-xs text-purple-600">this week</div>
        </div>
      </div>

      {/* Active Practice Timer */}
      <AnimatePresence>
        {currentSession && selectedPractice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-2xl text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">{sportEmoji}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedPractice.name}</h3>
                  <p className="text-orange-100 text-sm">{selectedPractice.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-mono font-bold">{formatTime(timerSeconds)}</div>
                <div className="text-sm text-orange-100">
                  Target: {selectedPractice.estimatedMinutes}m
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                onClick={pauseResumePractice}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isTimerRunning ? 'Pause' : 'Resume'}
              </motion.button>

              <motion.button
                onClick={completePractice}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CheckCircle className="w-4 h-4" />
                Complete
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Start Practices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Quick Start Practices</h3>
          <button
            onClick={() => setShowCreatePractice(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Custom
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {microPractices.map(practice => {
            const categoryIcons = {
              'warm-up': '🔥',
              'skill': '🎯',
              'strength': '💪',
              'endurance': '🏃',
              'cool-down': '🧘',
              'technique': '⚡'
            }

            const difficultyColors = {
              1: 'bg-green-100 text-green-800',
              2: 'bg-blue-100 text-blue-800',
              3: 'bg-yellow-100 text-yellow-800',
              4: 'bg-orange-100 text-orange-800',
              5: 'bg-red-100 text-red-800'
            }

            return (
              <motion.div
                key={practice.id}
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => currentSession ? null : startPractice(practice)}
                whileHover={{ scale: currentSession ? 1 : 1.02 }}
                whileTap={{ scale: currentSession ? 1 : 0.98 }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{categoryIcons[practice.category]}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm mb-1">{practice.name}</h4>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{practice.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {practice.estimatedMinutes}m
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[practice.difficulty]}`}>
                          Level {practice.difficulty}
                        </span>
                      </div>
                      
                      {!currentSession && (
                        <Play className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                </div>

                {currentSession && (
                  <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                    <div className="text-xs text-gray-600 text-center">
                      Practice in progress...
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-4">Recent Sessions</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {sessions
              .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
              .slice(0, 10)
              .map(session => {
                const practice = microPractices.find(p => p.id === session.practiceId)
                const moodEmojis = {
                  'great': '😄',
                  'good': '😊',
                  'okay': '😐',
                  'tired': '😴',
                  'exhausted': '😵'
                }

                return (
                  <div key={session.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-lg">{moodEmojis[session.mood]}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{practice?.name || 'Unknown Practice'}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{session.duration}m</span>
                        <span>Intensity {session.intensity}/5</span>
                        <span>{session.startTime.toLocaleDateString()}</span>
                      </div>
                    </div>
                    {session.completionRate === 100 && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}