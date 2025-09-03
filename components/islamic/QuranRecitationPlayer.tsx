"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, SkipBack, SkipForward, Volume2, Download, Heart, BookOpen, Repeat, Shuffle } from "lucide-react"

interface Reciter {
  id: string
  name: string
  arabic: string
  style: string
  country: string
}

interface Surah {
  number: number
  name: string
  arabic: string
  english: string
  verses: number
  revelation: 'Meccan' | 'Medinan'
}

// Online Quran audio sources from mp3quran.net
const POPULAR_RECITERS: Reciter[] = [
  { id: 'mishary', name: 'Mishary Rashid Al-Afasy', arabic: 'مشاري راشد العفاسي', style: 'Melodious', country: 'Kuwait' },
  { id: 'sudais', name: 'Abdul Rahman As-Sudais', arabic: 'عبد الرحمن السديس', style: 'Imam of Haram', country: 'Saudi Arabia' },
  { id: 'shuraim', name: 'Saud Al-Shuraim', arabic: 'سعود الشريم', style: 'Imam of Haram', country: 'Saudi Arabia' },
  { id: 'husary', name: 'Mahmoud Khalil Al-Husary', arabic: 'محمود خليل الحصري', style: 'Classical', country: 'Egypt' },
  { id: 'basfar', name: 'Abdullah Basfar', arabic: 'عبد الله بصفر', style: 'Emotional', country: 'Saudi Arabia' },
  { id: 'juhany', name: 'Abdullah Al-Juhany', arabic: 'عبد الله الجهني', style: 'Beautiful Voice', country: 'Saudi Arabia' },
  { id: 'ghamdi', name: 'Saad Al-Ghamdi', arabic: 'سعد الغامدي', style: 'Calm & Clear', country: 'Saudi Arabia' },
  { id: 'ajmi', name: 'Ahmed Al-Ajmi', arabic: 'أحمد العجمي', style: 'Melodious', country: 'Saudi Arabia' }
]

// Map reciters to their audio server URLs
const RECITER_SERVERS: Record<string, string> = {
  'mishary': 'https://server8.mp3quran.net/afs',
  'sudais': 'https://server11.mp3quran.net/sds', 
  'shuraim': 'https://server11.mp3quran.net/shur',
  'husary': 'https://server13.mp3quran.net/husr',
  'basfar': 'https://server9.mp3quran.net/basfer',
  'juhany': 'https://server11.mp3quran.net/jhn',
  'ghamdi': 'https://server10.mp3quran.net/gmd',
  'ajmi': 'https://server10.mp3quran.net/ajm'
}

const SURAHS: Surah[] = [
  { number: 1, name: "Al-Fatihah", arabic: "الفاتحة", english: "The Opening", verses: 7, revelation: "Meccan" },
  { number: 2, name: "Al-Baqarah", arabic: "البقرة", english: "The Cow", verses: 286, revelation: "Medinan" },
  { number: 3, name: "Al-Imran", arabic: "آل عمران", english: "The Family of Imran", verses: 200, revelation: "Medinan" },
  { number: 18, name: "Al-Kahf", arabic: "الكهف", english: "The Cave", verses: 110, revelation: "Meccan" },
  { number: 36, name: "Ya-Sin", arabic: "يس", english: "Ya-Sin", verses: 83, revelation: "Meccan" },
  { number: 55, name: "Ar-Rahman", arabic: "الرحمن", english: "The Most Merciful", verses: 78, revelation: "Medinan" },
  { number: 67, name: "Al-Mulk", arabic: "الملك", english: "The Sovereignty", verses: 30, revelation: "Meccan" },
  { number: 112, name: "Al-Ikhlas", arabic: "الإخلاص", english: "The Sincerity", verses: 4, revelation: "Meccan" },
  { number: 113, name: "Al-Falaq", arabic: "الفلق", english: "The Daybreak", verses: 5, revelation: "Meccan" },
  { number: 114, name: "An-Nas", arabic: "الناس", english: "The Mankind", verses: 6, revelation: "Meccan" }
]

interface QuranRecitationPlayerProps {
  compact?: boolean
}

