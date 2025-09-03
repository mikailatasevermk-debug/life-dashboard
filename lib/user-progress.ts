import { useState, useEffect } from 'react'

export interface UserProgress {
  coins: number
  level: number
  xp: number
  totalActions: number
  lastActivity: Date
  achievements: Achievement[]
}

export interface Achievement {
  id: string
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
  achievements: []
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

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_note', name: 'First Step', description: 'Created your first note', icon: '📝' },
  { id: 'level_5', name: 'Rising Star', description: 'Reached level 5', icon: '⭐' },
  { id: 'level_10', name: 'Dedicated', description: 'Reached level 10', icon: '🏆' },
  { id: '100_coins', name: 'Coin Collector', description: 'Earned 100 coins', icon: '💰' },
  { id: '7_day_streak', name: 'Week Warrior', description: '7 day activity streak', icon: '🔥' },
  { id: 'all_spaces', name: 'Life Explorer', description: 'Used all life spaces', icon: '🌟' },
]

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userProgress')
      if (saved) {
        const parsed = JSON.parse(saved)
        parsed.lastActivity = new Date(parsed.lastActivity)
        return parsed
      }
    }
    return INITIAL_PROGRESS
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userProgress', JSON.stringify(progress))
    }
  }, [progress])

  const addCoins = (amount: number, action?: keyof typeof COIN_REWARDS) => {
    setProgress(prev => {
      const newCoins = prev.coins + amount
      const newXP = prev.xp + amount
      const newLevel = Math.floor(newXP / 100) + 1
      
      const newAchievements = [...prev.achievements]
      
      // Check for achievements
      if (newCoins >= 100 && !prev.achievements.find(a => a.id === '100_coins')) {
        const achievement = ACHIEVEMENTS.find(a => a.id === '100_coins')!
        newAchievements.push({ ...achievement, unlockedAt: new Date() })
      }
      
      if (newLevel >= 5 && !prev.achievements.find(a => a.id === 'level_5')) {
        const achievement = ACHIEVEMENTS.find(a => a.id === 'level_5')!
        newAchievements.push({ ...achievement, unlockedAt: new Date() })
      }
      
      if (newLevel >= 10 && !prev.achievements.find(a => a.id === 'level_10')) {
        const achievement = ACHIEVEMENTS.find(a => a.id === 'level_10')!
        newAchievements.push({ ...achievement, unlockedAt: new Date() })
      }

      return {
        ...prev,
        coins: newCoins,
        xp: newXP,
        level: newLevel,
        totalActions: prev.totalActions + 1,
        lastActivity: new Date(),
        achievements: newAchievements
      }
    })
  }

  const spendCoins = (amount: number): boolean => {
    if (progress.coins >= amount) {
      setProgress(prev => ({
        ...prev,
        coins: prev.coins - amount
      }))
      return true
    }
    return false
  }

  const checkDailyLogin = () => {
    const lastActivity = new Date(progress.lastActivity)
    const today = new Date()
    
    if (lastActivity.toDateString() !== today.toDateString()) {
      addCoins(COIN_REWARDS.DAILY_LOGIN)
      return true
    }
    return false
  }

  return {
    progress,
    addCoins,
    spendCoins,
    checkDailyLogin,
    COIN_REWARDS
  }
}