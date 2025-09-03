"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  BarChart3, TrendingUp, Calendar, Clock, Target, 
  Activity, Zap, Flame, Trophy, Award, Star,
  ChevronUp, ChevronDown
} from "lucide-react"

interface AnalyticsProps {
  sportId: string
  sportName: string
  practices: any[]
  achievements: any[]
}

export function SportsAnalytics({ sportId, sportName, practices, achievements }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month')
  
  const getDateRange = () => {
    const now = new Date()
    const ranges = {
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      all: new Date(0)
    }
    return ranges[timeRange]
  }

  const filteredPractices = practices.filter(p => 
    new Date(p.startTime) >= getDateRange()
  )

  // Calculate metrics
  const totalSessions = filteredPractices.length
  const totalMinutes = filteredPractices.reduce((sum, p) => sum + (p.duration || 0), 0)
  const avgSessionLength = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0
  const avgIntensity = totalSessions > 0 
    ? Math.round((filteredPractices.reduce((sum, p) => sum + (p.intensity || 3), 0) / totalSessions) * 10) / 10 
    : 0

  // Weekly breakdown
  const getWeeklyData = () => {
    const weeks: { [key: string]: { sessions: number, minutes: number } } = {}
    
    filteredPractices.forEach(practice => {
      const date = new Date(practice.startTime)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toISOString().split('T')[0]
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { sessions: 0, minutes: 0 }
      }
      weeks[weekKey].sessions++
      weeks[weekKey].minutes += practice.duration || 0
    })
    
    return Object.entries(weeks)
      .map(([week, data]) => ({ week: new Date(week), ...data }))
      .sort((a, b) => a.week.getTime() - b.week.getTime())
      .slice(-12) // Last 12 weeks
  }

  // Daily patterns
  const getDailyPatterns = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const patterns = days.map(day => ({ day, sessions: 0, minutes: 0 }))
    
    filteredPractices.forEach(practice => {
      const dayIndex = new Date(practice.startTime).getDay()
      patterns[dayIndex].sessions++
      patterns[dayIndex].minutes += practice.duration || 0
    })
    
    return patterns
  }

  // Time of day analysis
  const getTimePatterns = () => {
    const timeSlots = [
      { name: 'Morning', start: 5, end: 12, sessions: 0, minutes: 0 },
      { name: 'Afternoon', start: 12, end: 17, sessions: 0, minutes: 0 },
      { name: 'Evening', start: 17, end: 22, sessions: 0, minutes: 0 },
      { name: 'Night', start: 22, end: 5, sessions: 0, minutes: 0 }
    ]
    
    filteredPractices.forEach(practice => {
      const hour = new Date(practice.startTime).getHours()
      const slot = timeSlots.find(slot => {
        if (slot.name === 'Night') {
          return hour >= slot.start || hour < slot.end
        }
        return hour >= slot.start && hour < slot.end
      })
      if (slot) {
        slot.sessions++
        slot.minutes += practice.duration || 0
      }
    })
    
    return timeSlots
  }

  // Intensity distribution
  const getIntensityDistribution = () => {
    const distribution = [1, 2, 3, 4, 5].map(intensity => ({
      intensity,
      count: filteredPractices.filter(p => p.intensity === intensity).length
    }))
    
    return distribution
  }

  // Streaks and consistency
  const getConsistencyMetrics = () => {
    const practicesWithDates = practices
      .map(p => new Date(p.startTime))
      .sort((a, b) => a.getTime() - b.getTime())
    
    let longestStreak = 0
    let currentStreak = 0
    let lastDate: Date | null = null
    
    practicesWithDates.forEach(date => {
      const dateStr = date.toDateString()
      const lastDateStr = lastDate?.toDateString()
      
      if (!lastDate || dateStr === lastDateStr) {
        // Same day or first practice
        if (!lastDate) currentStreak = 1
      } else {
        const daysDiff = Math.floor((date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff === 1) {
          currentStreak++
        } else {
          longestStreak = Math.max(longestStreak, currentStreak)
          currentStreak = 1
        }
      }
      lastDate = date
    })
    
    longestStreak = Math.max(longestStreak, currentStreak)
    
    return { longestStreak, currentStreak }
  }

  const weeklyData = getWeeklyData()
  const dailyPatterns = getDailyPatterns()
  const timePatterns = getTimePatterns()
  const intensityDistribution = getIntensityDistribution()
  const consistencyMetrics = getConsistencyMetrics()
  const unlockedAchievements = achievements.filter(a => a.isUnlocked).length

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {[
          { id: 'week', name: 'Week' },
          { id: 'month', name: 'Month' },
          { id: 'year', name: 'Year' },
          { id: 'all', name: 'All Time' }
        ].map(range => (
          <button
            key={range.id}
            onClick={() => setTimeRange(range.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === range.id
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {range.name}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div 
          className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Sessions</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{totalSessions}</div>
          <div className="text-xs text-blue-600">
            {timeRange === 'week' ? 'this week' : 
             timeRange === 'month' ? 'this month' : 
             timeRange === 'year' ? 'this year' : 'all time'}
          </div>
        </motion.div>

        <motion.div 
          className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Total Time</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </div>
          <div className="text-xs text-green-600">Avg: {avgSessionLength}m/session</div>
        </motion.div>

        <motion.div 
          className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Avg Intensity</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">{avgIntensity}/5</div>
          <div className="flex mt-1">
            {[1,2,3,4,5].map(i => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${i <= avgIntensity ? 'text-orange-400 fill-current' : 'text-orange-200'}`} 
              />
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Achievements</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{unlockedAchievements}</div>
          <div className="text-xs text-purple-600">unlocked</div>
        </motion.div>
      </div>

      {/* Weekly Progress Chart */}
      {weeklyData.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Weekly Progress
          </h3>
          <div className="space-y-2">
            {weeklyData.map((week, index) => (
              <div key={week.week.toISOString()} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-20">
                  {week.week.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1 relative">
                  <div className="h-8 bg-gray-100 rounded-md overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-md flex items-center justify-end pr-2"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.max(10, (week.sessions / Math.max(...weeklyData.map(w => w.sessions))) * 100)}%` 
                      }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    >
                      <span className="text-white text-xs font-medium">
                        {week.sessions} sessions
                      </span>
                    </motion.div>
                  </div>
                </div>
                <span className="text-sm text-gray-500 w-16">
                  {Math.floor(week.minutes / 60)}h {week.minutes % 60}m
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Day of Week Patterns
          </h3>
          <div className="space-y-3">
            {dailyPatterns.map(day => {
              const maxSessions = Math.max(...dailyPatterns.map(d => d.sessions))
              const percentage = maxSessions > 0 ? (day.sessions / maxSessions) * 100 : 0
              
              return (
                <div key={day.day} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-20">{day.day.slice(0, 3)}</span>
                  <div className="flex-1 relative">
                    <div className="h-6 bg-gray-100 rounded-md overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-md"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(5, percentage)}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <span className="absolute left-2 top-0 h-6 flex items-center text-white text-xs font-medium">
                      {day.sessions}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Time of Day Patterns
          </h3>
          <div className="space-y-3">
            {timePatterns.map(time => {
              const maxSessions = Math.max(...timePatterns.map(t => t.sessions))
              const percentage = maxSessions > 0 ? (time.sessions / maxSessions) * 100 : 0
              
              return (
                <div key={time.name} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-20">{time.name}</span>
                  <div className="flex-1 relative">
                    <div className="h-6 bg-gray-100 rounded-md overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-400 to-teal-400 rounded-md"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(5, percentage)}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <span className="absolute left-2 top-0 h-6 flex items-center text-white text-xs font-medium">
                      {time.sessions}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Consistency Metrics */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5" />
          Consistency & Streaks
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <Flame className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{consistencyMetrics.currentStreak}</div>
            <div className="text-sm text-red-600">Current Streak</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Award className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{consistencyMetrics.longestStreak}</div>
            <div className="text-sm text-orange-600">Longest Streak</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {totalSessions > 0 ? Math.round((totalSessions / Math.max(1, (new Date().getTime() - new Date(practices[0]?.startTime || new Date()).getTime()) / (1000 * 60 * 60 * 24))) * 7 * 10) / 10 : 0}
            </div>
            <div className="text-sm text-blue-600">Sessions/Week Avg</div>
          </div>
        </div>
      </div>

      {/* Intensity Distribution */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Intensity Distribution
        </h3>
        <div className="space-y-2">
          {intensityDistribution.map(item => {
            const maxCount = Math.max(...intensityDistribution.map(i => i.count))
            const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0
            
            return (
              <div key={item.intensity} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-12">Level {item.intensity}</span>
                <div className="flex-1 relative">
                  <div className="h-6 bg-gray-100 rounded-md overflow-hidden">
                    <motion.div
                      className={`h-full rounded-md ${
                        item.intensity <= 2 ? 'bg-green-400' :
                        item.intensity <= 3 ? 'bg-yellow-400' :
                        item.intensity <= 4 ? 'bg-orange-400' :
                        'bg-red-400'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(5, percentage)}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <span className="absolute left-2 top-0 h-6 flex items-center text-white text-xs font-medium">
                    {item.count} sessions
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}