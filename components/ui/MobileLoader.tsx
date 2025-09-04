"use client"

import { useEffect, useState } from "react"

export function MobileLoader() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Faster initial progress
    const fastTimer = setTimeout(() => setProgress(30), 100)
    const medTimer = setTimeout(() => setProgress(60), 300)
    const slowTimer = setTimeout(() => setProgress(85), 600)
    const finalTimer = setTimeout(() => setProgress(95), 700)

    return () => {
      clearTimeout(fastTimer)
      clearTimeout(medTimer)
      clearTimeout(slowTimer)
      clearTimeout(finalTimer)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 flex items-center justify-center z-50">
      <div className="text-center space-y-6 px-4 max-w-sm">
        {/* Logo */}
        <div className="mx-auto w-16 h-16 bg-white/90 rounded-2xl shadow-lg flex items-center justify-center">
          <span className="text-2xl">✨</span>
        </div>
        
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Life Dashboard
          </h1>
          <p className="text-gray-600 text-sm">Loading your personal spaces...</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>Optimized for mobile</p>
          <p className="animate-pulse">Setting up your dashboard...</p>
        </div>
      </div>
    </div>
  )
}