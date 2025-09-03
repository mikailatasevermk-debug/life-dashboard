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
import { cn } from "@/lib/utils"

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
  
  // Get the icon component safely
  const getIcon = () => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap]
    if (IconComponent) {
      return <IconComponent className="w-8 h-8" style={{ color }} />
    }
    return <ChevronRight className="w-8 h-8" style={{ color }} />
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
        "relative p-4 h-40 w-full overflow-hidden",
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
          
          {/* Clean Header Section */}
          <div className="relative z-10 flex flex-col items-center text-center h-full justify-center">
            <motion.div 
              className="relative p-3 rounded-2xl mb-2"
              style={{ 
                background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
                border: `1px solid ${color}40`
              }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              {getIcon()}
              
              {/* Icon glow effect */}
              <motion.div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
                style={{
                  boxShadow: `0 0 20px ${color}40`,
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
            
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-gray-950 transition-colors px-1 text-center leading-tight">
              {name}
            </h3>
            
            <motion.div
              animate={{
                y: isHovered ? -2 : 0,
                opacity: isHovered ? 1 : 0.6
              }}
              transition={{ duration: 0.2 }}
              className="absolute top-1 right-1"
            >
              <ChevronRight className="w-3 h-3 text-gray-500" />
            </motion.div>
          </div>

          {/* Hover overlay for interactions */}
          <motion.div
            className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end justify-center pb-2"
          >
            <motion.div
              className="text-white font-medium text-xs bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: isHovered ? 1 : 0.8, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              Click to explore
            </motion.div>
          </motion.div>
        </div>
    </motion.div>
  )
}