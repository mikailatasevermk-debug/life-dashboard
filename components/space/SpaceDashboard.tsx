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
import { VoiceNoteModal } from "@/components/notes/VoiceNoteModal"
import { PrayerTimes } from "@/components/islamic/PrayerTimes"
import { DhikrCounter } from "@/components/islamic/DhikrCounter"
import { QuranTracker } from "@/components/islamic/QuranTracker"

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
  const [activeQuickTool, setActiveQuickTool] = useState<'voice' | 'photo' | 'task' | 'schedule' | null>(null)
  const [showVoiceNote, setShowVoiceNote] = useState(false)
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

  const handleSaveNote = async (note: { title: string; content: string; audioBlob?: Blob; transcript?: string }) => {
    try {
      // In demo mode, save to localStorage
      const noteData = {
        id: Date.now().toString(),
        spaceType: space.type,
        title: note.title,
        content: note.content,
        hasAudio: !!note.audioBlob,
        transcript: note.transcript,
        isVoiceNote: !!note.audioBlob,
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
        className="h-20 bg-white/70 backdrop-blur-xl border-b border-white/40 px-6 flex items-center justify-between"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="flex items-center gap-4">
          <motion.button
            onClick={slideToHome}
            className="p-2 bg-white/60 hover:bg-white/90 rounded-xl transition-all duration-200 shadow-lg"
            whileHover={{ x: -3, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
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
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{space.name}</h1>
            <p className="text-sm text-gray-600">{space.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            className="p-2 bg-white/60 hover:bg-white/90 rounded-xl transition-all duration-200"
            whileHover={{ y: -2 }}
          >
            <Save className="w-5 h-5 text-gray-700" />
          </motion.button>
          <motion.button
            className="p-2 bg-white/60 hover:bg-white/90 rounded-xl transition-all duration-200"
            whileHover={{ y: -2 }}
          >
            <Share className="w-5 h-5 text-gray-700" />
          </motion.button>
          <motion.button
            className="p-2 bg-white/60 hover:bg-white/90 rounded-xl transition-all duration-200"
            whileHover={{ y: -2, rotate: 90 }}
          >
            <Settings className="w-5 h-5 text-gray-700" />
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="h-[calc(100vh-80px)] flex overflow-hidden">
        {/* Left Panel - Notes */}
        <motion.div 
          className="w-1/2 p-6 flex flex-col"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">✍️ Notes</h2>
            <div className="flex gap-2">
              <motion.button
                onClick={() => setIsNoteModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200"
                style={{ backgroundColor: space.color }}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Text Note</span>
              </motion.button>
              
              <motion.button
                onClick={() => setShowVoiceNote(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-red-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-red-600"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Voice Note - Perfect for hands-free use"
              >
                <Mic className="w-4 h-4" />
                <span className="text-sm">Voice</span>
              </motion.button>
            </div>
          </div>
          
          <div className="flex-1 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg overflow-auto p-6">
            <NotesList key={refreshKey} spaceType={space.type} spaceName={space.name} />
          </div>
        </motion.div>

        {/* Right Panel - Widgets */}
        <motion.div 
          className="w-1/2 p-6 flex flex-col gap-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gray-800">🎯 Quick Actions</h2>
          
          {/* Recent Notes Widget */}
          <motion.div 
            className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="font-semibold text-gray-800 mb-3">📝 Recent Notes</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recentNotes.length > 0 ? (
                recentNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      {note.isVoiceNote && <Mic className="w-3 h-3 text-red-500" />}
                      <p className="text-sm font-medium text-gray-800 truncate">
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
                <div className="p-3 bg-white/50 rounded-lg">
                  <p className="text-sm text-gray-600">No notes yet</p>
                  <p className="text-xs text-gray-500 mt-1">Start writing to see them here</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Space-specific widget */}
          <motion.div 
            className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {space.type === 'LOVE' && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">💕 Love Counter</h3>
                <div className="text-center">
                  <motion.div 
                    className="text-4xl font-bold mb-2" 
                    style={{ color: space.color }}
                    key={loveCount}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {loveCount}
                  </motion.div>
                  <p className="text-sm text-gray-600">Beautiful moments shared</p>
                  <button 
                    onClick={handleAddLove}
                    className="mt-3 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: space.color }}
                  >
                    Add Moment ❤️
                  </button>
                </div>
              </div>
            )}
            
            {space.type === 'PROJECTS' && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">🚀 Active Projects</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-white/50 rounded-lg">
                    <p className="font-medium text-sm">Life Dashboard</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ backgroundColor: space.color, width: '85%' }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">85% complete</p>
                  </div>
                  <button
                    onClick={() => setIsNoteModalOpen(true)}
                    className="w-full mt-2 px-3 py-2 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-sm font-medium"
                  >
                    + Add New Project
                  </button>
                </div>
              </div>
            )}

            {space.type === 'FAMILY' && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">👨‍👩‍👧‍👦 Family Calendar</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-white/50 rounded-lg">
                    <p className="font-medium text-sm">Family Dinner</p>
                    <p className="text-xs text-gray-500">Sunday, 6:00 PM</p>
                  </div>
                  <button
                    onClick={() => setIsNoteModalOpen(true)}
                    className="w-full mt-2 px-3 py-2 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-sm font-medium"
                  >
                    + Add Family Event
                  </button>
                </div>
              </div>
            )}

            {space.type === 'FAITH' && (
              <div>
                <PrayerTimes city="Mecca" country="Saudi Arabia" />
              </div>
            )}

            {/* Default widget for other spaces */}
            {!['LOVE', 'PROJECTS', 'FAMILY', 'FAITH'].includes(space.type) && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">⭐ Quick Tools</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setActiveQuickTool('photo')}
                    className="p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-sm"
                  >
                    📷 Add Photo
                  </button>
                  <button 
                    onClick={() => setActiveQuickTool('voice')}
                    className="p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-sm"
                  >
                    🎙️ Voice Note
                  </button>
                  <button 
                    onClick={() => setActiveQuickTool('task')}
                    className="p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-sm"
                  >
                    ✅ Add Task
                  </button>
                  <button 
                    onClick={() => setActiveQuickTool('schedule')}
                    className="p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-sm"
                  >
                    📅 Schedule
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Islamic Dhikr Counter Widget for FAITH space */}
          {space.type === 'FAITH' && (
            <motion.div 
              className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <DhikrCounter />
            </motion.div>
          )}

          {/* Goals Widget */}
          {space.type !== 'FAITH' && (
            <motion.div 
              className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg"
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
              className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <QuranTracker />
            </motion.div>
          )}

          {/* Mood Tracker Widget */}
          {space.type !== 'FAITH' && (
            <motion.div 
              className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="font-semibold text-gray-800 mb-3">😊 Today's Mood</h3>
              <div className="flex justify-between items-center">
                {['😢', '😐', '🙂', '😊', '🤩'].map((emoji, index) => (
                  <motion.button
                    key={index}
                    className="text-2xl p-2 rounded-full hover:bg-white/50 transition-colors"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      addCoins(COIN_REWARDS.MOOD_TRACK)
                      localStorage.setItem(`mood_${space.type}_${new Date().toDateString()}`, index.toString())
                    }}
                  >
                    {emoji}
                  </motion.button>
                ))}
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
    </motion.div>
  )
}