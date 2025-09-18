import { useState, useEffect, useCallback } from 'react'

export interface UserProgress {
  coins: number
  level: number
  xp: number
  totalActions: number
  lastActivity: Date
  dailyStreak?: number
}

export interface Achievement {
  id: string
  code: string
  name: string
  description: string
  icon: string
  unlockedAt?: Date
}

const INITIAL_PROGRESS: UserProgress = {
  coins: 0,
  level: 1,
  xp: 0,
  totalActions: 0,
  lastActivity: new Date(),
  dailyStreak: 0
}

const COIN_REWARDS = {
  CREATE_NOTE: 10,
  COMPLETE_TASK: 15,
  ADD_EVENT: 5,
  DAILY_LOGIN: 20,
  WEEKLY_STREAK: 50,
  MOOD_TRACK: 3,
  SPACE_VISIT: 2
}

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch('/api/user/progress')
      if (response.ok) {
        const data = await response.json()
        if (data.progress) {
          setProgress({
            coins: data.progress.coins || 0,
            level: data.progress.level || 1,
            xp: data.progress.xp || 0,
            totalActions: data.progress.totalActions || 0,
            lastActivity: data.progress.lastActivity ? new Date(data.progress.lastActivity) : new Date(),
            dailyStreak: data.progress.dailyStreak || 0
          })
        }
        if (data.achievements) {
          setAchievements(data.achievements)
        }
        if (data.dailyBonus) {
          // Show notification for daily bonus
          console.log('Daily login bonus received! +20 coins')
        }
      } else if (response.status === 401) {
        // User not authenticated, use default values
        console.log('User not authenticated, using default progress')
        setProgress(INITIAL_PROGRESS)
      } else {
        // If API fails, try localStorage as fallback
        const saved = localStorage.getItem('userProgress')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            parsed.lastActivity = new Date(parsed.lastActivity)
            setProgress(parsed)
          } catch (e) {
            console.error('Failed to parse saved progress:', e)
            setProgress(INITIAL_PROGRESS)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
      // Fallback to localStorage or defaults
      try {
        const saved = localStorage.getItem('userProgress')
        if (saved) {
          const parsed = JSON.parse(saved)
          parsed.lastActivity = new Date(parsed.lastActivity)
          setProgress(parsed)
        } else {
          setProgress(INITIAL_PROGRESS)
        }
      } catch (e) {
        console.error('Failed to load any progress:', e)
        setProgress(INITIAL_PROGRESS)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch initial progress from database
  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  const addCoins = async (amount: number, action?: keyof typeof COIN_REWARDS) => {
    // Optimistically update UI
    const newCoins = progress.coins + amount
    const newXP = progress.xp + amount
    const newLevel = Math.floor(newXP / 100) + 1
    
    setProgress(prev => ({
      ...prev,
      coins: newCoins,
      xp: newXP,
      level: newLevel,
      totalActions: prev.totalActions + 1,
      lastActivity: new Date()
    }))

    // Persist to database
    try {
      const response = await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, amount })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.progress) {
          setProgress({
            coins: data.progress.coins,
            level: data.progress.level,
            xp: data.progress.xp,
            totalActions: data.progress.totalActions,
            lastActivity: new Date(data.progress.lastActivity),
            dailyStreak: data.progress.dailyStreak
          })
        }
        if (data.newAchievements?.length > 0) {
          setAchievements(prev => [...prev, ...data.newAchievements])
          // Show achievement notifications
          data.newAchievements.forEach((achievement: Achievement) => {
            console.log(`Achievement unlocked: ${achievement.name}!`)
          })
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      // Still save to localStorage as fallback
      localStorage.setItem('userProgress', JSON.stringify(progress))
    }
  }

  const spendCoins = async (amount: number): Promise<boolean> => {
    if (progress.coins >= amount) {
      const newCoins = progress.coins - amount
      
      setProgress(prev => ({
        ...prev,
        coins: newCoins
      }))

      // Persist to database
      try {
        await fetch('/api/user/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'SPEND', amount: -amount })
        })
      } catch (error) {
        console.error('Error spending coins:', error)
      }

      return true
    }
    return false
  }

  const checkDailyLogin = async () => {
    // This is now handled by the API automatically
    // when fetching progress
    return false
  }

  return {
    progress,
    achievements,
    addCoins,
    spendCoins,
    checkDailyLogin,
    isLoading,
    COIN_REWARDS
  }
}