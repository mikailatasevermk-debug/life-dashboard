"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Calendar, FileText, Mic, ArrowLeft, ArrowRight } from "lucide-react"

interface Note {
  id: string
  title?: string
  content: string
  spaceType: string
  createdAt: string
  isVoiceNote?: boolean
  hasAudio?: boolean
  transcript?: string
}

interface NotesTimelineProps {
  spaceType?: string
}

interface MonthData {
  month: string
  year: number
  monthIndex: number
  noteCount: number
  notes: Note[]
}

export function NotesTimeline({ spaceType }: NotesTimelineProps) {
  const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [allNotes, setAllNotes] = useState<Note[]>([])
  const [monthsData, setMonthsData] = useState<MonthData[]>([])
  const [viewMode, setViewMode] = useState<'months' | 'days' | 'notes'>('months')
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  useEffect(() => {
    loadAllNotes()
  }, [spaceType])

  const loadAllNotes = () => {
    try {
      let notes: Note[] = []
      
      if (spaceType) {
        // Load notes for specific space
        const spaceNotes = JSON.parse(localStorage.getItem(`notes_${spaceType}`) || '[]')
        notes = spaceNotes
      } else {
        // Load notes from all spaces
        const spaces = ['PROJECTS', 'FAMILY', 'HOME', 'LOVE', 'BUYING', 'CAREER', 'FAITH']
        spaces.forEach(space => {
          const spaceNotes = JSON.parse(localStorage.getItem(`notes_${space}`) || '[]')
          notes = [...notes, ...spaceNotes]
        })
      }

      // Sort notes by date
      notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setAllNotes(notes)

      // Group notes by month
      const monthGroups: { [key: string]: MonthData } = {}
      
      notes.forEach(note => {
        const date = new Date(note.createdAt)
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`
        
        if (!monthGroups[monthKey]) {
          monthGroups[monthKey] = {
            month: months[date.getMonth()],
            year: date.getFullYear(),
            monthIndex: date.getMonth(),
            noteCount: 0,
            notes: []
          }
        }
        
        monthGroups[monthKey].noteCount++
        monthGroups[monthKey].notes.push(note)
      })

      const monthsArray = Object.values(monthGroups).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.monthIndex - a.monthIndex
      })

      setMonthsData(monthsArray)
    } catch (error) {
      console.error('Error loading notes:', error)
    }
  }

  const selectMonth = (monthData: MonthData) => {
    setSelectedMonth(monthData)
    setViewMode('days')
    setSelectedDay(null)
  }

  const selectDay = (day: string) => {
    setSelectedDay(day)
    setViewMode('notes')
  }

  const goBackToMonths = () => {
    setViewMode('months')
    setSelectedMonth(null)
    setSelectedDay(null)
  }

  const goBackToDays = () => {
    setViewMode('days')
    setSelectedDay(null)
  }

  const getDaysInMonth = (monthData: MonthData) => {
    const daysData: { [key: string]: Note[] } = {}
    
    monthData.notes.forEach(note => {
      const date = new Date(note.createdAt)
      const dayKey = date.getDate().toString()
      
      if (!daysData[dayKey]) {
        daysData[dayKey] = []
      }
      daysData[dayKey].push(note)
    })

    return Object.entries(daysData)
      .map(([day, notes]) => ({ day: parseInt(day), notes }))
      .sort((a, b) => b.day - a.day)
  }

  const getNotesForDay = (day: string) => {
    if (!selectedMonth) return []
    
    return selectedMonth.notes.filter(note => {
      const date = new Date(note.createdAt)
      return date.getDate().toString() === day
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getContentPreview = (note: Note) => {
    if (note.transcript) return note.transcript
    if (typeof note.content === 'string') return note.content
    return 'No preview available'
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-white/50 p-6 z-10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📅 Notes Timeline</h1>
            <p className="text-gray-600 mt-1">
              {viewMode === 'months' && 'Select a month to explore your notes'}
              {viewMode === 'days' && selectedMonth && `${selectedMonth.month} ${selectedMonth.year} - Select a day`}
              {viewMode === 'notes' && selectedMonth && selectedDay && `${selectedMonth.month} ${selectedDay}, ${selectedMonth.year}`}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {viewMode === 'days' && (
              <motion.button
                onClick={goBackToMonths}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Months
              </motion.button>
            )}
            
            {viewMode === 'notes' && (
              <motion.button
                onClick={goBackToDays}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Days
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-8 px-8 h-full overflow-auto">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Months View */}
            {viewMode === 'months' && (
              <motion.div
                key="months"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex justify-center"
              >
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                    📊 Your Notes by Month
                  </h2>
                  
                  <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 max-w-md w-full">
                    {monthsData.length > 0 ? (
                      <div className="space-y-3">
                        {monthsData.map((monthData, index) => (
                          <motion.div
                            key={`${monthData.year}-${monthData.monthIndex}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => selectMonth(monthData)}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all duration-300 cursor-pointer border border-blue-200 hover:border-blue-300 group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-3">
                              <Calendar className="w-6 h-6 text-blue-600" />
                              <div>
                                <p className="font-semibold text-gray-800 group-hover:text-blue-700">
                                  {monthData.month} {monthData.year}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {monthData.noteCount} note{monthData.noteCount !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg font-medium">No notes found</p>
                        <p className="text-gray-500 text-sm mt-2">Start creating notes to see them here</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Days View */}
            {viewMode === 'days' && selectedMonth && (
              <motion.div
                key="days"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex justify-center"
              >
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                    🗓️ {selectedMonth.month} {selectedMonth.year}
                  </h2>
                  
                  <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 max-w-md w-full">
                    <div className="space-y-3">
                      {getDaysInMonth(selectedMonth).map(({ day, notes }, index) => (
                        <motion.div
                          key={day}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => selectDay(day.toString())}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl hover:from-green-100 hover:to-blue-100 transition-all duration-300 cursor-pointer border border-green-200 hover:border-green-300 group"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                              {day}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 group-hover:text-green-700">
                                Day {day}
                              </p>
                              <p className="text-sm text-gray-600">
                                {notes.length} note{notes.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notes View */}
            {viewMode === 'notes' && selectedMonth && selectedDay && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                    📝 Notes from {selectedMonth.month} {selectedDay}, {selectedMonth.year}
                  </h2>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getNotesForDay(selectedDay).map((note, index) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          {note.isVoiceNote ? (
                            <Mic className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                          ) : (
                            <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-1">
                              {note.title || 'Untitled Note'}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {formatDate(note.createdAt)}
                            </p>
                          </div>
                          <div className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                            {note.spaceType}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-700 line-clamp-4">
                          {getContentPreview(note)}
                        </div>
                        
                        {note.isVoiceNote && (
                          <div className="mt-3 p-2 bg-red-50 rounded-lg flex items-center gap-2">
                            <Mic className="w-4 h-4 text-red-600" />
                            <span className="text-xs text-red-700 font-medium">Voice Note</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  
                  {getNotesForDay(selectedDay).length === 0 && (
                    <div className="text-center py-16">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg font-medium">No notes for this day</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}