"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Coins } from "lucide-react"
import { useEffect, useState } from "react"

interface CoinAnimationProps {
  show: boolean
  amount: number
  x?: number
  y?: number
}

export function CoinAnimation({ show, amount, x = 50, y = 50 }: CoinAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => setIsVisible(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [show])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ 
            x, 
            y, 
            scale: 0,
            opacity: 0
          }}
          animate={{ 
            x: x,
            y: y - 100,
            scale: [0, 1.5, 1],
            opacity: [0, 1, 0],
            rotate: [0, 360, 720]
          }}
          transition={{
            duration: 1,
            ease: "easeOut"
          }}
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${x}%`,
            top: `${y}%`
          }}
        >
          <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full shadow-lg">
            <Coins className="w-4 h-4" />
            <span className="font-bold text-sm">+{amount}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function useCoins() {
  const [coins, setCoins] = useState(0)
  const [showAnimation, setShowAnimation] = useState(false)
  const [lastAmount, setLastAmount] = useState(0)

  const addCoins = (amount: number) => {
    setCoins(prev => prev + amount)
    setLastAmount(amount)
    setShowAnimation(true)
    setTimeout(() => setShowAnimation(false), 100)
  }

  return { coins, addCoins, showAnimation, lastAmount }
}