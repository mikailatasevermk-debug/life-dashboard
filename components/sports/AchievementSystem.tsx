"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Trophy, Medal, Star, Target, Flame, Clock, 
  TrendingUp, Award, Zap, Calendar, Crown,
  CheckCircle, Lock, Gift, Sparkles
} from "lucide-react"

interface Achievement {
  id: string
  sportId: string
  title: string
  description: string
  type: 'milestone' | 'personal_record' | 'consistency' | 'improvement' | 'special'
  category: 'time' | 'frequency' | 'performance' | 'dedication' | 'mastery'
  icon: string
  color: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  requirements: {
    metric: string
    target: number
    unit?: string
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'allTime'
  }
  progress: number
  isUnlocked: boolean
  unlockedAt?: Date
  reward?: {
    coins?: number
    title?: string
    badge?: string
  }
}

interface AchievementSystemProps {
  sportId: string
  sportName: string
  practicesCompleted: number
  totalTimeMinutes: number
  currentStreak: number
  bestStreak: number
}

export function AchievementSystem({ 
  sportId, 
  sportName, 
  practicesCompleted, 
  totalTimeMinutes, 
  currentStreak, 
  bestStreak 
}: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [showRewardModal, setShowRewardModal] = useState<Achievement | null>(null)
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [sortBy, setSortBy] = useState<'rarity' | 'progress' | 'recent'>('progress')

  // Define achievement templates
  const achievementTemplates: Omit<Achievement, 'id' | 'sportId' | 'progress' | 'isUnlocked'>[] = [
    // Milestone Achievements
    {
      title: "First Steps",
      description: "Complete your first practice session",
      type: 'milestone',
      category: 'dedication',
      icon: '🎯',
      color: '#22C55E',
      rarity: 'common',
      points: 10,
      requirements: { metric: 'practices', target: 1 },
      reward: { coins: 50, title: "Beginner" }
    },
    {
      title: "Getting Started",
      description: "Complete 5 practice sessions",
      type: 'milestone',
      category: 'dedication',
      icon: '🚀',
      color: '#3B82F6',
      rarity: 'common',
      points: 25,
      requirements: { metric: 'practices', target: 5 },
      reward: { coins: 100 }
    },
    {
      title: "Committed",
      description: "Complete 25 practice sessions",
      type: 'milestone',
      category: 'dedication',
      icon: '💪',
      color: '#F59E0B',
      rarity: 'rare',
      points: 75,
      requirements: { metric: 'practices', target: 25 },
      reward: { coins: 250, title: "Dedicated Athlete" }
    },
    {
      title: "Century Club",
      description: "Complete 100 practice sessions",
      type: 'milestone',
      category: 'dedication',
      icon: '💯',
      color: '#8B5CF6',
      rarity: 'epic',
      points: 200,
      requirements: { metric: 'practices', target: 100 },
      reward: { coins: 500, title: "Century Achiever" }
    },
    
    // Time-based Achievements
    {
      title: "First Hour",
      description: "Practice for a total of 1 hour",
      type: 'milestone',
      category: 'time',
      icon: '⏰',
      color: '#06B6D4',
      rarity: 'common',
      points: 15,
      requirements: { metric: 'totalTime', target: 60, unit: 'minutes' },
      reward: { coins: 75 }
    },
    {
      title: "Time Invested",
      description: "Practice for a total of 10 hours",
      type: 'milestone',
      category: 'time',
      icon: '⌚',
      color: '#F59E0B',
      rarity: 'rare',
      points: 50,
      requirements: { metric: 'totalTime', target: 600, unit: 'minutes' },
      reward: { coins: 200 }
    },
    {
      title: "Master of Time",
      description: "Practice for a total of 50 hours",
      type: 'milestone',
      category: 'time',
      icon: '⏳',
      color: '#DC2626',
      rarity: 'epic',
      points: 150,
      requirements: { metric: 'totalTime', target: 3000, unit: 'minutes' },
      reward: { coins: 750, title: "Time Master" }
    },

    // Consistency Achievements
    {
      title: "Consistent",
      description: "Practice for 3 days in a row",
      type: 'consistency',
      category: 'dedication',
      icon: '🔥',
      color: '#EF4444',
      rarity: 'common',
      points: 30,
      requirements: { metric: 'streak', target: 3 },
      reward: { coins: 100 }
    },
    {
      title: "On Fire",
      description: "Practice for 7 days in a row",
      type: 'consistency',
      category: 'dedication',
      icon: '🚀',
      color: '#F59E0B',
      rarity: 'rare',
      points: 75,
      requirements: { metric: 'streak', target: 7 },
      reward: { coins: 300, title: "Streak Master" }
    },
    {
      title: "Unstoppable",
      description: "Practice for 30 days in a row",
      type: 'consistency',
      category: 'dedication',
      icon: '⚡',
      color: '#8B5CF6',
      rarity: 'epic',
      points: 200,
      requirements: { metric: 'streak', target: 30 },
      reward: { coins: 1000, title: "Unstoppable Force" }
    },
    {
      title: "Legend",
      description: "Practice for 100 days in a row",
      type: 'consistency',
      category: 'mastery',
      icon: '👑',
      color: '#DC2626',
      rarity: 'legendary',
      points: 500,
      requirements: { metric: 'streak', target: 100 },
      reward: { coins: 2500, title: "Living Legend" }
    },

    // Special Achievements
    {
      title: "Weekend Warrior",
      description: "Practice on both Saturday and Sunday",
      type: 'special',
      category: 'dedication',
      icon: '🏃‍♂️',
      color: '#10B981',
      rarity: 'rare',
      points: 40,
      requirements: { metric: 'weekendPractices', target: 2, timeframe: 'weekly' },
      reward: { coins: 150 }
    },
    {
      title: "Early Bird",
      description: "Complete 10 morning practices (before 10 AM)",
      type: 'special',
      category: 'dedication',
      icon: '🌅',
      color: '#F59E0B',
      rarity: 'rare',
      points: 60,
      requirements: { metric: 'morningPractices', target: 10 },
      reward: { coins: 200, title: "Early Bird" }
    },
    {
      title: "Night Owl",
      description: "Complete 10 evening practices (after 8 PM)",
      type: 'special',
      category: 'dedication',
      icon: '🦉',
      color: '#6366F1',
      rarity: 'rare',
      points: 60,
      requirements: { metric: 'eveningPractices', target: 10 },
      reward: { coins: 200, title: "Night Owl" }
    }
  ]

  // Initialize achievements
  useEffect(() => {
    const savedAchievements = localStorage.getItem(`achievements_${sportId}`)
    
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements).map((a: any) => ({
        ...a,
        unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined
      })))
    } else {
      const initialAchievements = achievementTemplates.map((template, index) => ({
        ...template,
        id: `achievement_${index}`,
        sportId,
        progress: 0,
        isUnlocked: false
      }))
      setAchievements(initialAchievements)
    }
  }, [sportId])

  // Update progress and check for unlocks
  useEffect(() => {
    const updatedAchievements = achievements.map(achievement => {
      if (achievement.isUnlocked) return achievement

      let currentProgress = 0

      switch (achievement.requirements.metric) {
        case 'practices':
          currentProgress = practicesCompleted
          break
        case 'totalTime':
          currentProgress = totalTimeMinutes
          break
        case 'streak':
          currentProgress = Math.max(currentStreak, bestStreak)
          break
        default:
          currentProgress = achievement.progress
      }

      const progressPercentage = Math.min(100, (currentProgress / achievement.requirements.target) * 100)
      const shouldUnlock = currentProgress >= achievement.requirements.target && !achievement.isUnlocked

      if (shouldUnlock) {
        // Show reward modal for newly unlocked achievement
        setTimeout(() => setShowRewardModal(achievement), 1000)
        
        return {
          ...achievement,
          progress: progressPercentage,
          isUnlocked: true,
          unlockedAt: new Date()
        }
      }

      return {
        ...achievement,
        progress: progressPercentage
      }
    })

    if (JSON.stringify(updatedAchievements) !== JSON.stringify(achievements)) {
      setAchievements(updatedAchievements)
    }
  }, [practicesCompleted, totalTimeMinutes, currentStreak, bestStreak, achievements])

  // Save achievements
  useEffect(() => {
    localStorage.setItem(`achievements_${sportId}`, JSON.stringify(achievements))
  }, [achievements, sportId])

  const getRarityStyle = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300 bg-gray-50'
      case 'rare':
        return 'border-blue-300 bg-blue-50'
      case 'epic':
        return 'border-purple-300 bg-purple-50'
      case 'legendary':
        return 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  const filteredAchievements = achievements
    .filter(achievement => {
      if (filter === 'unlocked') return achievement.isUnlocked
      if (filter === 'locked') return !achievement.isUnlocked
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'rarity') {
        const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 }
        return rarityOrder[b.rarity] - rarityOrder[a.rarity]
      }
      if (sortBy === 'progress') {
        return b.progress - a.progress
      }
      if (sortBy === 'recent') {
        if (a.unlockedAt && b.unlockedAt) {
          return b.unlockedAt.getTime() - a.unlockedAt.getTime()
        }
        return a.unlockedAt ? -1 : b.unlockedAt ? 1 : 0
      }
      return 0
    })

  const unlockedCount = achievements.filter(a => a.isUnlocked).length
  const totalPoints = achievements
    .filter(a => a.isUnlocked)
    .reduce((sum, a) => sum + a.points, 0)

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
          <Trophy className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900">Achievement Progress</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Medal className="w-4 h-4 text-yellow-500" />
              {unlockedCount}/{achievements.length} unlocked
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-orange-500" />
              {totalPoints} points earned
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          {[
            { id: 'all', name: 'All' },
            { id: 'unlocked', name: 'Unlocked' },
            { id: 'locked', name: 'Locked' }
          ].map(filterOption => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id as any)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption.id
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {[
            { id: 'progress', name: 'Progress' },
            { id: 'rarity', name: 'Rarity' },
            { id: 'recent', name: 'Recent' }
          ].map(sortOption => (
            <button
              key={sortOption.id}
              onClick={() => setSortBy(sortOption.id as any)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sortBy === sortOption.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {sortOption.name}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => (
          <motion.div
            key={achievement.id}
            className={`p-4 rounded-xl border-2 ${getRarityStyle(achievement.rarity)} ${
              achievement.isUnlocked ? 'shadow-md' : 'opacity-75'
            } transition-all hover:shadow-lg`}
            whileHover={{ scale: 1.02 }}
            layout
          >
            <div className="flex items-start gap-3 mb-3">
              <div 
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  achievement.isUnlocked ? '' : 'grayscale opacity-50'
                }`}
                style={{ backgroundColor: achievement.isUnlocked ? `${achievement.color}20` : '#f3f4f6' }}
              >
                {achievement.isUnlocked ? achievement.icon : <Lock className="w-6 h-6 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 mb-1">{achievement.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    achievement.rarity === 'common' ? 'bg-gray-100 text-gray-700' :
                    achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                    achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {achievement.rarity}
                  </span>
                  <span className="text-sm font-semibold text-orange-600">
                    {achievement.points} pts
                  </span>
                </div>

                {!achievement.isUnlocked && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(achievement.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: achievement.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${achievement.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}

                {achievement.isUnlocked && achievement.unlockedAt && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    Unlocked {achievement.unlockedAt.toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reward Modal */}
      <AnimatePresence>
        {showRewardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 1, repeat: 1 }}
                className="w-20 h-20 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center"
              >
                <Trophy className="w-10 h-10 text-yellow-600" />
              </motion.div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Achievement Unlocked!</h3>
              <h4 className="text-lg font-semibold text-orange-600 mb-2">{showRewardModal.title}</h4>
              <p className="text-gray-600 mb-4">{showRewardModal.description}</p>
              
              {showRewardModal.reward && (
                <div className="bg-green-50 p-4 rounded-xl mb-4">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <Gift className="w-5 h-5" />
                    <span className="font-semibold">Rewards</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {showRewardModal.reward.coins && (
                      <div className="text-sm">🪙 {showRewardModal.reward.coins} coins</div>
                    )}
                    {showRewardModal.reward.title && (
                      <div className="text-sm">🏆 Title: "{showRewardModal.reward.title}"</div>
                    )}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setShowRewardModal(null)}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}