export function QuranRecitationPlayer({ compact = false }: QuranRecitationPlayerProps) {
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(POPULAR_RECITERS[0])
  const [selectedSurah, setSelectedSurah] = useState<Surah>(SURAHS[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isLoading, setIsLoading] = useState(false)
  const [isRepeating, setIsRepeating] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [showReciters, setShowReciters] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('quran_favorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
      
      const audio = audioRef.current
      
      const updateTime = () => setCurrentTime(audio.currentTime)
      const updateDuration = () => setDuration(audio.duration)
      const handleEnd = () => {
        setIsPlaying(false)
        if (isRepeating) {
          audio.play()
          setIsPlaying(true)
        } else {
          playNext()
        }
      }
      const handleLoad = () => setIsLoading(false)
      const handleLoadStart = () => setIsLoading(true)
      
      audio.addEventListener('timeupdate', updateTime)
      audio.addEventListener('loadedmetadata', updateDuration)
      audio.addEventListener('ended', handleEnd)
      audio.addEventListener('canplay', handleLoad)
      audio.addEventListener('loadstart', handleLoadStart)
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime)
        audio.removeEventListener('loadedmetadata', updateDuration)
        audio.removeEventListener('ended', handleEnd)
        audio.removeEventListener('canplay', handleLoad)
        audio.removeEventListener('loadstart', handleLoadStart)
      }
    }
  }, [isRepeating])

  const getAudioUrl = (reciter: Reciter, surah: Surah) => {
    // Use real online Quran audio sources
    const serverUrl = RECITER_SERVERS[reciter.id]
    const surahNumber = surah.number.toString().padStart(3, '0')
    
    if (serverUrl) {
      return `${serverUrl}/${surahNumber}.mp3`
    }
    
    // Fallback to Mishary if reciter not found
    return `${RECITER_SERVERS.mishary}/${surahNumber}.mp3`
  }

  const playRecitation = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }

    const audioUrl = getAudioUrl(selectedReciter, selectedSurah)
    
    try {
      setIsLoading(true)
      audioRef.current.src = audioUrl
      
      // Add error handling for audio loading
      audioRef.current.onerror = () => {
        console.log('Online audio not available, using text-to-speech fallback')
        playTextToSpeechFallback()
      }
      
      // Try to play the actual audio
      await audioRef.current.play()
      setIsPlaying(true)
      setIsLoading(false)
      
    } catch (error) {
      console.error('Error playing recitation:', error)
      // Fallback to text-to-speech
      playTextToSpeechFallback()
    }
  }
  
  const playTextToSpeechFallback = () => {
    setIsLoading(false)
    
    // Enhanced text-to-speech with Arabic surah name
    const fallbackText = `${selectedSurah.name}, ${selectedSurah.arabic}, Chapter ${selectedSurah.number} by ${selectedReciter.name}`
    const utterance = new SpeechSynthesisUtterance(fallbackText)
    utterance.rate = 0.7
    utterance.pitch = 1.0
    utterance.volume = volume
    
    // Try to use Arabic voice
    const voices = speechSynthesis.getVoices()
    const arabicVoice = voices.find(v => v.lang.includes('ar'))
    if (arabicVoice) {
      utterance.voice = arabicVoice
    }
    
    utterance.onend = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    
    speechSynthesis.speak(utterance)
    setIsPlaying(true)
    
    // Simulate progress for TTS
    const duration = 30 // 30 seconds for TTS
    setDuration(duration)
    
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1
        if (newTime >= duration) {
          clearInterval(interval)
          setIsPlaying(false)
          setCurrentTime(0)
          return 0
        }
        return newTime
      })
    }, 1000)
  }

  const pauseRecitation = () => {
    setIsPlaying(false)
    speechSynthesis.cancel()
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseRecitation()
    } else {
      playRecitation()
    }
  }

  const playNext = () => {
    const currentIndex = SURAHS.findIndex(s => s.number === selectedSurah.number)
    const nextIndex = isShuffle 
      ? Math.floor(Math.random() * SURAHS.length)
      : (currentIndex + 1) % SURAHS.length
    
    setSelectedSurah(SURAHS[nextIndex])
    setTimeout(() => playRecitation(), 500)
  }

  const playPrevious = () => {
    const currentIndex = SURAHS.findIndex(s => s.number === selectedSurah.number)
    const prevIndex = isShuffle 
      ? Math.floor(Math.random() * SURAHS.length)
      : (currentIndex - 1 + SURAHS.length) % SURAHS.length
    
    setSelectedSurah(SURAHS[prevIndex])
    setTimeout(() => playRecitation(), 500)
  }

  const toggleFavorite = (surahId: string) => {
    const newFavorites = favorites.includes(surahId)
      ? favorites.filter(id => id !== surahId)
      : [...favorites, surahId]
    
    setFavorites(newFavorites)
    localStorage.setItem('quran_favorites', JSON.stringify(newFavorites))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-gray-800">{selectedSurah.name}</p>
              <p className="text-xs text-gray-600">{selectedReciter.name}</p>
            </div>
          </div>
          
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className={`p-2 rounded-full transition-colors ${
              isLoading ? 'bg-gray-200' : isPlaying 
                ? 'bg-red-500 text-white' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-800">📖 Quran Recitation</h3>
        </div>
        
        <button
          onClick={() => toggleFavorite(selectedSurah.number.toString())}
          className={`p-2 rounded-lg transition-colors ${
            favorites.includes(selectedSurah.number.toString())
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <Heart className={`w-5 h-5 ${favorites.includes(selectedSurah.number.toString()) ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Current Surah Info */}
      <div className="text-center mb-6">
        <h4 className="text-2xl font-bold text-gray-800 mb-1">{selectedSurah.name}</h4>
        <p className="text-3xl font-arabic text-green-700 mb-2">{selectedSurah.arabic}</p>
        <p className="text-gray-600">{selectedSurah.english} • {selectedSurah.verses} verses • {selectedSurah.revelation}</p>
        <p className="text-sm text-gray-500 mt-1">Chapter {selectedSurah.number}</p>
      </div>

      {/* Reciter Selection */}
      <div className="mb-4">
        <button
          onClick={() => setShowReciters(!showReciters)}
          className="w-full p-3 bg-white/70 rounded-lg border border-green-200 text-left flex items-center justify-between"
        >
          <div>
            <p className="font-medium text-gray-800">{selectedReciter.name}</p>
            <p className="text-sm text-gray-600">{selectedReciter.arabic} • {selectedReciter.style}</p>
          </div>
          <motion.div
            animate={{ rotate: showReciters ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ▼
          </motion.div>
        </button>

        <AnimatePresence>
          {showReciters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 bg-white rounded-lg border border-green-200 max-h-48 overflow-y-auto"
            >
              {POPULAR_RECITERS.map((reciter) => (
                <button
                  key={reciter.id}
                  onClick={() => {
                    setSelectedReciter(reciter)
                    setShowReciters(false)
                  }}
                  className={`w-full p-3 text-left hover:bg-green-50 transition-colors border-b border-green-100 last:border-b-0 ${
                    selectedReciter.id === reciter.id ? 'bg-green-50' : ''
                  }`}
                >
                  <p className="font-medium text-gray-800">{reciter.name}</p>
                  <p className="text-sm text-gray-600">{reciter.arabic} • {reciter.country}</p>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Surah Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Surah</label>
        <select
          value={selectedSurah.number}
          onChange={(e) => {
            const surah = SURAHS.find(s => s.number === parseInt(e.target.value))
            if (surah) setSelectedSurah(surah)
          }}
          className="w-full p-2 border border-green-200 rounded-lg focus:outline-none focus:border-green-400"
        >
          {SURAHS.map((surah) => (
            <option key={surah.number} value={surah.number}>
              {surah.number}. {surah.name} - {surah.arabic}
            </option>
          ))}
        </select>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={() => setIsShuffle(!isShuffle)}
          className={`p-2 rounded-lg transition-colors ${
            isShuffle ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
          }`}
          title="Shuffle"
        >
          <Shuffle className="w-5 h-5" />
        </button>

        <button
          onClick={playPrevious}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <SkipBack className="w-6 h-6 text-gray-700" />
        </button>

        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className={`p-4 rounded-full shadow-lg hover:shadow-xl transition-all ${
            isLoading ? 'bg-gray-200' : isPlaying 
              ? 'bg-red-500 text-white' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isLoading ? (
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8" />
          )}
        </button>

        <button
          onClick={playNext}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <SkipForward className="w-6 h-6 text-gray-700" />
        </button>

        <button
          onClick={() => setIsRepeating(!isRepeating)}
          className={`p-2 rounded-lg transition-colors ${
            isRepeating ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
          }`}
          title="Repeat"
        >
          <Repeat className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-gray-600" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm text-gray-600 min-w-12">{Math.round(volume * 100)}%</span>
      </div>

      {/* Status */}
      {isPlaying && (
        <div className="mt-4 p-2 bg-green-100 rounded-lg text-center">
          <p className="text-sm text-green-700">
            🎵 Now playing: {selectedSurah.name} by {selectedReciter.name}
          </p>
        </div>
      )}
    </motion.div>
  )
}