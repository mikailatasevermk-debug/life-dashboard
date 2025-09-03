"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Save, X, ShoppingCart, Plus, Trash2, Check } from "lucide-react"

interface ShoppingItem {
  id: string
  item: string
  quantity?: string
  completed: boolean
  addedAt: Date
  priority?: 'low' | 'medium' | 'high' | 'vip'
  dueDate?: Date
  category?: string
  spaceType: string
  spaceName: string
}

interface GroceryVoiceRecorderProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  spaceType: string
  spaceName: string
}

export function GroceryVoiceRecorder({ isOpen, onClose, onSave, spaceType, spaceName }: GroceryVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([])
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [manualItem, setManualItem] = useState("")
  const [manualPriority, setManualPriority] = useState<'low' | 'medium' | 'high' | 'vip'>('medium')
  const [manualDueDate, setManualDueDate] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<any>(null)

  // Load existing grocery list
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(`grocery_list_${spaceType}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        setShoppingList(parsed.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        })))
      }
    }
  }, [isOpen, spaceType])

  // Setup speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        let final = ''
        let interim = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' '
          } else {
            interim += event.results[i][0].transcript
          }
        }
        
        if (final) {
          setTranscript(prev => prev + final)
          processGroceryItems(final)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const processGroceryItems = (text: string) => {
    setIsProcessing(true)
    
    // Simple grocery item extraction patterns
    const itemPatterns = [
      /(?:buy|get|need|pick up)\s+(.*?)(?:\s+and|\s*$)/gi,
      /(?:add)\s+(.*?)(?:\s+to|$)/gi,
      /(.*?)(?:\s+please|$)/gi
    ]

    const extractedItems: string[] = []
    
    // Extract items using patterns
    itemPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const item = match[1].trim()
        if (item && item.length > 2 && !extractedItems.includes(item.toLowerCase())) {
          extractedItems.push(item)
        }
      }
    })

    // If no patterns match, split by common separators
    if (extractedItems.length === 0) {
      const items = text.split(/[,\sand\s]|\s+/)
        .map(item => item.trim())
        .filter(item => item.length > 2)
      extractedItems.push(...items)
    }

    // Add new items to shopping list
    const newItems: ShoppingItem[] = extractedItems.map(item => ({
      id: `${Date.now()}-${Math.random()}`,
      item: item.toLowerCase().replace(/^(a|an|the|some)\s+/, ''),
      completed: false,
      addedAt: new Date(),
      priority: 'medium' as const,
      spaceType,
      spaceName
    }))

    setShoppingList(prev => {
      const existingItems = prev.map(i => i.item.toLowerCase())
      const uniqueNewItems = newItems.filter(item => 
        !existingItems.includes(item.item.toLowerCase())
      )
      return [...prev, ...uniqueNewItems]
    })

    setTimeout(() => setIsProcessing(false), 1000)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      setIsRecording(true)
      setRecordingTime(0)
      setTranscript("")
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const addManualItem = () => {
    if (!manualItem.trim()) return

    const newItem: ShoppingItem = {
      id: `${Date.now()}-${Math.random()}`,
      item: manualItem.trim().toLowerCase(),
      completed: false,
      addedAt: new Date(),
      priority: manualPriority,
      dueDate: manualDueDate ? new Date(manualDueDate) : undefined,
      spaceType,
      spaceName
    }

    setShoppingList(prev => [...prev, newItem])
    setManualItem("")
    setManualDueDate("")
  }

  const toggleItem = (id: string) => {
    setShoppingList(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  const deleteItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id))
  }

  const handleSave = () => {
    localStorage.setItem(`grocery_list_${spaceType}`, JSON.stringify(shoppingList))
    onSave()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const pendingItems = shoppingList.filter(item => !item.completed)
  const completedItems = shoppingList.filter(item => item.completed)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 w-full max-w-2xl max-h-[90vh] overflow-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">🛒 Voice Grocery List</h2>
                    <p className="text-sm text-gray-600">{spaceName}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Voice Recording */}
                <div className="text-center">
                  <div className="mb-4">
                    <motion.button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </motion.button>
                  </div>
                  
                  {isRecording && (
                    <div className="space-y-2">
                      <p className="text-lg font-mono font-bold text-red-600">{formatTime(recordingTime)}</p>
                      <p className="text-sm text-gray-600">🎤 Say items like: "I need milk, bread, and apples"</p>
                    </div>
                  )}
                  
                  {!isRecording && (
                    <p className="text-sm text-gray-600">Tap the microphone to start voice recording</p>
                  )}

                  {isProcessing && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">🤖 Processing your voice... Adding items!</p>
                    </div>
                  )}
                </div>

                {/* Manual Add */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-800">Or add manually:</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualItem}
                      onChange={(e) => setManualItem(e.target.value)}
                      placeholder="Enter shopping item..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-400"
                      onKeyPress={(e) => e.key === 'Enter' && addManualItem()}
                    />
                    <button
                      onClick={addManualItem}
                      disabled={!manualItem.trim()}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={manualPriority}
                        onChange={(e) => setManualPriority(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-400 text-sm"
                      >
                        <option value="low">⚪ Low</option>
                        <option value="medium">🔵 Medium</option>
                        <option value="high">🟠 High</option>
                        <option value="vip">⭐ VIP</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Due Date (optional)</label>
                      <input
                        type="date"
                        value={manualDueDate}
                        onChange={(e) => setManualDueDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-400 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Grocery List */}
                {pendingItems.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Shopping List ({pendingItems.length} items)
                    </h4>
                    <div className="space-y-2">
                      {pendingItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-gray-200 hover:bg-white/70 transition-colors"
                        >
                          <button
                            onClick={() => toggleItem(item.id)}
                            className="w-5 h-5 border-2 border-gray-300 rounded hover:border-green-500 transition-colors"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 capitalize">{item.item}</p>
                          </div>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Items */}
                {completedItems.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-600 mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Got It! ({completedItems.length})
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {completedItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg opacity-75">
                          <button
                            onClick={() => toggleItem(item.id)}
                            className="w-4 h-4 bg-green-500 rounded flex items-center justify-center text-white"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <p className="text-sm text-gray-600 line-through capitalize">{item.item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {shoppingList.length === 0 && (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No items yet</h3>
                    <p className="text-gray-500">Use voice or add items manually!</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save List ({shoppingList.length})
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}