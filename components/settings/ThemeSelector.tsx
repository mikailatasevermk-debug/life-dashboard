"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Palette, Check, Sparkles } from "lucide-react"
import { THEMES, getThemeById, getThemesByCategory, type Theme } from "@/lib/themes"

interface ThemeSelectorProps {
  currentTheme: string
  onThemeChange: (themeId: string) => void
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<Theme['category']>('anime')
  const [previewTheme, setPreviewTheme] = useState<string | null>(null)

  const categories = [
    { id: 'anime', name: 'Anime', emoji: '🐉', description: 'Inspired by popular anime' },
    { id: 'os', name: 'OS Classic', emoji: '💻', description: 'Classic operating systems' },
    { id: 'gaming', name: 'Gaming', emoji: '🎮', description: 'Gaming and retro vibes' },
    { id: 'nature', name: 'Nature', emoji: '🌿', description: 'Natural landscapes' },
    { id: 'minimalist', name: 'Minimal', emoji: '⚪', description: 'Clean and simple' }
  ] as const

  const handleThemeSelect = (themeId: string) => {
    onThemeChange(themeId)
    setPreviewTheme(null)
  }

  const handlePreview = (themeId: string) => {
    setPreviewTheme(themeId)
    setTimeout(() => setPreviewTheme(null), 2000) // Preview for 2 seconds
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Palette className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Background Themes</h3>
          <p className="text-sm text-gray-600">Customize your dashboard background</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
              selectedCategory === category.id
                ? 'bg-purple-100 text-purple-700 shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="text-base">{category.emoji}</span>
            <span className="hidden sm:inline">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {getThemesByCategory(selectedCategory).map(theme => {
          const isSelected = currentTheme === theme.id
          const isPreview = previewTheme === theme.id
          
          return (
            <motion.div
              key={theme.id}
              className={`relative overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                isSelected 
                  ? 'border-purple-500 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
              }`}
              onClick={() => handleThemeSelect(theme.id)}
              onMouseEnter={() => handlePreview(theme.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Theme Preview */}
              <div 
                className="aspect-video w-full relative"
                style={{ background: theme.background }}
              >
                {/* Preview Content */}
                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{theme.preview}</span>
                    {isSelected && (
                      <div className="p-1 bg-white/90 rounded-full">
                        <Check className="w-3 h-3 text-purple-600" />
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className="text-xs font-medium opacity-75"
                    style={{ color: theme.textColor || '#333' }}
                  >
                    Sample Text
                  </div>
                </div>

                {/* Preview Overlay */}
                <AnimatePresence>
                  {isPreview && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/20 flex items-center justify-center"
                    >
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/90 rounded-full">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-600">Preview</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Info */}
              <div className="p-3 bg-white">
                <h4 className="font-medium text-gray-900 text-sm mb-1">{theme.name}</h4>
                <p className="text-xs text-gray-600 line-clamp-2">{theme.description}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Current Theme Info */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg border-2 border-gray-300"
            style={{ background: getThemeById(currentTheme).background }}
          />
          <div>
            <p className="font-medium text-gray-900">
              Current: {getThemeById(currentTheme).name}
            </p>
            <p className="text-sm text-gray-600">
              {getThemeById(currentTheme).description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}