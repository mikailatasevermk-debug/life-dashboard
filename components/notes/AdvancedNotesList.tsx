"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { 
  FileText, Pin, Trash2, Edit3, Calendar, Mic, Play, Pause, 
  Search, Filter, Grid3X3, List, Tag, Star, Clock, Archive,
  MoreHorizontal, Copy, Share, Palette, Folder, ChevronDown, X, Save
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Enhanced Note Interface
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
  category?: string
  tags: string[]
  color?: string
  priority: 'low' | 'medium' | 'high'
  isArchived: boolean
  order: number
}

interface NoteCategory {
  id: string
  name: string
  color: string
  emoji: string
}

interface AdvancedNotesListProps {
  spaceType: string
  spaceName: string
}

// Note colors for Apple-style theming
const NOTE_COLORS = [
  { name: 'Default', color: '#FFFFFF', accent: '#007AFF' },
  { name: 'Yellow', color: '#FFF3CD', accent: '#FFC107' },
  { name: 'Green', color: '#D1E7DD', accent: '#198754' },
  { name: 'Blue', color: '#D1ECF1', accent: '#0DCAF0' },
  { name: 'Purple', color: '#E2D9F3', accent: '#6F42C1' },
  { name: 'Pink', color: '#F7D6E6', accent: '#E91E63' },
  { name: 'Orange', color: '#FFE5B4', accent: '#FD7E14' },
  { name: 'Red', color: '#F8D7DA', accent: '#DC3545' },
]

