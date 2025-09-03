"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ShoppingCart, Eye, Filter, CheckCircle, MapPin, Star } from "lucide-react"
import { getAllShoppingItems, updateShoppingItem, PRIORITY_COLORS, PRIORITY_EMOJIS } from "@/lib/shopping"
import type { ShoppingItem } from "@/lib/shopping"

interface ConsciousShoppingWidgetProps {
  spaceType: string
}

export function ConsciousShoppingWidget({ spaceType }: ConsciousShoppingWidgetProps) {
  const [allItems, setAllItems] = useState<ShoppingItem[]>([])
  const [filteredItems, setFilteredItems] = useState<ShoppingItem[]>([])
  const [showAllSpaces, setShowAllSpaces] = useState(true)
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'vip'>('all')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const items = getAllShoppingItems()
    setAllItems(items)
    
    // Apply filters
    let filtered = items
    
    if (!showAllSpaces) {
      filtered = filtered.filter(item => item.spaceType === spaceType)
    }
    
    if (filterPriority !== 'all') {
      if (filterPriority === 'high') {
        filtered = filtered.filter(item => item.priority === 'high' || item.priority === 'vip')
      } else {
        filtered = filtered.filter(item => item.priority === filterPriority)
      }
    }
    
    setFilteredItems(filtered)
  }, [refreshKey, showAllSpaces, filterPriority, spaceType])

  const toggleItemCompletion = (item: ShoppingItem) => {
    const updatedItem = { ...item, completed: !item.completed }
    updateShoppingItem(updatedItem)
    setRefreshKey(prev => prev + 1)
  }

  const getSpaceStats = () => {
    const spaceGroups = allItems.reduce((acc, item) => {
      if (!acc[item.spaceType]) {
        acc[item.spaceType] = { name: item.spaceName, count: 0 }
      }
      acc[item.spaceType].count++
      return acc
    }, {} as Record<string, { name: string, count: number }>)

    return Object.entries(spaceGroups)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 4)
  }

  if (allItems.length === 0) {
    return (
      <div className="p-4 text-center">
        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No shopping items yet</p>
        <p className="text-gray-400 text-xs mt-1">Use "Shop It!" in any space to add items</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          Mindful Shopping
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAllSpaces(!showAllSpaces)}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
              showAllSpaces 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Eye className="w-3 h-3 inline mr-1" />
            {showAllSpaces ? 'All Spaces' : 'This Space'}
          </button>
          
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
          >
            <option value="all">All Priority</option>
            <option value="high">High Priority</option>
            <option value="vip">VIP Only</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      {showAllSpaces && (
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-700">{allItems.length}</div>
            <div className="text-xs text-green-600">Total Items</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-700">
              {allItems.filter(i => i.priority === 'vip' || i.priority === 'high').length}
            </div>
            <div className="text-xs text-purple-600">Priority Items</div>
          </div>
        </div>
      )}

      {/* Space Breakdown */}
      {showAllSpaces && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700">Items by Space</h5>
          {getSpaceStats().map(([spaceType, info]) => (
            <div key={spaceType} className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-600">{info.name}</span>
              <span className="text-xs font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full">
                {info.count}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Shopping Items */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredItems.slice(0, 10).map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <button
              onClick={() => toggleItemCompletion(item)}
              className={`w-4 h-4 rounded border-2 transition-all flex-shrink-0 ${
                item.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              {item.completed && <CheckCircle className="w-2.5 h-2.5" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h6 className={`text-sm font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.item}
                  </h6>
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

                {(item.priority === 'high' || item.priority === 'vip') && (
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${PRIORITY_COLORS[item.priority]} flex-shrink-0 ml-2`}>
                    {PRIORITY_EMOJIS[item.priority]}
                  </span>
                )}
              </div>

              {item.dueDate && (
                <div className="text-xs text-orange-600 mt-1">
                  Due: {item.dueDate.toLocaleDateString()}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {filteredItems.length > 10 && (
          <div className="text-center py-2">
            <span className="text-xs text-gray-500">
              +{filteredItems.length - 10} more items
            </span>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            {filteredItems.length} items 
            {showAllSpaces && ` from ${getSpaceStats().length} spaces`}
          </span>
          <button 
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="hover:text-gray-800 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  )
}