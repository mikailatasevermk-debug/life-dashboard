"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  TrendingUp, Heart, Target, BookOpen, Trophy, 
  Calendar, Users, Star, Moon, Sparkles
} from "lucide-react"

interface FamilyInsightsProps {
  familyId: string
  familyMembers: Array<{
    id: string
    name: string
    email: string
  }>
}

interface FamilyStats {
  totalNotes: number
  totalGoalsCompleted: number
  totalPrayers: number
  totalLoveExpressions: number
  totalCoinsEarned: number
  avgLevel: number
  mostActiveSpace: string
  thisWeekActivity: number
  lastWeekActivity: number
}

export function FamilyInsights({ familyId, familyMembers }: FamilyInsightsProps) {
  const [stats, setStats] = useState<FamilyStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    calculateFamilyStats()
  }, [familyId, familyMembers])

  const calculateFamilyStats = () => {
    try {
      let totalNotes = 0
      let totalGoalsCompleted = 0
      let totalPrayers = 0
      let totalLoveExpressions = 0
      let totalCoinsEarned = 0
      let totalXP = 0
      const spaceActivity: Record<string, number> = {}
      let thisWeekActivity = 0
      let lastWeekActivity = 0

      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

      familyMembers.forEach(member => {
        // Count notes
        const memberNotes = JSON.parse(localStorage.getItem(`notes_${member.id}`) || '[]')
        totalNotes += memberNotes.length
        
        memberNotes.forEach((note: any) => {
          const noteDate = new Date(note.createdAt)
          if (noteDate > oneWeekAgo) thisWeekActivity++
          else if (noteDate > twoWeeksAgo) lastWeekActivity++
          
          spaceActivity[note.spaceType] = (spaceActivity[note.spaceType] || 0) + 1
        })

        // Count completed goals
        const memberGoals = JSON.parse(localStorage.getItem(`goals_${member.id}`) || '[]')
        const completedGoals = memberGoals.filter((goal: any) => goal.completed)
        totalGoalsCompleted += completedGoals.length
        
        completedGoals.forEach((goal: any) => {
          const goalDate = new Date(goal.completedAt || goal.updatedAt)
          if (goalDate > oneWeekAgo) thisWeekActivity++
          else if (goalDate > twoWeeksAgo) lastWeekActivity++
        })

        // Count prayers
        const prayerLog = JSON.parse(localStorage.getItem(`prayer_log_${member.id}`) || '[]')
        totalPrayers += prayerLog.length
        
        prayerLog.forEach((prayer: any) => {
          const prayerDate = new Date(prayer.timestamp)
          if (prayerDate > oneWeekAgo) thisWeekActivity++
          else if (prayerDate > twoWeeksAgo) lastWeekActivity++
        })

        // Count love expressions
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(`loveCount_`) && key.includes(member.id)) {
            const count = parseInt(localStorage.getItem(key) || '0')
            totalLoveExpressions += count
          }
        })

        // Get user progress
        const progress = JSON.parse(localStorage.getItem(`user_progress_${member.id}`) || '{"coins": 0, "xp": 0, "level": 1}')
        totalCoinsEarned += progress.coins || 0
        totalXP += progress.xp || 0
      })

      // Find most active space
      const mostActiveSpace = Object.keys(spaceActivity).reduce((a, b) => 
        spaceActivity[a] > spaceActivity[b] ? a : b, 'GENERAL'
      )

      const avgLevel = familyMembers.length > 0 ? Math.floor(totalXP / familyMembers.length / 100) + 1 : 1

      setStats({
        totalNotes,
        totalGoalsCompleted,
        totalPrayers,
        totalLoveExpressions,
        totalCoinsEarned,
        avgLevel,
        mostActiveSpace,
        thisWeekActivity,
        lastWeekActivity
      })
    } catch (error) {
      console.error('Error calculating family stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSpaceName = (spaceType: string) => {
    const spaceNames: Record<string, string> = {
      PROJECTS: 'Projects',
      FAMILY: 'Family',
      HOME: 'Home',
      LOVE: 'Love',
      BUYING: 'Shopping',
      CAREER: 'Career',
      FAITH: 'Faith',
      STORYTELLING: 'Stories'
    }
    return spaceNames[spaceType] || 'General'
  }

  const getTrendPercentage = () => {
    if (!stats || stats.lastWeekActivity === 0) return 0
    return Math.round(((stats.thisWeekActivity - stats.lastWeekActivity) / stats.lastWeekActivity) * 100)
  }

  const isPositiveTrend = () => getTrendPercentage() >= 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to load family insights</p>
      </div>
    )
  }

  const insightCards = [
    {
      title: 'Total Notes',
      value: stats.totalNotes,
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-100',
      suffix: 'notes'
    },
    {
      title: 'Goals Completed',
      value: stats.totalGoalsCompleted,
      icon: Target,
      color: 'text-green-600 bg-green-100',
      suffix: 'goals'
    },
    {
      title: 'Prayers',
      value: stats.totalPrayers,
      icon: Moon,
      color: 'text-purple-600 bg-purple-100',
      suffix: 'prayers'
    },
    {
      title: 'Love Expressions',
      value: stats.totalLoveExpressions,
      icon: Heart,
      color: 'text-pink-600 bg-pink-100',
      suffix: 'hearts'
    },
    {
      title: 'Coins Earned',
      value: stats.totalCoinsEarned,
      icon: Sparkles,
      color: 'text-yellow-600 bg-yellow-100',
      suffix: 'coins'
    },
    {
      title: 'Average Level',
      value: stats.avgLevel,
      icon: Trophy,
      color: 'text-orange-600 bg-orange-100',
      suffix: 'level'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Family Insights</h3>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className={`w-4 h-4 ${isPositiveTrend() ? 'text-green-600' : 'text-red-600'}`} />
          <span className={`font-medium ${isPositiveTrend() ? 'text-green-600' : 'text-red-600'}`}>
            {isPositiveTrend() ? '+' : ''}{getTrendPercentage()}% this week
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {insightCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/70 rounded-xl p-4 border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-gray-800">{card.title}</span>
              </div>
              <div className="ml-11">
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-600">{card.suffix}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Most Active Space */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Star className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Most Active Space</h4>
            <p className="text-sm text-gray-600">
              Your family loves spending time in <span className="font-medium text-purple-600">
                {getSpaceName(stats.mostActiveSpace)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Family Members Summary */}
      <div className="bg-white/70 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-800">Family Overview</h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Members</p>
            <p className="text-xl font-bold text-gray-900">{familyMembers.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">This Week</p>
            <p className="text-xl font-bold text-gray-900">{stats.thisWeekActivity}</p>
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      {(stats.totalNotes >= 50 || stats.totalGoalsCompleted >= 20 || stats.totalPrayers >= 100) && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <h4 className="font-semibold text-gray-800">Family Achievements</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.totalNotes >= 50 && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                📝 Storyteller Family (50+ notes)
              </span>
            )}
            {stats.totalGoalsCompleted >= 20 && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                🎯 Goal Achievers (20+ goals)
              </span>
            )}
            {stats.totalPrayers >= 100 && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                🌙 Faithful Family (100+ prayers)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}