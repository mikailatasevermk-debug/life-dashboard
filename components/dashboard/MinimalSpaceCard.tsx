"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  ChevronRight,
  Briefcase,
  Users,
  Home,
  Heart,
  ShoppingBag,
  Building2,
  Church,
  Moon,
  BookOpen
} from "lucide-react"

const iconMap = {
  "briefcase": Briefcase,
  "users": Users,
  "home": Home,
  "heart": Heart,
  "shopping-bag": ShoppingBag,
  "building-2": Building2,
  "church": Church,
  "moon": Moon,
  "book-open": BookOpen,
}

interface MinimalSpaceCardProps {
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

export function MinimalSpaceCard({
  type,
  name,
  color,
  cardClass,
  iconName,
  description,
  recentNotes = []
}: MinimalSpaceCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Get the icon component safely
  const getIcon = () => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap]
    if (IconComponent) {
      return <IconComponent className="w-5 h-5" style={{ color }} />
    }
    return <ChevronRight className="w-5 h-5" style={{ color }} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group cursor-pointer"
    >
      <div className="bg-white rounded-xl border border-gray-200 p-4 h-32 hover:border-gray-300 hover:shadow-md transition-all duration-200 active:scale-95 touch-manipulation">
        {/* Icon and Title */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="p-2 rounded-lg"
              style={{ 
                backgroundColor: `${color}15`,
                border: `1px solid ${color}25`
              }}
            >
              {getIcon()}
            </div>
            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              animate={{ x: isHovered ? 2 : 0 }}
            >
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </motion.div>
          </div>
        </div>
        
        {/* Content */}
        <div>
          <h3 className="font-medium text-gray-900 text-sm mb-1 leading-tight">
            {name}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
        
        {/* Recent Activity Indicator */}
        {recentNotes.length > 0 && (
          <div className="mt-3 flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span className="text-xs text-gray-400">Recent activity</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}