"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, Heart, BookOpen, CheckCircle, Star, Sunrise, Moon, Coffee, Activity } from "lucide-react"

interface JourneyEvent {
  id: string
  type: 'prayer' | 'note' | 'task' | 'achievement' | 'mood' | 'milestone'
  title: string
  description: string
  time: string
  timestamp: number
  icon: any
  color: string
  spaceType?: string
  emotion?: string
  achievement?: string
}

interface DailyStory {
  date: string
  events: JourneyEvent[]
  mood: string
  highlights: string[]
  summary: string
  achievements: number
  totalActions: number
}

export function DailyJourneyStory() {
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString())
  const [story, setStory] = useState<DailyStory | null>(null)
  const [showFullStory, setShowFullStory] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    generateDailyStory(selectedDate)
  }, [selectedDate])

  const generateDailyStory = async (dateString: string) => {
    setIsGenerating(true)
    
    try {
      // Gather all activities for the selected date
      const events = await gatherDayEvents(dateString)
      
      // Generate story narrative
      const storyData: DailyStory = {
        date: dateString,
        events,
        mood: determineDayMood(events),
        highlights: extractHighlights(events),
        summary: generateStorySummary(events),
        achievements: events.filter(e => e.type === 'achievement').length,
        totalActions: events.length
      }
      
      setStory(storyData)
    } catch (error) {
      console.error('Error generating story:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const gatherDayEvents = async (dateString: string): Promise<JourneyEvent[]> => {
    const events: JourneyEvent[] = []
    const date = new Date(dateString)
    
    // Check prayers completed
    const prayersKey = `prayers_${dateString}`
    const completedPrayers = JSON.parse(localStorage.getItem(prayersKey) || '[]')
    
    const prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
    prayerNames.forEach((prayer, index) => {
      if (completedPrayers.includes(prayer)) {
        events.push({
          id: `prayer-${prayer}`,
          type: 'prayer',
          title: `${prayer.charAt(0).toUpperCase() + prayer.slice(1)} Prayer`,
          description: `Completed ${prayer} prayer on time`,
          time: ['05:30', '12:30', '15:45', '18:30', '20:00'][index],
          timestamp: date.getTime() + (index * 2 * 60 * 60 * 1000),
          icon: Moon,
          color: '#10B981',
          spaceType: 'FAITH'
        })
      }
    })

    // Check dhikr activities
    const dhikrKey = `dhikr_${dateString}`
    const dhikrData = localStorage.getItem(dhikrKey)
    if (dhikrData) {
      const dhikrList = JSON.parse(dhikrData)
      const completedDhikr = dhikrList.filter((d: any) => d.count >= d.target)
      
      if (completedDhikr.length > 0) {
        events.push({
          id: 'dhikr-complete',
          type: 'achievement',
          title: 'Dhikr Completed',
          description: `Completed ${completedDhikr.length} dhikr sessions`,
          time: '14:00',
          timestamp: date.getTime() + (14 * 60 * 60 * 1000),
          icon: Star,
          color: '#8B5CF6',
          achievement: `${completedDhikr.length} Dhikr Sessions`
        })
      }
    }

    // Check notes created
    const spaces = ['PROJECTS', 'FAMILY', 'HOME', 'LOVE', 'BUYING', 'CAREER', 'FAITH']
    spaces.forEach(space => {
      const notes = JSON.parse(localStorage.getItem(`notes_${space}`) || '[]')
      const dayNotes = notes.filter((note: any) => 
        new Date(note.createdAt).toDateString() === dateString
      )
      
      dayNotes.forEach((note: any, index: number) => {
        events.push({
          id: `note-${space}-${index}`,
          type: 'note',
          title: `Created ${note.isVoiceNote ? 'Voice' : 'Text'} Note`,
          description: note.title || note.content?.substring(0, 50) + '...' || 'New note',
          time: new Date(note.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date(note.createdAt).getTime(),
          icon: note.isVoiceNote ? Activity : BookOpen,
          color: '#3B82F6',
          spaceType: space
        })
      })
    })

    // Check mood entries
    const moodEntries = spaces.map(space => {
      const moodKey = `mood_${space}_${dateString}`
      const mood = localStorage.getItem(moodKey)
      return mood ? { space, mood: parseInt(mood) } : null
    }).filter(Boolean)

    if (moodEntries.length > 0) {
      const avgMood = moodEntries.reduce((sum, entry) => sum + (entry?.mood || 0), 0) / moodEntries.length
      const moodEmojis = ['😢', '😐', '🙂', '😊', '🤩']
      
      events.push({
        id: 'mood-tracker',
        type: 'mood',
        title: 'Mood Tracked',
        description: `Average mood: ${moodEmojis[Math.round(avgMood)]}`,
        time: '20:00',
        timestamp: date.getTime() + (20 * 60 * 60 * 1000),
        icon: Heart,
        color: '#EC4899',
        emotion: moodEmojis[Math.round(avgMood)]
      })
    }

    // Check achievements (level ups, milestones)
    const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}')
    if (userProgress.totalActions > 0) {
      const level = Math.floor(userProgress.xp / 100) + 1
      
      events.push({
        id: 'level-progress',
        type: 'milestone',
        title: `Level ${level} Progress`,
        description: `${userProgress.totalActions} total actions • ${userProgress.coins} coins earned`,
        time: '23:00',
        timestamp: date.getTime() + (23 * 60 * 60 * 1000),
        icon: Star,
        color: '#F59E0B'
      })
    }

    // Sort events by time
    return events.sort((a, b) => a.timestamp - b.timestamp)
  }

  const determineDayMood = (events: JourneyEvent[]): string => {
    const moodEvent = events.find(e => e.type === 'mood')
    if (moodEvent?.emotion) return moodEvent.emotion

    // Determine mood based on activities
    const prayerCount = events.filter(e => e.type === 'prayer').length
    const achievementCount = events.filter(e => e.type === 'achievement').length
    
    if (prayerCount >= 4 && achievementCount > 0) return '🤩'
    if (prayerCount >= 3) return '😊'
    if (events.length >= 3) return '🙂'
    if (events.length >= 1) return '😐'
    return '😢'
  }

  const extractHighlights = (events: JourneyEvent[]): string[] => {
    const highlights: string[] = []
    
    const prayerCount = events.filter(e => e.type === 'prayer').length
    if (prayerCount === 5) highlights.push('🕌 Completed all 5 daily prayers')
    else if (prayerCount >= 3) highlights.push(`🕌 Completed ${prayerCount} prayers`)
    
    const noteCount = events.filter(e => e.type === 'note').length
    if (noteCount > 0) highlights.push(`📝 Created ${noteCount} note${noteCount > 1 ? 's' : ''}`)
    
    const achievements = events.filter(e => e.type === 'achievement')
    achievements.forEach(achievement => {
      highlights.push(`⭐ ${achievement.description}`)
    })
    
    if (highlights.length === 0) {
      highlights.push('🌱 A quiet day of reflection')
    }
    
    return highlights
  }

  const generateStorySummary = (events: JourneyEvent[]): string => {
    if (events.length === 0) {
      return "Today was a day of rest and contemplation. Sometimes the most profound growth happens in stillness."
    }

    const hasMultiplePrayers = events.filter(e => e.type === 'prayer').length >= 3
    const hasNotes = events.filter(e => e.type === 'note').length > 0
    const hasAchievements = events.filter(e => e.type === 'achievement').length > 0
    
    let story = "Today's journey began with "
    
    if (hasMultiplePrayers) {
      story += "faithful prayer and remembrance of Allah. "
    } else {
      story += "small but meaningful steps forward. "
    }
    
    if (hasNotes) {
      story += "You took time to reflect and document your thoughts, creating lasting memories of your experiences. "
    }
    
    if (hasAchievements) {
      story += "Your dedication was rewarded with personal achievements and spiritual growth. "
    }
    
    story += "Each action, no matter how small, contributed to your journey of self-improvement and spiritual development."
    
    return story
  }

  const getTimeOfDayIcon = (hour: number) => {
    if (hour < 6) return Moon
    if (hour < 12) return Sunrise
    if (hour < 18) return Coffee
    return Moon
  }

  const getTimeOfDayColor = (hour: number) => {
    if (hour < 6) return '#4338CA'
    if (hour < 12) return '#F59E0B'
    if (hour < 18) return '#10B981'
    return '#6366F1'
  }

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Crafting your daily story...</p>
        </div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No story data available</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Story Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📖 Your Daily Journey</h2>
        <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
          <Calendar className="w-5 h-5" />
          <span>{new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
        
        {/* Day Summary Card */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-center">
              <div className="text-3xl mb-1">{story.mood}</div>
              <p className="text-sm text-gray-600">Overall Mood</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">{story.totalActions}</div>
              <p className="text-sm text-gray-600">Activities</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{story.achievements}</div>
              <p className="text-sm text-gray-600">Achievements</p>
            </div>
          </div>
          
          <p className="text-gray-700 text-center italic">"{story.summary}"</p>
        </div>
      </div>

      {/* Highlights */}
      <div className="bg-white/80 rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500" />
          Today's Highlights
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {story.highlights.map((highlight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-gray-800">{highlight}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white/80 rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-500" />
            Journey Timeline
          </h3>
          
          <button
            onClick={() => setShowFullStory(!showFullStory)}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
          >
            {showFullStory ? 'Show Less' : 'Full Story'}
          </button>
        </div>

        <div className="space-y-4">
          {(showFullStory ? story.events : story.events.slice(0, 5)).map((event, index) => {
            const hour = parseInt(event.time.split(':')[0])
            const TimeIcon = getTimeOfDayIcon(hour)
            const timeColor = getTimeOfDayColor(hour)
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all"
              >
                {/* Time & Icon */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div 
                    className="p-2 rounded-full text-white mb-1"
                    style={{ backgroundColor: event.color }}
                  >
                    <event.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-mono text-gray-600">{event.time}</span>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800">{event.title}</h4>
                    {event.spaceType && (
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                        {event.spaceType}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{event.description}</p>
                  
                  {event.achievement && (
                    <div className="mt-2 inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      🏆 {event.achievement}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {!showFullStory && story.events.length > 5 && (
          <div className="text-center mt-4">
            <p className="text-gray-500 text-sm">
              +{story.events.length - 5} more activities...
            </p>
          </div>
        )}
      </div>

      {/* Date Selector */}
      <div className="bg-white/80 rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Explore Other Days</h3>
        <div className="flex gap-2 flex-wrap">
          {[-2, -1, 0, 1].map((dayOffset) => {
            const date = new Date()
            date.setDate(date.getDate() + dayOffset)
            const dateString = date.toDateString()
            const isSelected = selectedDate === dateString
            
            return (
              <button
                key={dayOffset}
                onClick={() => setSelectedDate(dateString)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isSelected 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {dayOffset === 0 ? 'Today' : 
                 dayOffset === -1 ? 'Yesterday' :
                 dayOffset === 1 ? 'Tomorrow' :
                 date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}