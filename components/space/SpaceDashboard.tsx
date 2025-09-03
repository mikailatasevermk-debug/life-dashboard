"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Share, Settings, Plus } from "lucide-react"
import { useTransition } from "@/contexts/TransitionContext"
import { NotesList } from "@/components/notes/NotesList"
import { NoteModal } from "@/components/notes/NoteModal"
import { GoalsManager } from "@/components/goals/GoalsManager"
import { useUserProgress } from "@/lib/user-progress"

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
  const [loveCount, setLoveCount] = useState(() => {
    const saved = localStorage.getItem(`loveCount_${space.type}`)
    return saved ? parseInt(saved) : 0
  })

  useEffect(() => {
    addCoins(COIN_REWARDS.SPACE_VISIT)
  }, [space.type])

  const handleSaveNote = async (note: { title: string; content: string }) => {
    try {
      // In demo mode, save to localStorage
      const noteData = {
        id: Date.now().toString(),
        spaceType: space.type,
        title: note.title,
        content: note.content,
        createdAt: new Date().toISOString()
      }
      
      const existingNotes = JSON.parse(localStorage.getItem(`notes_${space.type}`) || '[]')
      existingNotes.unshift(noteData)
      localStorage.setItem(`notes_${space.type}`, JSON.stringify(existingNotes))
      
      // Reward coins for creating a note
      addCoins(COIN_REWARDS.CREATE_NOTE)
      
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
      className="fixed inset-0 bg-gradient-to-br from-sky-blue/20 to-peach-pink/20 backdrop-blur-sm"
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
      <div className="h-[calc(100vh-80px)] flex">
        {/* Left Panel - Notes */}
        <motion.div 
          className="w-1/2 p-6 flex flex-col"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">✍️ Notes</h2>
            <motion.button
              onClick={() => setIsNoteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200"
              style={{ backgroundColor: space.color }}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">New Note</span>
            </motion.button>
          </div>
          
          <div className="flex-1 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg overflow-auto p-6">
            <NotesList key={refreshKey} spaceType={space.type} spaceName={space.name} />
          </div>
        </motion.div>

        {/* Right Panel - Widgets */}
        <motion.div 
          className="w-1/2 p-6 flex flex-col gap-6"
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
            <div className="space-y-2">
              <div className="p-3 bg-white/50 rounded-lg">
                <p className="text-sm text-gray-600">No notes yet</p>
                <p className="text-xs text-gray-500 mt-1">Start writing to see them here</p>
              </div>
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

            {/* Default widget for other spaces */}
            {!['LOVE', 'PROJECTS', 'FAMILY'].includes(space.type) && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">⭐ Quick Tools</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setIsNoteModalOpen(true)}
                    className="p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-sm"
                  >
                    📷 Add Photo
                  </button>
                  <button 
                    onClick={() => setIsNoteModalOpen(true)}
                    className="p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-sm"
                  >
                    🎙️ Voice Note
                  </button>
                  <button 
                    onClick={() => setIsNoteModalOpen(true)}
                    className="p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-sm"
                  >
                    ✅ Add Task
                  </button>
                  <button 
                    onClick={() => setIsNoteModalOpen(true)}
                    className="p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-sm"
                  >
                    📅 Schedule
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Goals Widget */}
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

          {/* Mood Tracker Widget */}
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
        </motion.div>
      </div>
      
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        spaceType={space.type}
        spaceName={space.name}
        onSave={handleSaveNote}
      />
    </motion.div>
  )
}