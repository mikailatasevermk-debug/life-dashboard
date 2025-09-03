"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Volume2, VolumeX, Clock, MapPin, Bell } from "lucide-react"

interface AdhanSystemProps {
  location?: {
    city: string
    country: string
    timezone: string
  }
}

interface PrayerTime {
  name: string
  arabic: string
  time: string
  timestamp: number
  isNext: boolean
}

// Netherlands coordinates (Amsterdam as default)
const NETHERLANDS_COORDS = {
  latitude: 52.3676,
  longitude: 4.9041,
  timezone: 'Europe/Amsterdam'
}

export function AdhanSystem({ 
  location = { 
    city: "Amsterdam", 
    country: "Netherlands", 
    timezone: "Europe/Amsterdam" 
  } 
}: AdhanSystemProps) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([])
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timeToNext, setTimeToNext] = useState("")
  const [adhanEnabled, setAdhanEnabled] = useState(true)
  const [volume, setVolume] = useState(0.7)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    calculatePrayerTimes()
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      updateNextPrayer()
    }, 60000)

    // Check for prayer times every minute
    const prayerChecker = setInterval(() => {
      checkForPrayerTime()
    }, 60000)

    return () => {
      clearInterval(timer)
      clearInterval(prayerChecker)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Calculate prayer times using astronomical calculations
  const calculatePrayerTimes = () => {
    const now = new Date()
    const today = now.toDateString()
    
    // Get sunrise and sunset times for Netherlands
    const { sunrise, sunset } = getSunTimes(NETHERLANDS_COORDS.latitude, NETHERLANDS_COORDS.longitude, now)
    
    // Calculate prayer times based on Islamic methodology
    const prayers: PrayerTime[] = [
      {
        name: "Fajr",
        arabic: "الفجر",
        time: calculateFajr(sunrise),
        timestamp: 0,
        isNext: false
      },
      {
        name: "Dhuhr", 
        arabic: "الظهر",
        time: calculateDhuhr(sunrise, sunset),
        timestamp: 0,
        isNext: false
      },
      {
        name: "Asr",
        arabic: "العصر", 
        time: calculateAsr(sunrise, sunset),
        timestamp: 0,
        isNext: false
      },
      {
        name: "Maghrib",
        arabic: "المغرب",
        time: formatTime(sunset),
        timestamp: sunset.getTime(),
        isNext: false
      },
      {
        name: "Isha",
        arabic: "العشاء",
        time: calculateIsha(sunset),
        timestamp: 0,
        isNext: false
      }
    ]

    // Set timestamps for all prayers
    prayers.forEach(prayer => {
      if (prayer.timestamp === 0) {
        const [hours, minutes] = prayer.time.split(':').map(Number)
        const prayerDate = new Date(now)
        prayerDate.setHours(hours, minutes, 0, 0)
        prayer.timestamp = prayerDate.getTime()
      }
    })

    setPrayerTimes(prayers)
    updateNextPrayer(prayers)
  }

  const getSunTimes = (lat: number, lng: number, date: Date) => {
    // Simplified sun calculation - for production, use a proper astronomy library
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    const p = Math.asin(0.39795 * Math.cos(0.98563 * (dayOfYear - 173) * Math.PI / 180))
    const argument = Math.tan(lat * Math.PI / 180) * Math.tan(p)
    
    let hourAngle = 0
    if (Math.abs(argument) < 1) {
      hourAngle = Math.acos(-argument) * 180 / Math.PI / 15
    }
    
    const sunrise = new Date(date)
    const sunset = new Date(date)
    
    sunrise.setHours(12 - hourAngle, 0, 0, 0)
    sunset.setHours(12 + hourAngle, 0, 0, 0)
    
    return { sunrise, sunset }
  }

  const calculateFajr = (sunrise: Date): string => {
    // Fajr: 18 degrees before sunrise (approximately 1.5 hours)
    const fajr = new Date(sunrise.getTime() - (90 * 60 * 1000))
    return formatTime(fajr)
  }

  const calculateDhuhr = (sunrise: Date, sunset: Date): string => {
    // Dhuhr: Midday between sunrise and sunset
    const midday = new Date((sunrise.getTime() + sunset.getTime()) / 2)
    return formatTime(midday)
  }

  const calculateAsr = (sunrise: Date, sunset: Date): string => {
    // Asr: Hanafi method - approximately 2.5 hours before Maghrib
    const asr = new Date(sunset.getTime() - (150 * 60 * 1000))
    return formatTime(asr)
  }

  const calculateIsha = (sunset: Date): string => {
    // Isha: 18 degrees after sunset (approximately 1.5 hours)
    const isha = new Date(sunset.getTime() + (90 * 60 * 1000))
    return formatTime(isha)
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const updateNextPrayer = (prayers = prayerTimes) => {
    const now = currentTime.getTime()
    
    // Find next prayer
    let next = prayers.find(prayer => prayer.timestamp > now)
    
    // If no prayer today, next is tomorrow's Fajr
    if (!next) {
      next = prayers[0] // Fajr
      // Add 24 hours to timestamp for tomorrow
      next = { ...next, timestamp: next.timestamp + (24 * 60 * 60 * 1000) }
    }
    
    setNextPrayer(next)
    
    // Calculate time until next prayer
    if (next) {
      const timeDiff = next.timestamp - now
      const hours = Math.floor(timeDiff / (1000 * 60 * 60))
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
      
      if (hours > 0) {
        setTimeToNext(`${hours}h ${minutes}m`)
      } else {
        setTimeToNext(`${minutes}m`)
      }
    }
  }

  const checkForPrayerTime = () => {
    if (!adhanEnabled) return
    
    const now = new Date()
    const currentTimeStr = formatTime(now)
    
    // Check if current time matches any prayer time
    const currentPrayer = prayerTimes.find(prayer => prayer.time === currentTimeStr)
    
    if (currentPrayer && !isPlaying) {
      playAdhan(currentPrayer)
    }
  }

  const playAdhan = (prayer?: PrayerTime) => {
    setIsPlaying(true)
    
    // Try to use online Adhan audio source
    const adhanUrl = 'https://www.islamcan.com/audio/adhan/azan1.mp3'
    
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = volume
      
      // Add error handling
      audioRef.current.onerror = () => {
        console.log('Adhan audio not available, using text-to-speech')
        // Fallback to enhanced text-to-speech Adhan
        playAdhanTTS(prayer)
      }
      
      audioRef.current.onended = () => {
        setIsPlaying(false)
      }
    }
    
    // Try to play online audio
    audioRef.current.src = adhanUrl
    audioRef.current.play().catch(() => {
      // If online audio fails, use text-to-speech
      playAdhanTTS(prayer)
    })
    
    // Show prayer notification
    if (prayer) {
      showPrayerNotification(prayer)
    }

    // Auto-stop after 3 minutes
    setTimeout(() => {
      setIsPlaying(false)
    }, 180000)
  }

  const playAdhanTTS = (prayer?: PrayerTime) => {
    // Enhanced text-to-speech Adhan with Arabic pronunciation
    const adhanText = [
      "Allahu Akbar, Allahu Akbar",
      "Allahu Akbar, Allahu Akbar",
      "Ash-hadu an la ilaha illallah",
      "Ash-hadu an la ilaha illallah",
      "Ash-hadu anna Muhammadan Rasulullah",
      "Ash-hadu anna Muhammadan Rasulullah",
      "Hayya 'ala-s-Salah",
      "Hayya 'ala-s-Salah",
      "Hayya 'ala-l-Falah",
      "Hayya 'ala-l-Falah",
      "Allahu Akbar, Allahu Akbar",
      "La ilaha illallah"
    ]
    
    let index = 0
    const speakNext = () => {
      if (index < adhanText.length && isPlaying) {
        const utterance = new SpeechSynthesisUtterance(adhanText[index])
        utterance.rate = 0.7
        utterance.pitch = 1.1
        utterance.volume = volume
        
        // Try to use Arabic voice if available
        const voices = speechSynthesis.getVoices()
        const arabicVoice = voices.find(v => v.lang.includes('ar'))
        if (arabicVoice) {
          utterance.voice = arabicVoice
        }
        
        utterance.onend = () => {
          index++
          setTimeout(speakNext, 500) // Pause between lines
        }
        
        speechSynthesis.speak(utterance)
      } else {
        setIsPlaying(false)
      }
    }
    
    speakNext()
  }

  const showPrayerNotification = (prayer: PrayerTime) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${prayer.name} Prayer Time`, {
        body: `It's time for ${prayer.name} (${prayer.arabic}) prayer`,
        icon: '/icons/mosque.png'
      })
    }
  }

  const stopAdhan = () => {
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
    }
    speechSynthesis.cancel()
  }

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission()
    }
  }

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-800">🕌 Live Adhan</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdhanEnabled(!adhanEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              adhanEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}
            title={adhanEnabled ? 'Disable Adhan' : 'Enable Adhan'}
          >
            {adhanEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          
          {isPlaying && (
            <button
              onClick={stopAdhan}
              className="p-2 bg-red-100 text-red-600 rounded-lg transition-colors"
              title="Stop Adhan"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Location Info */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <MapPin className="w-4 h-4" />
        <span>{location.city}, {location.country}</span>
        <Clock className="w-4 h-4 ml-2" />
        <span>{currentTime.toLocaleTimeString('en-NL', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: location.timezone
        })}</span>
      </div>

      {/* Next Prayer */}
      {nextPrayer && (
        <div className="bg-white/70 rounded-lg p-3 mb-3">
          <div className="text-center">
            <p className="text-sm text-gray-600">Next Prayer</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="font-bold text-lg text-green-700">{nextPrayer.name}</span>
              <span className="text-sm text-gray-600">({nextPrayer.arabic})</span>
            </div>
            <p className="font-mono text-xl font-bold text-gray-800">{nextPrayer.time}</p>
            <p className="text-sm text-green-600">in {timeToNext}</p>
          </div>
        </div>
      )}

      {/* Manual Adhan Button */}
      <div className="flex justify-center">
        <button
          onClick={() => playAdhan()}
          disabled={isPlaying}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isPlaying
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isPlaying ? 'Playing Adhan...' : '🔊 Play Adhan'}
        </button>
      </div>

      {/* Volume Control */}
      {adhanEnabled && (
        <div className="mt-3 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-gray-600" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-gray-600">{Math.round(volume * 100)}%</span>
        </div>
      )}

      {/* Status Indicator */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 p-2 bg-green-100 rounded-lg text-center"
          >
            <p className="text-sm text-green-700 font-medium">
              🎵 Adhan is playing...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}