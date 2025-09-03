"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Book, BookOpen, Star, Calendar, Target, CheckCircle } from "lucide-react"

interface QuranProgress {
  surah: number
  verse: number
  lastRead: string
  pagesRead: number
  totalPages: number
  streak: number
  monthlyGoal: number
  monthlyRead: number
}

interface Surah {
  number: number
  name: string
  arabic: string
  english: string
  verses: number
  revelation: 'Meccan' | 'Medinan'
}

// First 30 Surahs for demo (in practice, you'd have all 114)
const SURAHS: Surah[] = [
  { number: 1, name: "Al-Fatihah", arabic: "الفاتحة", english: "The Opening", verses: 7, revelation: "Meccan" },
  { number: 2, name: "Al-Baqarah", arabic: "البقرة", english: "The Cow", verses: 286, revelation: "Medinan" },
  { number: 3, name: "Al-Imran", arabic: "آل عمران", english: "The Family of Imran", verses: 200, revelation: "Medinan" },
  { number: 4, name: "An-Nisa", arabic: "النساء", english: "The Women", verses: 176, revelation: "Medinan" },
  { number: 5, name: "Al-Ma'idah", arabic: "المائدة", english: "The Table", verses: 120, revelation: "Medinan" },
  { number: 6, name: "Al-An'am", arabic: "الأنعام", english: "The Cattle", verses: 165, revelation: "Meccan" },
  { number: 7, name: "Al-A'raf", arabic: "الأعراف", english: "The Heights", verses: 206, revelation: "Meccan" },
  { number: 8, name: "Al-Anfal", arabic: "الأنفال", english: "The Spoils of War", verses: 75, revelation: "Medinan" },
  { number: 9, name: "At-Tawbah", arabic: "التوبة", english: "The Repentance", verses: 129, revelation: "Medinan" },
  { number: 10, name: "Yunus", arabic: "يونس", english: "Jonah", verses: 109, revelation: "Meccan" },
]

const DAILY_VERSES = [
  {
    arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
    english: "And whoever fears Allah - He will make for him a way out.",
    reference: "At-Talaq 65:2",
    transliteration: "Wa man yattaqi Allaha yaj'al lahu makhrajan"
  },
  {
    arabic: "وَاللَّهُ غَالِبٌ عَلَىٰ أَمْرِهِ وَلَٰكِنَّ أَكْثَرَ النَّاسِ لَا يَعْلَمُونَ",
    english: "And Allah is predominant over His affair, but most of the people do not know.",
    reference: "Yusuf 12:21",
    transliteration: "Wallahu ghalibun 'ala amrihi walakin akthara an-nasi la ya'lamun"
  }
]

