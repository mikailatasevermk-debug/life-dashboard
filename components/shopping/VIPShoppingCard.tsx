"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, Clock, Flame, CheckCircle, Calendar, MapPin } from "lucide-react"
import { getVIPShoppingItems, updateShoppingItem, PRIORITY_COLORS, PRIORITY_EMOJIS } from "@/lib/shopping"
import type { ShoppingItem } from "@/lib/shopping"

export function VIPShoppingCard() {
  const [vipItems, setVipItems] = useState<ShoppingItem[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setVipItems(getVIPShoppingItems())
  }, [refreshKey])

  const toggleItemCompletion = (item: ShoppingItem) => {
    const updatedItem = { ...item, completed: !item.completed }
    updateShoppingItem(updatedItem)
    setRefreshKey(prev => prev + 1)
  }

  const getTimeUrgency = (dueDate?: Date) => {
    if (!dueDate) return null
    
    const now = new Date()
    const timeDiff = dueDate.getTime() - now.getTime()
    const hoursLeft = timeDiff / (1000 * 60 * 60)
    
    if (hoursLeft <= 0) return { text: 'OVERDUE!', color: 'text-red-600', urgent: true }
    if (hoursLeft <= 2) return { text: `${Math.floor(hoursLeft)}h left`, color: 'text-red-500', urgent: true }
    if (hoursLeft <= 6) return { text: `${Math.floor(hoursLeft)}h left`, color: 'text-orange-500', urgent: true }
    if (hoursLeft <= 24) return { text: 'Today', color: 'text-yellow-600', urgent: false }
    
    return { text: dueDate.toLocaleDateString(), color: 'text-gray-500', urgent: false }
  }

  if (vipItems.length === 0) {
    return (
      <motion.div 
        className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200 shadow-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-purple-800 mb-2">⭐ VIP Shopping</h3>
          <p className="text-purple-600 text-sm">No urgent items right now!</p>
          <p className="text-purple-500 text-xs mt-1">High priority items will appear here</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200 shadow-lg"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
          <Star className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-purple-800">⭐ VIP Shopping</h3>
          <p className="text-purple-600 text-sm">{vipItems.length} urgent items</p>
        </div>
      </div>

      {/* VIP Items */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {vipItems.map((item, index) => {
          const timeInfo = getTimeUrgency(item.dueDate)
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                item.priority === 'vip' 
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Completion Toggle */}
                <button
                  onClick={() => toggleItemCompletion(item)}
                  className={`mt-1 w-5 h-5 rounded border-2 transition-all ${
                    item.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-purple-400'
                  }`}
                >
                  {item.completed && <CheckCircle className="w-3 h-3" />}
                </button>

                <div className="flex-1 min-w-0">
                  {/* Item Info */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {item.item}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.spaceName}
                        </span>
                        {item.quantity && (
                          <span className="text-xs text-gray-500">• {item.quantity}</span>
                        )}
                      </div>
                    </div>

                    {/* Priority Badge */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${PRIORITY_COLORS[item.priority]}`}>
                        {PRIORITY_EMOJIS[item.priority]} {item.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Time Info */}
                  {timeInfo && (
                    <div className={`flex items-center gap-1 text-xs ${timeInfo.color} mb-2`}>
                      {timeInfo.urgent ? <Flame className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                      <span className="font-medium">{timeInfo.text}</span>
                    </div>
                  )}

                  {/* Notes */}
                  {item.notes && (
                    <p className="text-xs text-gray-600 italic">{item.notes}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-purple-200">
        <div className="flex items-center justify-between text-xs text-purple-600">
          <span>Updated just now</span>
          <button 
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="hover:text-purple-800 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </motion.div>
  )
}