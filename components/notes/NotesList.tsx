"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileText, Pin, Trash2, Edit3, Calendar, Mic, Play, Pause } from "lucide-react"
// Simple date formatting function
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: '2-digit' 
  })
}

const formatShortDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: '2-digit' 
  })
}

interface Note {
  id: string
  title?: string
  content: any
  isPinned: boolean
  createdAt: string
  updatedAt: string
  hasAudio?: boolean
  transcript?: string
  isVoiceNote?: boolean
}

interface NotesListProps {
  spaceType: string
  spaceName: string
}

export function NotesList({ spaceType, spaceName }: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)

  useEffect(() => {
    fetchNotes()
  }, [spaceType])

  const fetchNotes = async () => {
    try {
      // In demo mode, read from localStorage
      const storedNotes = localStorage.getItem(`notes_${spaceType}`)
      if (storedNotes) {
        const parsedNotes = JSON.parse(storedNotes).map((note: any) => ({
          ...note,
          isPinned: note.isPinned || false,
          updatedAt: note.updatedAt || note.createdAt
        }))
        setNotes(parsedNotes)
      } else {
        setNotes([])
      }
    } catch (error) {
      console.error("Error fetching notes:", error)
      setNotes([])
    } finally {
      setLoading(false)
    }
  }

  const togglePin = async (noteId: string, isPinned: boolean) => {
    try {
      const storedNotes = JSON.parse(localStorage.getItem(`notes_${spaceType}`) || '[]')
      const updatedNotes = storedNotes.map((note: any) => 
        note.id === noteId ? { ...note, isPinned: !isPinned } : note
      )
      localStorage.setItem(`notes_${spaceType}`, JSON.stringify(updatedNotes))
      fetchNotes() // Refresh the list
    } catch (error) {
      console.error("Error updating note:", error)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return

    try {
      const storedNotes = JSON.parse(localStorage.getItem(`notes_${spaceType}`) || '[]')
      const updatedNotes = storedNotes.filter((note: any) => note.id !== noteId)
      localStorage.setItem(`notes_${spaceType}`, JSON.stringify(updatedNotes))
      
      // Also delete associated audio
      localStorage.removeItem(`audio_${noteId}`)
      
      fetchNotes() // Refresh the list
    } catch (error) {
      console.error("Error deleting note:", error)
    }
  }

  const playAudio = async (noteId: string) => {
    try {
      if (playingAudio === noteId) {
        setPlayingAudio(null)
        return
      }

      const audioData = localStorage.getItem(`audio_${noteId}`)
      if (audioData) {
        const audio = new Audio(audioData)
        setPlayingAudio(noteId)
        
        audio.onended = () => {
          setPlayingAudio(null)
        }
        
        audio.play()
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      setPlayingAudio(null)
    }
  }

  const getContentPreview = (content: any): string => {
    if (typeof content === 'string') return content
    if (content?.text) return content.text
    if (content?.blocks && Array.isArray(content.blocks)) {
      return content.blocks.map((block: any) => block.text || '').join(' ')
    }
    return 'No content'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No notes yet</h3>
        <p className="text-gray-500">Click the + button to create your first note in {spaceName}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note, index) => (
        <motion.div
          key={note.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`
            bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/50
            hover:shadow-xl transition-all duration-300 relative group
            ${note.isPinned ? 'ring-2 ring-yellow-400' : ''}
          `}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              {note.title && (
                <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {note.title}
                </h4>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {formatDate(note.createdAt)}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => togglePin(note.id, note.isPinned)}
                className={`p-1.5 rounded-lg transition-colors ${
                  note.isPinned 
                    ? 'text-yellow-600 bg-yellow-100' 
                    : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                }`}
                title={note.isPinned ? 'Unpin note' : 'Pin note'}
              >
                <Pin className="w-3 h-3" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => deleteNote(note.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete note"
              >
                <Trash2 className="w-3 h-3" />
              </motion.button>
            </div>
          </div>

          {/* Voice Note Indicator */}
          {note.isVoiceNote && (
            <div className="mb-3 flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
              <Mic className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">Voice Note</span>
              {note.hasAudio && (
                <button
                  onClick={() => playAudio(note.id)}
                  className="ml-auto p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                >
                  {playingAudio === note.id ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          )}

          {/* Content Preview */}
          <div className="text-sm text-gray-700 line-clamp-4">
            {note.transcript ? (
              <div>
                <span className="text-xs text-blue-600 font-medium">Transcript:</span>
                <p className="mt-1">{note.transcript}</p>
              </div>
            ) : (
              getContentPreview(note.content)
            )}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {note.createdAt !== note.updatedAt && 'Updated '}
              {formatShortDate(note.updatedAt)}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <Edit3 className="w-3 h-3" />
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}