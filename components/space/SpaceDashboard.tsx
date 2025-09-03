"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Share, Settings, Plus, Mic } from "lucide-react"
import { useTransition } from "@/contexts/TransitionContext"
import { NotesList } from "@/components/notes/NotesList"
import { NoteModal } from "@/components/notes/NoteModal"
import { GoalsManager } from "@/components/goals/GoalsManager"
import { useUserProgress } from "@/lib/user-progress"
import { VoiceRecorder } from "@/components/quick-tools/VoiceRecorder"
import { PhotoUpload } from "@/components/quick-tools/PhotoUpload"
import { QuickTask } from "@/components/quick-tools/QuickTask"
import { QuickSchedule } from "@/components/quick-tools/QuickSchedule"
import { GroceryVoiceRecorder } from "@/components/quick-tools/GroceryVoiceRecorder"
import { VoiceNoteModal } from "@/components/notes/VoiceNoteModal"
import { VIPShoppingCard } from "@/components/shopping/VIPShoppingCard"
import { ConsciousShoppingWidget } from "@/components/shopping/ConsciousShoppingWidget"
import { PrayerTimes } from "@/components/islamic/PrayerTimes"
import { DhikrCounter } from "@/components/islamic/DhikrCounter"
import { QuranTracker } from "@/components/islamic/QuranTracker"
import { AdhanSystem } from "@/components/islamic/AdhanSystem"
import { QuranRecitationPlayer } from "@/components/islamic/QuranRecitationPlayer"
import { DailyJourneyStory } from "@/components/storytelling/DailyJourneyStory"
import { CVViewer } from "@/components/career/CVViewer"
import { SportsManager } from "@/components/sports/SportsManager"

interface SpaceDashboardProps {
  space: {
    type: string
    name: string
    color: string
    iconName: string
    description: string
  }
}