// Sortable Note Item Component
function SortableNoteItem({ note, onEdit, onDelete, onTogglePin, onColorChange, onView }: {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onTogglePin: (id: string) => void
  onColorChange: (id: string, color: string) => void
  onView: (note: Note) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [showMenu, setShowMenu] = useState(false)
  const [playingAudio, setPlayingAudio] = useState(false)

  const noteColor = NOTE_COLORS.find(c => c.color === note.color) || NOTE_COLORS[0]

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 ${
        isDragging 
          ? 'shadow-2xl scale-105 rotate-2 z-50' 
          : 'shadow-md hover:shadow-lg'
      }`}
      style={{
        backgroundColor: noteColor.color,
        borderColor: `${noteColor.accent}40`,
        ...style
      }}
      whileHover={{ 
        scale: isDragging ? 1.05 : 1.02,
        transition: { duration: 0.2 }
      }}
      layout
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        data-drag-handle="true"
        className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
      >
        <div className="flex flex-col gap-0.5">
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>
      </div>

      {/* Note Content */}
      <div 
        className="p-4 cursor-pointer hover:bg-black/5 transition-colors relative group/content"
        title="Click to view full content"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          
          // Don't trigger if clicking on action buttons, drag handle, or interactive elements
          const target = e.target as HTMLElement
          if (
            target.closest('.action-button') || 
            target.closest('[data-drag-handle]') ||
            target.tagName === 'BUTTON' ||
            target.tagName === 'A' ||
            target.closest('button') ||
            target.closest('a')
          ) {
            return
          }
          
          console.log('Note clicked, opening modal:', note.title || note.id)
          onView(note)
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {note.isPinned && (
              <Pin 
                className="w-4 h-4 flex-shrink-0" 
                style={{ color: noteColor.accent }}
                fill="currentColor"
              />
            )}
            {note.isVoiceNote && (
              <Mic 
                className="w-4 h-4 flex-shrink-0" 
                style={{ color: noteColor.accent }}
              />
            )}
            <h3 
              className="font-semibold text-gray-900 truncate text-sm"
              style={{ color: isDragging ? '#000' : undefined }}
            >
              {note.title || 'Untitled'}
            </h3>
          </div>

          {/* Priority Indicator */}
          {note.priority !== 'low' && (
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              note.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
            }`} />
          )}
        </div>

        {/* Content Preview */}
        <div className="relative">
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
            {note.transcript || note.content || 'No content'}
          </p>
          {/* Click indicator */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/content:opacity-100 transition-opacity pointer-events-none">
            <span className="bg-black/80 text-white px-2 py-1 rounded-full text-xs font-medium">
              Click to view
            </span>
          </div>
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.slice(0, 3).map(tag => (
              <span 
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${noteColor.accent}20`,
                  color: noteColor.accent
                }}
              >
                #{tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{note.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>
              {(() => {
                try {
                  return new Date(note.createdAt).toLocaleDateString()
                } catch {
                  return 'Unknown date'
                }
              })()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {note.hasAudio && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setPlayingAudio(!playingAudio)
                }}
                className="action-button p-1.5 hover:bg-black/10 rounded-lg transition-colors"
              >
                {playingAudio ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onTogglePin(note.id)
              }}
              className="action-button p-1.5 hover:bg-black/10 rounded-lg transition-colors"
            >
              <Pin className="w-3 h-3" />
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onEdit(note)
              }}
              className="action-button p-1.5 hover:bg-black/10 rounded-lg transition-colors"
            >
              <Edit3 className="w-3 h-3" />
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                className="action-button p-1.5 hover:bg-black/10 rounded-lg transition-colors"
              >
                <MoreHorizontal className="w-3 h-3" />
              </button>
              
              {/* Context Menu */}
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 min-w-48"
                  >
                    {/* Color Palette */}
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex gap-1.5">
                        {NOTE_COLORS.slice(0, 6).map(color => (
                          <button
                            key={color.name}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              onColorChange(note.id, color.color)
                              setShowMenu(false)
                            }}
                            className="action-button w-6 h-6 rounded-full border-2 border-gray-200 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color.color }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        navigator.clipboard.writeText(note.content)
                        setShowMenu(false)
                      }}
                      className="action-button w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onDelete(note.id)
                        setShowMenu(false)
                      }}
                      className="action-button w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function AdvancedNotesList({ spaceType, spaceName }: AdvancedNotesListProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'priority'>('date')
  const [draggedItem, setDraggedItem] = useState<Note | null>(null)
  const [viewingNote, setViewingNote] = useState<Note | null>(null)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    priority: 'low' as 'low' | 'medium' | 'high',
    color: '#FFFFFF'
  })
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(`notes_${spaceType}`)
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any, index: number) => {
        // Safe date parsing
        const parseDate = (dateValue: any): string => {
          if (!dateValue) return new Date().toISOString()
          if (typeof dateValue === 'string') return dateValue
          try {
            const date = new Date(dateValue)
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
          } catch {
            return new Date().toISOString()
          }
        }

        return {
          ...note,
          tags: note.tags || [],
          priority: note.priority || 'low',
          isArchived: note.isArchived || false,
          order: note.order || index,
          createdAt: parseDate(note.createdAt),
          updatedAt: parseDate(note.updatedAt)
        }
      })
      setNotes(parsedNotes)
    }
    setLoading(false)
  }, [spaceType])

  // Save notes to localStorage
  const saveNotes = (updatedNotes: Note[]) => {
    localStorage.setItem(`notes_${spaceType}`, JSON.stringify(updatedNotes))
    setNotes(updatedNotes)
  }

  // Filter and sort notes
  const filteredAndSortedNotes = useMemo(() => {
    let filtered = notes.filter(note => !note.isArchived)
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.transcript?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(note => note.category === selectedCategory)
    }

    // Sort
    filtered.sort((a, b) => {
      // Pinned notes always first
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '')
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        default: // date
          const dateA = new Date(a.updatedAt)
          const dateB = new Date(b.updatedAt)
          const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime()
          const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime()
          return timeB - timeA
      }
    })

    return filtered
  }, [notes, searchQuery, selectedCategory, sortBy])

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const note = notes.find(n => n.id === active.id)
    setDraggedItem(note || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedItem(null)

    if (!over) return

    if (active.id !== over.id) {
      const oldIndex = notes.findIndex(note => note.id === active.id)
      const newIndex = notes.findIndex(note => note.id === over.id)
      
      const reorderedNotes = arrayMove(notes, oldIndex, newIndex)
        .map((note, index) => ({ ...note, order: index }))
      
      saveNotes(reorderedNotes)
    }
  }

  // Note actions
  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setEditForm({
      title: note.title || '',
      content: note.content || '',
      tags: note.tags || [],
      priority: note.priority || 'low',
      color: note.color || '#FFFFFF'
    })
    setViewingNote(null) // Close view modal if open
  }
  
  const handleSaveEdit = () => {
    if (!editingNote) return
    
    const updatedNotes = notes.map(note =>
      note.id === editingNote.id
        ? {
            ...note,
            ...editForm,
            updatedAt: new Date().toISOString()
          }
        : note
    )
    saveNotes(updatedNotes)
    setEditingNote(null)
    setEditForm({
      title: '',
      content: '',
      tags: [],
      priority: 'low',
      color: '#FFFFFF'
    })
  }
  
  const handleCancelEdit = () => {
    setEditingNote(null)
    setEditForm({
      title: '',
      content: '',
      tags: [],
      priority: 'low',
      color: '#FFFFFF'
    })
  }

  const handleDelete = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId)
    saveNotes(updatedNotes)
  }

  const handleTogglePin = (noteId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId 
        ? { ...note, isPinned: !note.isPinned, updatedAt: new Date().toISOString() }
        : note
    )
    saveNotes(updatedNotes)
  }

  const handleColorChange = (noteId: string, color: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId 
        ? { ...note, color, updatedAt: new Date().toISOString() }
        : note
    )
    saveNotes(updatedNotes)
  }

  const handleView = (note: Note) => {
    setViewingNote(note)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 bg-white/80 backdrop-blur-xl rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 transition-colors"
          />
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-white/80 backdrop-blur-xl rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="priority">Sort by Priority</option>
          </select>

          {/* View Mode */}
          <div className="flex bg-white/80 backdrop-blur-xl rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-l-xl transition-colors ${
                viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-r-xl transition-colors ${
                viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Notes Grid/List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={filteredAndSortedNotes.map(note => note.id)}
          strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
        >
          <motion.div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3'
            }
            layout
          >
            <AnimatePresence mode="popLayout">
              {filteredAndSortedNotes.map(note => (
                <SortableNoteItem
                  key={note.id}
                  note={note}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTogglePin={handleTogglePin}
                  onColorChange={handleColorChange}
                  onView={handleView}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </SortableContext>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedItem ? (
            <div 
              className="p-4 rounded-2xl shadow-2xl transform rotate-3 scale-105"
              style={{ 
                backgroundColor: draggedItem.color || '#FFFFFF',
                borderColor: `${NOTE_COLORS.find(c => c.color === draggedItem.color)?.accent || '#007AFF'}40`
              }}
            >
              <h3 className="font-semibold text-gray-900 text-sm mb-2">
                {draggedItem.title || 'Untitled'}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {draggedItem.transcript || draggedItem.content || 'No content'}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {filteredAndSortedNotes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {searchQuery ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-gray-500">
            {searchQuery 
              ? 'Try adjusting your search terms'
              : 'Start creating notes to see them here'
            }
          </p>
        </motion.div>
      )}

      {/* Note Viewing Modal */}
      <AnimatePresence>
        {viewingNote && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingNote(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div 
                className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-hidden"
                style={{
                  backgroundColor: viewingNote.color || '#FFFFFF',
                  borderColor: `${NOTE_COLORS.find(c => c.color === viewingNote.color)?.accent || '#007AFF'}40`
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {viewingNote.isPinned && (
                      <Pin 
                        className="w-5 h-5 flex-shrink-0" 
                        style={{ color: NOTE_COLORS.find(c => c.color === viewingNote.color)?.accent || '#007AFF' }}
                        fill="currentColor"
                      />
                    )}
                    {viewingNote.isVoiceNote && (
                      <Mic 
                        className="w-5 h-5 flex-shrink-0" 
                        style={{ color: NOTE_COLORS.find(c => c.color === viewingNote.color)?.accent || '#007AFF' }}
                      />
                    )}
                    <h2 className="text-xl font-bold text-gray-900 truncate">
                      {viewingNote.title || 'Untitled'}
                    </h2>
                    {viewingNote.priority !== 'low' && (
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        viewingNote.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                    )}
                  </div>
                  <button
                    onClick={() => setViewingNote(null)}
                    className="p-2 hover:bg-black/10 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-auto">
                  {/* Tags */}
                  {viewingNote.tags && viewingNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {viewingNote.tags.map(tag => (
                        <span 
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                          style={{ 
                            backgroundColor: `${NOTE_COLORS.find(c => c.color === viewingNote.color)?.accent || '#007AFF'}20`,
                            color: NOTE_COLORS.find(c => c.color === viewingNote.color)?.accent || '#007AFF'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Main Content */}
                  <div className="prose prose-gray max-w-none">
                    {viewingNote.transcript ? (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                          <Mic className="w-4 h-4" />
                          Voice Transcript
                        </h4>
                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed mb-4">
                          {viewingNote.transcript}
                        </p>
                        {viewingNote.content && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Additional Notes</h4>
                            <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                              {viewingNote.content}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {viewingNote.content || 'No content'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200/50 bg-gray-50/50">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {(() => {
                          try {
                            return new Date(viewingNote.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          } catch {
                            return 'Unknown date'
                          }
                        })()}
                      </span>
                    </div>
                    {viewingNote.hasAudio && (
                      <div className="flex items-center gap-1">
                        <Mic className="w-4 h-4" />
                        <span>Audio note</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        handleEdit(viewingNote)
                        setViewingNote(null)
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Note Edit Modal */}
      <AnimatePresence>
        {editingNote && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelEdit}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-3">
                    <Edit3 className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Edit Note</h2>
                  </div>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Edit Form */}
                <div className="p-6 space-y-4 max-h-[70vh] overflow-auto">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Enter note title..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      placeholder="Enter note content..."
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors resize-none"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high'] as const).map(priority => (
                        <button
                          key={priority}
                          onClick={() => setEditForm({ ...editForm, priority })}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                            editForm.priority === priority
                              ? priority === 'high'
                                ? 'bg-red-500 text-white'
                                : priority === 'medium'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Theme
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {NOTE_COLORS.map(color => (
                        <button
                          key={color.name}
                          onClick={() => setEditForm({ ...editForm, color: color.color })}
                          className={`w-10 h-10 rounded-lg border-2 transition-all ${
                            editForm.color === color.color
                              ? 'scale-110 shadow-lg'
                              : 'hover:scale-105'
                          }`}
                          style={{
                            backgroundColor: color.color,
                            borderColor: editForm.color === color.color ? color.accent : '#e5e7eb'
                          }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={editForm.tags.join(', ')}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                      })}
                      placeholder="e.g., important, work, ideas"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}