export function QuranTracker() {
  const [progress, setProgress] = useState<QuranProgress>({
    surah: 1,
    verse: 1,
    lastRead: "",
    pagesRead: 0,
    totalPages: 604,
    streak: 0,
    monthlyGoal: 30,
    monthlyRead: 0
  })
  const [dailyVerse] = useState(DAILY_VERSES[new Date().getDate() % DAILY_VERSES.length])
  const [showProgress, setShowProgress] = useState(true)

  useEffect(() => {
    // Load Quran reading progress
    const savedProgress = localStorage.getItem('quran_progress')
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress))
    }
  }, [])

  const saveProgress = (newProgress: QuranProgress) => {
    setProgress(newProgress)
    localStorage.setItem('quran_progress', JSON.stringify(newProgress))
  }

  const markReadingSession = (pages: number) => {
    const today = new Date().toDateString()
    const newProgress = {
      ...progress,
      pagesRead: progress.pagesRead + pages,
      lastRead: today,
      monthlyRead: progress.monthlyRead + pages,
      streak: progress.lastRead === today ? progress.streak : progress.streak + 1
    }

    saveProgress(newProgress)

    // Award coins
    const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}')
    if (userProgress.coins !== undefined) {
      userProgress.coins = (userProgress.coins || 0) + (pages * 5)
      userProgress.xp = (userProgress.xp || 0) + (pages * 5)
      userProgress.totalActions = (userProgress.totalActions || 0) + 1
      localStorage.setItem('userProgress', JSON.stringify(userProgress))
    }
  }

  const updateCurrentPosition = (surah: number, verse: number) => {
    const newProgress = { ...progress, surah, verse }
    saveProgress(newProgress)
  }

  const getCurrentSurah = () => {
    return SURAHS.find(s => s.number === progress.surah) || SURAHS[0]
  }

  const getProgressPercentage = () => {
    return Math.round((progress.pagesRead / progress.totalPages) * 100)
  }

  const getMonthlyProgressPercentage = () => {
    return Math.round((progress.monthlyRead / progress.monthlyGoal) * 100)
  }

  const isReadToday = () => {
    return progress.lastRead === new Date().toDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">📖 Quran Tracker</h3>
        <p className="text-sm text-gray-600">Track your daily Quran reading journey</p>
      </div>

      {/* Daily Verse */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200"
      >
        <div className="text-center">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Verse of the Day
          </h4>
          <div className="space-y-3">
            <p className="text-xl text-right leading-relaxed font-arabic">{dailyVerse.arabic}</p>
            <p className="text-sm text-gray-700 italic">"{dailyVerse.english}"</p>
            <p className="text-xs text-gray-600">{dailyVerse.transliteration}</p>
            <p className="text-xs text-green-700 font-medium">- {dailyVerse.reference}</p>
          </div>
        </div>
      </motion.div>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <Book className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600">{progress.pagesRead}</p>
          <p className="text-xs text-blue-700">Pages Read</p>
          <p className="text-xs text-gray-500">{getProgressPercentage()}% Complete</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 text-center">
          <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">{progress.streak}</p>
          <p className="text-xs text-green-700">Day Streak</p>
          <p className="text-xs text-gray-500">{isReadToday() ? "Read today ✅" : "Not read today"}</p>
        </div>
      </div>

      {/* Monthly Goal */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Monthly Goal
          </h4>
          <span className="text-sm text-gray-600">
            {progress.monthlyRead}/{progress.monthlyGoal} pages
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(getMonthlyProgressPercentage(), 100)}%` }}
          />
        </div>
        
        <p className="text-xs text-center text-gray-600">
          {getMonthlyProgressPercentage()}% of monthly goal achieved
        </p>
      </div>

      {/* Current Position */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Current Position
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Surah {getCurrentSurah().number}</p>
              <p className="text-sm text-gray-600">{getCurrentSurah().name}</p>
              <p className="text-sm text-gray-500">{getCurrentSurah().arabic}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-indigo-600">
                Verse {progress.verse}
              </p>
              <p className="text-xs text-gray-500">
                of {getCurrentSurah().verses}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={progress.surah}
              onChange={(e) => updateCurrentPosition(Number(e.target.value), 1)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
            >
              {SURAHS.map(surah => (
                <option key={surah.number} value={surah.number}>
                  {surah.number}. {surah.name}
                </option>
              ))}
            </select>
            
            <input
              type="number"
              min="1"
              max={getCurrentSurah().verses}
              value={progress.verse}
              onChange={(e) => updateCurrentPosition(progress.surah, Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
              placeholder="Verse"
            />
          </div>
        </div>
      </div>

      {/* Reading Session */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3">Today's Reading Session</h4>
        
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[1, 2, 3, 5].map(pages => (
            <button
              key={pages}
              onClick={() => markReadingSession(pages)}
              className="py-2 px-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
            >
              +{pages} page{pages > 1 ? 's' : ''}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => markReadingSession(1)}
            className="py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Mark as Read
          </button>
          
          <button
            onClick={() => setProgress({ ...progress, monthlyGoal: progress.monthlyGoal + 5 })}
            className="py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
          >
            <Target className="w-5 h-5 inline mr-2" />
            Adjust Goal
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="text-center text-sm text-gray-600">
        <p>Last read: {progress.lastRead || "Never"}</p>
        <p>Total progress: {getProgressPercentage()}% of Quran completed</p>
      </div>
    </div>
  )
}