export function SpaceDashboard({ space }: SpaceDashboardProps) {
  const { slideToHome } = useTransition()
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { progress, addCoins, COIN_REWARDS } = useUserProgress()
  const [activeQuickTool, setActiveQuickTool] = useState<'voice' | 'photo' | 'task' | 'schedule' | 'grocery' | null>(null)
  const [showVoiceNote, setShowVoiceNote] = useState(false)
  const [showFullCV, setShowFullCV] = useState(false)
  const [loveCount, setLoveCount] = useState(() => {
    const saved = localStorage.getItem(`loveCount_${space.type}`)
    return saved ? parseInt(saved) : 0
  })
  const [recentNotes, setRecentNotes] = useState<any[]>([])

  useEffect(() => {
    addCoins(COIN_REWARDS.SPACE_VISIT)
    loadRecentNotes()
  }, [space.type, refreshKey])

  const loadRecentNotes = () => {
    const notes = JSON.parse(localStorage.getItem(`notes_${space.type}`) || '[]')
    setRecentNotes(notes.slice(0, 3)) // Show only the 3 most recent
  }

  const handleSaveNote = async (note: { title: string; content: string; audioBlob?: Blob; transcript?: string; shareWithFamily?: boolean }) => {
    try {
      // In demo mode, save to localStorage
      const noteData = {
        id: Date.now().toString(),
        spaceType: space.type,
        spaceName: space.name,
        title: note.title,
        content: note.content,
        hasAudio: !!note.audioBlob,
        transcript: note.transcript,
        isVoiceNote: !!note.audioBlob,
        shareWithFamily: note.shareWithFamily || false,
        createdAt: new Date().toISOString()
      }
      
      // Store audio blob separately with base64 encoding for localStorage
      if (note.audioBlob) {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64Audio = reader.result as string
          localStorage.setItem(`audio_${noteData.id}`, base64Audio)
        }
        reader.readAsDataURL(note.audioBlob)
      }
      
      const existingNotes = JSON.parse(localStorage.getItem(`notes_${space.type}`) || '[]')
      existingNotes.unshift(noteData)
      localStorage.setItem(`notes_${space.type}`, JSON.stringify(existingNotes))
      
      // Also save to user-specific notes for family activity feed
      const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}')
      if (currentUser.id) {
        const userNotes = JSON.parse(localStorage.getItem(`notes_${currentUser.id}`) || '[]')
        userNotes.unshift(noteData)
        localStorage.setItem(`notes_${currentUser.id}`, JSON.stringify(userNotes))
      }
      
      // Reward coins for creating a note (bonus for voice notes)
      addCoins(note.audioBlob ? COIN_REWARDS.CREATE_NOTE + 5 : COIN_REWARDS.CREATE_NOTE)
      
      // Trigger notes list refresh
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }

  const handleAddLove = () => {
    const newCount = loveCount + 1
    setLoveCount(newCount)
    localStorage.setItem(`loveCount_${space.type}`, newCount.toString())
    addCoins(5)
    setIsNoteModalOpen(true)
  }

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.5
      }}
      className="fixed inset-0 bg-gradient-to-br from-sky-blue/20 to-peach-pink/20 backdrop-blur-sm overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${space.color}10 0%, #87CEEB 50%, #FFB6C1 100%)`
      }}
    >
      {/* Header */}
      <motion.header 
        className="mt-16 h-16 sm:h-20 bg-white/70 backdrop-blur-xl border-b border-white/40 px-4 sm:px-6 flex items-center justify-between"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="flex items-center gap-2 sm:gap-4">
          <motion.button
            onClick={slideToHome}
            className="p-1.5 sm:p-2 bg-white/60 hover:bg-white/90 rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg"
            whileHover={{ x: -3, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          </motion.button>
          <div 
            className="p-2 rounded-xl shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${space.color}20 0%, ${space.color}10 100%)`,
              border: `1px solid ${space.color}40`
            }}
          >
            <div className="w-6 h-6" style={{ color: space.color }}>
              {/* Icon will be rendered here */}
              <div className="w-6 h-6 rounded bg-current opacity-80" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">{space.name}</h1>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block truncate">{space.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <motion.button
            className="p-1.5 sm:p-2 bg-white/60 hover:bg-white/90 rounded-lg sm:rounded-xl transition-all duration-200"
            whileHover={{ y: -2 }}
          >
            <Save className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          </motion.button>
          <motion.button
            className="p-1.5 sm:p-2 bg-white/60 hover:bg-white/90 rounded-lg sm:rounded-xl transition-all duration-200"
            whileHover={{ y: -2 }}
          >
            <Share className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          </motion.button>
          <motion.button
            className="p-1.5 sm:p-2 bg-white/60 hover:bg-white/90 rounded-lg sm:rounded-xl transition-all duration-200"
            whileHover={{ y: -2, rotate: 90 }}
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="h-[calc(100vh-128px)] sm:h-[calc(100vh-160px)] flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel - Notes */}
        <motion.div 
          className="w-full md:w-1/2 p-3 sm:p-4 md:p-6 flex flex-col"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">✍️ Notes</h2>
            <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
              <motion.button
                onClick={() => setIsNoteModalOpen(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm flex-1 sm:flex-none justify-center active:scale-95 touch-manipulation"
                style={{ backgroundColor: space.color }}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Text Note</span>
              </motion.button>
              
              <motion.button
                onClick={() => setShowVoiceNote(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium bg-red-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-red-600 text-xs sm:text-sm flex-1 sm:flex-none justify-center active:scale-95 touch-manipulation"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Voice Note - Perfect for hands-free use"
              >
                <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Voice</span>
              </motion.button>
            </div>
          </div>
          
          <div className="flex-1 bg-white/60 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/40 shadow-lg overflow-auto p-3 sm:p-4 md:p-6 min-h-0">
            <NotesList key={refreshKey} spaceType={space.type} spaceName={space.name} />
          </div>
        </motion.div>

        {/* Right Panel - Widgets */}
        <motion.div 
          className="w-full md:w-1/2 p-3 sm:p-4 md:p-6 flex flex-col gap-3 sm:gap-4 md:gap-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent max-h-[50vh] md:max-h-none"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">🎯 Quick Actions</h2>
          
          {/* Recent Notes Widget */}
          <motion.div 
            className="bg-white/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/40 shadow-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">📝 Recent Notes</h3>
            <div className="space-y-2 max-h-24 sm:max-h-32 overflow-y-auto">
              {recentNotes.length > 0 ? (
                recentNotes.map((note) => (
                  <div key={note.id} className="p-2 sm:p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors active:scale-95 touch-manipulation">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      {note.isVoiceNote && <Mic className="w-3 h-3 text-red-500 flex-shrink-0" />}
                      <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                        {note.title || 'Untitled'}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {note.transcript ? 
                        (note.transcript.length > 50 ? `${note.transcript.slice(0, 50)}...` : note.transcript) :
                        (note.content.length > 60 ? `${note.content.slice(0, 60)}...` : note.content)
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-2 sm:p-3 bg-white/50 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">No notes yet</p>
                  <p className="text-xs text-gray-500 mt-1">Start writing to see them here</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Space-specific widget */}
          <motion.div 
            className="bg-white/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/40 shadow-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {space.type === 'LOVE' && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">💕 Love Counter</h3>
                <div className="text-center">
                  <motion.div 
                    className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" 
                    style={{ color: space.color }}
                    key={loveCount}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {loveCount}
                  </motion.div>
                  <p className="text-xs sm:text-sm text-gray-600">Beautiful moments shared</p>
                  <button 
                    onClick={handleAddLove}
                    className="mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity text-xs sm:text-sm active:scale-95 touch-manipulation"
                    style={{ backgroundColor: space.color }}
                  >
                    Add Moment ❤️
                  </button>
                </div>
              </div>
            )}
            
            {space.type === 'PROJECTS' && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">🚀 Active Projects</h3>
                <div className="space-y-2">
                  <div className="p-2 sm:p-3 bg-white/50 rounded-lg">
                    <p className="font-medium text-xs sm:text-sm">Life Dashboard</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-1 sm:mt-2">
                      <div 
                        className="h-1.5 sm:h-2 rounded-full transition-all duration-500"
                        style={{ backgroundColor: space.color, width: '85%' }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">85% complete</p>
                  </div>
                  <button
                    onClick={() => setIsNoteModalOpen(true)}
                    className="w-full mt-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-xs sm:text-sm font-medium active:scale-95 touch-manipulation"
                  >
                    + Add New Project
                  </button>
                </div>
              </div>
            )}

            {space.type === 'FAMILY' && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">👨‍👩‍👧‍👦 Family Calendar</h3>
                <div className="space-y-2">
                  <div className="p-2 sm:p-3 bg-white/50 rounded-lg">
                    <p className="font-medium text-xs sm:text-sm">Family Dinner</p>
                    <p className="text-xs text-gray-500">Sunday, 6:00 PM</p>
                  </div>
                  <button
                    onClick={() => setIsNoteModalOpen(true)}
                    className="w-full mt-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-xs sm:text-sm font-medium active:scale-95 touch-manipulation"
                  >
                    + Add Family Event
                  </button>
                </div>
              </div>
            )}

            {space.type === 'FAITH' && (
              <div className="space-y-4">
                <AdhanSystem location={{ city: "Amsterdam", country: "Netherlands", timezone: "Europe/Amsterdam" }} />
                <PrayerTimes city="Amsterdam" country="Netherlands" />
              </div>
            )}
            
            {/* VIP Shopping Widget */}
            {space.type === 'VIP_SHOPPING' && (
              <VIPShoppingCard />
            )}
            
            {/* Conscious Buying - Shopping aggregation */}
            {space.type === 'BUYING' && (
              <div>
                <ConsciousShoppingWidget spaceType={space.type} />
              </div>
            )}

            {space.type === 'STORYTELLING' && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">📖 Your Daily Story</h3>
                <DailyJourneyStory />
              </div>
            )}

            {space.type === 'CAREER' && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">💼 Professional Profile</h3>
                <CVViewer variant="compact" />
                <button
                  onClick={() => setShowFullCV(true)}
                  className="w-full mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-xs sm:text-sm active:scale-95 touch-manipulation"
                >
                  View Full CV
                </button>
              </div>
            )}

            {space.type === 'SPORTS' && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">🏃 Sports & Fitness</h3>
                <SportsManager />
              </div>
            )}

            {/* Default widget for other spaces */}
            {!['LOVE', 'PROJECTS', 'FAMILY', 'FAITH', 'STORYTELLING', 'CAREER', 'VIP_SHOPPING', 'BUYING'].includes(space.type) && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-base sm:text-lg flex items-center gap-2">
                  🚀 <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Super Tools</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <motion.button 
                    onClick={() => setActiveQuickTool('photo')}
                    className="p-4 sm:p-5 bg-gradient-to-br from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 rounded-2xl transition-all text-sm sm:text-base font-medium active:scale-95 touch-manipulation shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    whileTap={{ scale: 0.95, rotate: -2 }}
                  >
                    <div className="text-3xl sm:text-4xl mb-2">📸</div>
                    <div className="text-purple-800">Snap It!</div>
                  </motion.button>
                  <motion.button 
                    onClick={() => setActiveQuickTool('voice')}
                    className="p-4 sm:p-5 bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 rounded-2xl transition-all text-sm sm:text-base font-medium active:scale-95 touch-manipulation shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    whileTap={{ scale: 0.95, rotate: 2 }}
                  >
                    <div className="text-3xl sm:text-4xl mb-2">🎤</div>
                    <div className="text-blue-800">Voice It!</div>
                  </motion.button>
                  <motion.button 
                    onClick={() => setActiveQuickTool('task')}
                    className="p-4 sm:p-5 bg-gradient-to-br from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 rounded-2xl transition-all text-sm sm:text-base font-medium active:scale-95 touch-manipulation shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    whileTap={{ scale: 0.95, rotate: -2 }}
                  >
                    <div className="text-3xl sm:text-4xl mb-2">⚡</div>
                    <div className="text-green-800">Task It!</div>
                  </motion.button>
                  <motion.button 
                    onClick={() => setActiveQuickTool('schedule')}
                    className="p-4 sm:p-5 bg-gradient-to-br from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 rounded-2xl transition-all text-sm sm:text-base font-medium active:scale-95 touch-manipulation shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    whileTap={{ scale: 0.95, rotate: 2 }}
                  >
                    <div className="text-3xl sm:text-4xl mb-2">🗓️</div>
                    <div className="text-orange-800">Plan It!</div>
                  </motion.button>
                  <motion.button 
                    onClick={() => setActiveQuickTool('grocery')}
                    className="p-4 sm:p-5 bg-gradient-to-br from-cyan-100 to-cyan-200 hover:from-cyan-200 hover:to-cyan-300 rounded-2xl transition-all text-sm sm:text-base font-medium active:scale-95 touch-manipulation shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    whileTap={{ scale: 0.95, rotate: -2 }}
                  >
                    <div className="text-3xl sm:text-4xl mb-2">🛒</div>
                    <div className="text-cyan-800">Shop It!</div>
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Islamic Dhikr Counter Widget for FAITH space */}
          {space.type === 'FAITH' && (
            <motion.div 
              className="bg-white/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/40 shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <DhikrCounter />
            </motion.div>
          )}

          {/* Goals Widget */}
          {!['FAITH', 'STORYTELLING'].includes(space.type) && (
            <motion.div 
              className="bg-white/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/40 shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <GoalsManager 
                spaceType={space.type} 
                spaceName={space.name}
                onGoalComplete={(goal) => {
                  addCoins(COIN_REWARDS.COMPLETE_TASK)
                }}
              />
            </motion.div>
          )}

          {/* Islamic Quran Tracker Widget for FAITH space */}
          {space.type === 'FAITH' && (
            <motion.div 
              className="bg-white/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/40 shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <QuranTracker />
            </motion.div>
          )}

          {/* Islamic Recitation Player for FAITH space */}
          {space.type === 'FAITH' && (
            <motion.div 
              className="bg-white/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/40 shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <QuranRecitationPlayer />
            </motion.div>
          )}

          {/* Mood Tracker Widget */}
          {!['FAITH', 'STORYTELLING'].includes(space.type) && (
            <motion.div 
              className="bg-white/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-white/40 shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">😊 Today's Mood</h3>
              <div className="flex justify-between items-center gap-1">
                {['😢', '😐', '🙂', '😊', '🤩'].map((emoji, index) => (
                  <motion.button
                    key={index}
                    className="text-lg sm:text-xl md:text-2xl p-1.5 sm:p-2 rounded-full hover:bg-white/50 transition-colors active:scale-95 touch-manipulation flex-1 flex justify-center"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      addCoins(COIN_REWARDS.MOOD_TRACK)
                      localStorage.setItem(`mood_${space.type}_${new Date().toDateString()}`, index.toString())
                    }}
                  >
                    {emoji}
                  </motion.button>
                ))}!
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        spaceType={space.type}
        spaceName={space.name}
        onSave={handleSaveNote}
      />
      
      {/* Quick Tools Modals */}
      <VoiceRecorder
        isOpen={activeQuickTool === 'voice'}
        onClose={() => setActiveQuickTool(null)}
        spaceType={space.type}
        spaceName={space.name}
        onSave={() => {
          addCoins(COIN_REWARDS.CREATE_NOTE)
          setActiveQuickTool(null)
          setRefreshKey(prev => prev + 1)
        }}
      />
      
      <PhotoUpload
        isOpen={activeQuickTool === 'photo'}
        onClose={() => setActiveQuickTool(null)}
        spaceType={space.type}
        spaceName={space.name}
        onSave={() => {
          addCoins(COIN_REWARDS.CREATE_NOTE)
          setActiveQuickTool(null)
          setRefreshKey(prev => prev + 1)
        }}
      />
      
      <QuickTask
        isOpen={activeQuickTool === 'task'}
        onClose={() => setActiveQuickTool(null)}
        spaceType={space.type}
        spaceName={space.name}
        onSave={() => {
          addCoins(COIN_REWARDS.COMPLETE_TASK)
          setActiveQuickTool(null)
          setRefreshKey(prev => prev + 1)
        }}
      />
      
      <QuickSchedule
        isOpen={activeQuickTool === 'schedule'}
        onClose={() => setActiveQuickTool(null)}
        spaceType={space.type}
        spaceName={space.name}
        onSave={() => {
          addCoins(COIN_REWARDS.ADD_EVENT)
          setActiveQuickTool(null)
        }}
      />
      
      <GroceryVoiceRecorder
        isOpen={activeQuickTool === 'grocery'}
        onClose={() => setActiveQuickTool(null)}
        spaceType={space.type}
        spaceName={space.name}
        onSave={() => {
          addCoins(COIN_REWARDS.CREATE_NOTE)
          setActiveQuickTool(null)
          setRefreshKey(prev => prev + 1)
        }}
      />
      
      {/* Voice Note Modal */}
      <VoiceNoteModal
        isOpen={showVoiceNote}
        onClose={() => setShowVoiceNote(false)}
        spaceType={space.type}
        spaceName={space.name}
        onSave={(note) => {
          handleSaveNote(note)
          setShowVoiceNote(false)
        }}
      />
      
      {/* Full CV Modal */}
      {showFullCV && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-auto">
            <div className="relative">
              <button
                onClick={() => setShowFullCV(false)}
                className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white transition-colors active:scale-95 touch-manipulation"
              >
                ✕
              </button>
              <CVViewer variant="full" />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}