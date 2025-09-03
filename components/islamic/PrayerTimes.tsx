"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, MapPin, Calendar, Bell, Check, Circle } from "lucide-react"

interface PrayerTime {
  name: string
  time: string
  arabic: string
  completed: boolean
  isNext: boolean
}

interface PrayerTimesProps {
  city?: string
  country?: string
}

export function PrayerTimes({ city = "Mecca", country = "Saudi Arabia" }: PrayerTimesProps) {
  const [prayers, setPrayers] = useState<PrayerTime[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [hijriDate, setHijriDate] = useState("")

  // Get current Islamic (Hijri) date
  const getHijriDate = () => {
    const now = new Date()
    // Approximate conversion (for accurate dates, you'd use a proper Islamic calendar API)
    const hijriYear = 1445 // Current approximate Hijri year
    const months = [
      "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
      "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
      "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
    ]
    const month = months[now.getMonth()]
    return `${now.getDate()} ${month} ${hijriYear}H`
  }

  // Calculate prayer times (simplified calculation - for production use proper Islamic calendar API)
  const calculatePrayerTimes = () => {
    const now = new Date()
    const today = now.toDateString()
    
    // Get stored prayer completion status
    const completedPrayers = JSON.parse(localStorage.getItem(`prayers_${today}`) || '[]')
    
    // Simplified prayer times (in practice, use accurate calculation based on location)
    const prayerTimes: PrayerTime[] = [
      {
        name: "Fajr",
        arabic: "الفجر",
        time: "05:30",
        completed: completedPrayers.includes('fajr'),
        isNext: false
      },
      {
        name: "Dhuhr",
        arabic: "الظهر", 
        time: "12:30",
        completed: completedPrayers.includes('dhuhr'),
        isNext: false
      },
      {
        name: "Asr",
        arabic: "العصر",
        time: "15:45",
        completed: completedPrayers.includes('asr'),
        isNext: false
      },
      {
        name: "Maghrib",
        arabic: "المغرب",
        time: "18:30",
        completed: completedPrayers.includes('maghrib'),
        isNext: false
      },
      {
        name: "Isha",
        arabic: "العشاء",
        time: "20:00",
        completed: completedPrayers.includes('isha'),
        isNext: false
      }
    ]

    // Determine next prayer
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeMinutes = currentHour * 60 + currentMinute

    let nextPrayerIndex = -1
    for (let i = 0; i < prayerTimes.length; i++) {
      const [hour, minute] = prayerTimes[i].time.split(':').map(Number)
      const prayerTimeMinutes = hour * 60 + minute
      
      if (prayerTimeMinutes > currentTimeMinutes && !prayerTimes[i].completed) {
        nextPrayerIndex = i
        break
      }
    }

    // If no prayer found for today, next is tomorrow's Fajr
    if (nextPrayerIndex === -1) {
      nextPrayerIndex = 0
    }

    prayerTimes[nextPrayerIndex].isNext = true
    return prayerTimes
  }

  useEffect(() => {
    const updateTimes = () => {
      setCurrentTime(new Date())
      setPrayers(calculatePrayerTimes())
      setHijriDate(getHijriDate())
    }

    updateTimes()
    const timer = setInterval(updateTimes, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  const markPrayerCompleted = (prayerName: string) => {
    const today = new Date().toDateString()
    const completedPrayers = JSON.parse(localStorage.getItem(`prayers_${today}`) || '[]')
    
    const prayerKey = prayerName.toLowerCase()
    if (!completedPrayers.includes(prayerKey)) {
      completedPrayers.push(prayerKey)
      localStorage.setItem(`prayers_${today}`, JSON.stringify(completedPrayers))
      
      // Update state
      setPrayers(prev => prev.map(prayer => 
        prayer.name.toLowerCase() === prayerKey 
          ? { ...prayer, completed: true }
          : prayer
      ))

      // Add coins for completing prayer
      const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}')
      if (userProgress.coins !== undefined) {
        userProgress.coins = (userProgress.coins || 0) + 15
        userProgress.xp = (userProgress.xp || 0) + 15
        userProgress.totalActions = (userProgress.totalActions || 0) + 1
        localStorage.setItem('userProgress', JSON.stringify(userProgress))
      }
    }
  }

  const getTimeUntilNext = () => {
    const nextPrayer = prayers.find(p => p.isNext)
    if (!nextPrayer) return ""

    const now = new Date()
    const [hour, minute] = nextPrayer.time.split(':').map(Number)
    const prayerTime = new Date()
    prayerTime.setHours(hour, minute, 0)

    // If prayer time has passed, it's tomorrow
    if (prayerTime <= now) {
      prayerTime.setDate(prayerTime.getDate() + 1)
    }

    const diff = prayerTime.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">🕌 Prayer Times</h3>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {city}, {country}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {hijriDate}
          </span>
        </div>
      </div>

      {/* Next Prayer Alert */}
      {prayers.some(p => p.isNext) && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200"
        >
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Next Prayer</p>
            <div className="flex items-center justify-center gap-3">
              {prayers.filter(p => p.isNext).map(prayer => (
                <div key={prayer.name} className="text-center">
                  <p className="font-bold text-lg text-green-700">{prayer.name}</p>
                  <p className="text-sm text-gray-600">{prayer.arabic}</p>
                  <p className="font-mono text-lg font-bold text-gray-800">{prayer.time}</p>
                  <p className="text-xs text-green-600">in {getTimeUntilNext()}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Prayer List */}
      <div className="space-y-3">
        {prayers.map((prayer, index) => (
          <motion.div
            key={prayer.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              prayer.isNext 
                ? 'bg-green-50 border-green-200 shadow-md' 
                : prayer.completed 
                  ? 'bg-gray-50 border-gray-200 opacity-75'
                  : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-center min-w-[60px]">
                <p className="font-bold text-gray-800">{prayer.name}</p>
                <p className="text-xs text-gray-500">{prayer.arabic}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-mono font-bold text-lg">{prayer.time}</span>
              </div>

              {prayer.isNext && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                  <Bell className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">Next</span>
                </div>
              )}
            </div>

            <button
              onClick={() => markPrayerCompleted(prayer.name)}
              disabled={prayer.completed}
              className={`p-2 rounded-full transition-colors ${
                prayer.completed
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600'
              }`}
            >
              {prayer.completed ? (
                <Check className="w-5 h-5" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Daily Progress */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Today's Progress</span>
          <span className="text-sm text-gray-600">
            {prayers.filter(p => p.completed).length}/5 prayers
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(prayers.filter(p => p.completed).length / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}