"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RotateCcw, Plus, Minus, Trophy, Star } from "lucide-react"

interface DhikrItem {
  id: string
  arabic: string
  english: string
  transliteration: string
  count: number
  target: number
  reward: number
}

const DHIKR_OPTIONS: Omit<DhikrItem, 'count'>[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللهِ',
    english: 'Glory be to Allah',
    transliteration: 'Subhan Allah',
    target: 33,
    reward: 10
  },
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ للهِ',
    english: 'All praise is due to Allah',
    transliteration: 'Alhamdulillah',
    target: 33,
    reward: 10
  },
  {
    id: 'allahuakbar',
    arabic: 'اللهُ أَكْبَرُ',
    english: 'Allah is the Greatest',
    transliteration: 'Allahu Akbar',
    target: 34,
    reward: 10
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ اللهَ',
    english: 'I seek forgiveness from Allah',
    transliteration: 'Astaghfirullah',
    target: 100,
    reward: 15
  },
  {
    id: 'lailahaillallah',
    arabic: 'لَا إِلٰهَ إِلَّا اللهُ',
    english: 'There is no god but Allah',
    transliteration: 'La ilaha illa Allah',
    target: 100,
    reward: 20
  },
  {
    id: 'salawat',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
    english: 'O Allah, send blessings upon Muhammad',
    transliteration: 'Allahumma salli ala Muhammad',
    target: 10,
    reward: 25
  }
]

export function DhikrCounter() {
  const [dhikrList, setDhikrList] = useState<DhikrItem[]>([])
  const [selectedDhikr, setSelectedDhikr] = useState<DhikrItem | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)

  useEffect(() => {
    // Load dhikr progress for today
    const today = new Date().toDateString()
    const savedDhikr = localStorage.getItem(`dhikr_${today}`)
    
    if (savedDhikr) {
      setDhikrList(JSON.parse(savedDhikr))
    } else {
      // Initialize with today's dhikr
      const initialDhikr = DHIKR_OPTIONS.map(dhikr => ({
        ...dhikr,
        count: 0
      }))
      setDhikrList(initialDhikr)
    }
  }, [])

  const saveDhikrProgress = (updatedList: DhikrItem[]) => {
    const today = new Date().toDateString()
    localStorage.setItem(`dhikr_${today}`, JSON.stringify(updatedList))
    setDhikrList(updatedList)
  }

  const incrementCount = (dhikrId: string) => {
    const updatedList = dhikrList.map(dhikr => {
      if (dhikr.id === dhikrId) {
        const newCount = dhikr.count + 1
        
        // Award coins when target is reached
        if (newCount === dhikr.target) {
          const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}')
          if (userProgress.coins !== undefined) {
            userProgress.coins = (userProgress.coins || 0) + dhikr.reward
            userProgress.xp = (userProgress.xp || 0) + dhikr.reward
            userProgress.totalActions = (userProgress.totalActions || 0) + 1
            localStorage.setItem('userProgress', JSON.stringify(userProgress))
          }
        }
        
        return { ...dhikr, count: newCount }
      }
      return dhikr
    })
    saveDhikrProgress(updatedList)
  }

  const decrementCount = (dhikrId: string) => {
    const updatedList = dhikrList.map(dhikr => {
      if (dhikr.id === dhikrId) {
        return { ...dhikr, count: Math.max(0, dhikr.count - 1) }
      }
      return dhikr
    })
    saveDhikrProgress(updatedList)
  }

  const resetCount = (dhikrId: string) => {
    const updatedList = dhikrList.map(dhikr => {
      if (dhikr.id === dhikrId) {
        return { ...dhikr, count: 0 }
      }
      return dhikr
    })
    saveDhikrProgress(updatedList)
  }

  const resetAllCounts = () => {
    const updatedList = dhikrList.map(dhikr => ({ ...dhikr, count: 0 }))
    saveDhikrProgress(updatedList)
  }

  const completedDhikr = dhikrList.filter(dhikr => dhikr.count >= dhikr.target)
  const pendingDhikr = dhikrList.filter(dhikr => dhikr.count < dhikr.target)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">📿 Dhikr Counter</h3>
        <p className="text-sm text-gray-600">Remember Allah throughout your day</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{completedDhikr.length}</p>
          <p className="text-xs text-blue-700">Completed</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">
            {dhikrList.reduce((sum, dhikr) => sum + dhikr.count, 0)}
          </p>
          <p className="text-xs text-green-700">Total Today</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {completedDhikr.reduce((sum, dhikr) => sum + dhikr.reward, 0)}
          </p>
          <p className="text-xs text-purple-700">Coins Earned</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              showCompleted 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-1" />
            Completed ({completedDhikr.length})
          </button>
        </div>
        
        <button
          onClick={resetAllCounts}
          className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors"
        >
          <RotateCcw className="w-4 h-4 inline mr-1" />
          Reset All
        </button>
      </div>

      {/* Dhikr List */}
      <div className="space-y-3">
        {(showCompleted ? completedDhikr : pendingDhikr).map((dhikr, index) => (
          <motion.div
            key={dhikr.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${
              dhikr.count >= dhikr.target
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-200'
            } ${selectedDhikr?.id === dhikr.id ? 'ring-2 ring-blue-400' : ''}`}
            onClick={() => setSelectedDhikr(selectedDhikr?.id === dhikr.id ? null : dhikr)}
          >
            <div className="flex items-center justify-between">
              {/* Dhikr Text */}
              <div className="flex-1">
                <div className="text-right mb-2">
                  <p className="text-2xl font-arabic leading-relaxed">{dhikr.arabic}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-gray-800">{dhikr.transliteration}</p>
                  <p className="text-sm text-gray-600 italic">{dhikr.english}</p>
                </div>
              </div>

              {/* Counter */}
              <div className="text-center ml-4">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      decrementCount(dhikr.id)
                    }}
                    className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  
                  <div className="min-w-[80px] text-center">
                    <p className="text-2xl font-bold text-gray-800">{dhikr.count}</p>
                    <p className="text-xs text-gray-500">/ {dhikr.target}</p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      incrementCount(dhikr.id)
                    }}
                    className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-20 bg-gray-200 rounded-full h-2 mx-auto">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      dhikr.count >= dhikr.target ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((dhikr.count / dhikr.target) * 100, 100)}%` }}
                  />
                </div>

                {/* Completion Badge */}
                {dhikr.count >= dhikr.target && (
                  <div className="mt-2 flex items-center justify-center gap-1 text-green-600">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs font-medium">+{dhikr.reward} coins</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reset Button */}
            <AnimatePresence>
              {selectedDhikr?.id === dhikr.id && dhikr.count > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-gray-200"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      resetCount(dhikr.id)
                    }}
                    className="w-full py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <RotateCcw className="w-4 h-4 inline mr-2" />
                    Reset This Dhikr
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {(showCompleted ? completedDhikr : pendingDhikr).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">
            {showCompleted 
              ? "No dhikr completed yet today" 
              : "All dhikr completed! Subhan Allah! 🎉"
            }
          </p>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-blue-600 hover:underline text-sm"
          >
            {showCompleted ? "View pending dhikr" : "View completed dhikr"}
          </button>
        </div>
      )}
    </div>
  )
}