"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Plus, 
  Camera, 
  Mic, 
  ChevronRight,
  Briefcase,
  Users,
  Home,
  Heart,
  ShoppingBag,
  Building2,
  Church
} from "lucide-react"
import { cn } from "@/lib/utils"
import { NoteModal } from "@/components/notes/NoteModal"

const iconMap = {
  "briefcase": Briefcase,
  "users": Users,
  "home": Home,
  "heart": Heart,
  "shopping-bag": ShoppingBag,
  "building-2": Building2,
  "church": Church,
}

interface SpaceCardProps {
  type: string
  name: string
  color: string
  cardClass: string
  iconName: keyof typeof iconMap
  description: string
  recentNotes?: Array<{
    id: string
    title?: string
    content: string
    createdAt: Date
  }>
}

export function SpaceCard({
  type,
  name,
  color,
  cardClass,
  iconName,
  description,
  recentNotes = []
}: SpaceCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const Icon = iconMap[iconName]

  const handleSaveNote = async (note: { title: string; content: string }) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceType: type.toUpperCase(),
          title: note.title,
          content: { text: note.content },
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save note')
      }
      
      // You could add a success toast here
      console.log('Note saved successfully!')
    } catch (error) {
      console.error('Error saving note:', error)
      // You could add an error toast here
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group cursor-pointer"
    >
      <div className={cn(
        cardClass, 
        "relative p-6 h-56 w-full overflow-hidden",
        "transform transition-all duration-300 ease-out",
        "hover:shadow-2xl"
      )}>
          {/* Animated background glow */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${color}15 0%, transparent 70%)`,
            }}
          />
          
          {/* Header Section */}
          <div className="relative z-10 flex flex-col items-center text-center mb-4">
            <motion.div 
              className="relative p-3 rounded-2xl mb-3"
              style={{ 
                background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
                border: `1px solid ${color}40`
              }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="w-10 h-10" style={{ color }} />
              
              {/* Icon glow effect */}
              <motion.div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
                style={{
                  boxShadow: `0 0 20px ${color}40`,
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-950 transition-colors">
              {name}
            </h3>
            <p className="text-sm text-gray-700 group-hover:text-gray-800 transition-colors line-clamp-2 px-2">
              {description}
            </p>
            
            <motion.div
              animate={{
                y: isHovered ? -2 : 0,
                opacity: isHovered ? 1 : 0.6
              }}
              transition={{ duration: 0.2 }}
              className="absolute top-2 right-2"
            >
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </motion.div>
          </div>

          {/* Content Section */}
          <div className="relative z-10 flex-1 mb-4">
            <motion.div 
              className="p-3 bg-white/50 rounded-xl backdrop-blur-sm border border-white/50 hover:border-white/70 transition-colors text-center shadow-sm"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm text-gray-700 font-semibold">
                ✨ Click to start
              </p>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 flex gap-2">
            <motion.button
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/70 hover:bg-white/90 rounded-xl transition-all duration-200 font-semibold text-gray-800 hover:text-gray-900 shadow-sm hover:shadow-md"
              whileHover={{ 
                y: -1,
                transition: { type: "spring", stiffness: 400 }
              }}
              whileTap={{ 
                scale: 0.98,
                animation: "mario-jump 0.5s ease-out"
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsNoteModalOpen(true)
              }}
              style={{
                boxShadow: `0 2px 8px ${color}20`
              }}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Note</span>
            </motion.button>
            
            <motion.button
              className="flex items-center justify-center p-2 bg-white/70 hover:bg-white/90 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              whileHover={{ y: -1, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault()
                console.log("Add image")
              }}
            >
              <Camera className="w-4 h-4 text-gray-700" />
            </motion.button>
            
            <motion.button
              className="flex items-center justify-center p-2 bg-white/70 hover:bg-white/90 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              whileHover={{ y: -1, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault()
                console.log("Record audio")
              }}
            >
              <Mic className="w-4 h-4 text-gray-700" />
            </motion.button>
          </div>
        </div>
        
        <NoteModal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          spaceType={type}
          spaceName={name}
          onSave={handleSaveNote}
        />
    </motion.div>
  )
}