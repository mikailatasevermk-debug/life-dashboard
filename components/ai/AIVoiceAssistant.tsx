"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Mic, MicOff, Volume2, Sparkles, Send, X, 
  Loader2, Bot, User, Heart, Moon, BookOpen,
  Calendar, Target, Users, Home, Settings
} from "lucide-react"
import { useRouter } from "next/navigation"

interface AIVoiceAssistantProps {
  onAction?: (action: any) => void
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  actions?: any[]
}

interface ConversationContext {
  currentSpace?: string
  lastAction?: string
  familyId?: string
  userId?: string
  preferences?: Record<string, any>
}

// AI Intent Recognition and Natural Language Understanding
const AI_INTENTS = {
  CREATE_NOTE: ['create note', 'write note', 'add note', 'new note', 'take note', 'jot down'],
  NAVIGATE: ['go to', 'open', 'show', 'navigate', 'take me to', 'switch to'],
  PRAYER: ['prayer', 'salah', 'adhan', 'pray', 'namaz', 'islamic'],
  QURAN: ['quran', 'recitation', 'recite', 'surah', 'ayah', 'verse'],
  FAMILY: ['family', 'share', 'member', 'relative'],
  GOAL: ['goal', 'target', 'objective', 'aim', 'complete', 'finish'],
  STORY: ['story', 'journey', 'narrative', 'tell me', 'what happened'],
  MOOD: ['mood', 'feeling', 'emotion', 'happy', 'sad', 'excited'],
  SCHEDULE: ['schedule', 'calendar', 'event', 'appointment', 'meeting', 'plan'],
  SEARCH: ['find', 'search', 'look for', 'where', 'show me'],
  HELP: ['help', 'assist', 'what can you', 'how to', 'guide'],
  SETTINGS: ['settings', 'preference', 'configure', 'change', 'update']
}

export function AIVoiceAssistant({ onAction }: AIVoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [context, setContext] = useState<ConversationContext>({})
  const [inputText, setInputText] = useState("")
  
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex
        const transcript = event.results[current][0].transcript
        setTranscript(transcript)
        
        if (event.results[current].isFinal) {
          processUserInput(transcript)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start()
        }
      }
    }

    // Load context
    const user = localStorage.getItem('current_user')
    if (user) {
      const userData = JSON.parse(user)
      setContext(prev => ({
        ...prev,
        userId: userData.id,
        familyId: userData.familyId
      }))
    }

    // Keyboard shortcut
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'a') {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isListening])

  const processUserInput = async (input: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setTranscript("")
    setIsProcessing(true)

    // Analyze intent and generate response
    const intent = analyzeIntent(input)
    const response = await generateAIResponse(input, intent)
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.text,
      timestamp: new Date(),
      actions: response.actions
    }
    
    setMessages(prev => [...prev, assistantMessage])
    
    // Execute actions
    if (response.actions && response.actions.length > 0) {
      for (const action of response.actions) {
        await executeAction(action)
      }
    }
    
    // Speak response
    speak(response.text)
    
    setIsProcessing(false)
  }

  const analyzeIntent = (input: string): string => {
    const lowerInput = input.toLowerCase()
    
    for (const [intent, keywords] of Object.entries(AI_INTENTS)) {
      if (keywords.some(keyword => lowerInput.includes(keyword))) {
        return intent
      }
    }
    
    return 'GENERAL'
  }

  const generateAIResponse = async (input: string, intent: string) => {
    const lowerInput = input.toLowerCase()
    
    // Smart context-aware responses
    switch (intent) {
      case 'CREATE_NOTE':
        const noteContent = extractNoteContent(input)
        const noteSpace = extractSpace(input) || context.currentSpace || 'GENERAL'
        return {
          text: `I'll create a note for you in ${noteSpace}. "${noteContent}"`,
          actions: [{
            type: 'CREATE_NOTE',
            data: { content: noteContent, space: noteSpace }
          }]
        }

      case 'NAVIGATE':
        const destination = extractDestination(input)
        return {
          text: `Taking you to ${destination}`,
          actions: [{
            type: 'NAVIGATE',
            data: { to: destination }
          }]
        }

      case 'PRAYER':
        if (lowerInput.includes('time')) {
          return {
            text: "I'll show you the prayer times for today",
            actions: [{
              type: 'NAVIGATE',
              data: { to: '/dashboard', space: 'FAITH' }
            }]
          }
        } else if (lowerInput.includes('adhan') || lowerInput.includes('call')) {
          return {
            text: "Playing the Adhan for you",
            actions: [{
              type: 'PLAY_ADHAN'
            }]
          }
        }
        return {
          text: "Would you like to see prayer times or hear the Adhan?",
          actions: []
        }

      case 'QURAN':
        const reciter = extractReciter(input)
        return {
          text: `Starting Quran recitation${reciter ? ` by ${reciter}` : ''}`,
          actions: [{
            type: 'PLAY_QURAN',
            data: { reciter }
          }]
        }

      case 'FAMILY':
        if (lowerInput.includes('share')) {
          return {
            text: "I'll enable family sharing for your next note",
            actions: [{
              type: 'ENABLE_FAMILY_SHARING'
            }]
          }
        }
        return {
          text: "Opening your family dashboard",
          actions: [{
            type: 'OPEN_FAMILY'
          }]
        }

      case 'GOAL':
        if (lowerInput.includes('create') || lowerInput.includes('add')) {
          const goalTitle = extractGoalTitle(input)
          return {
            text: `Creating a new goal: "${goalTitle}"`,
            actions: [{
              type: 'CREATE_GOAL',
              data: { title: goalTitle }
            }]
          }
        }
        return {
          text: "Showing your goals",
          actions: [{
            type: 'SHOW_GOALS'
          }]
        }

      case 'STORY':
        return {
          text: "Let me show you your daily story",
          actions: [{
            type: 'NAVIGATE',
            data: { to: '/dashboard', space: 'STORYTELLING' }
          }]
        }

      case 'MOOD':
        const mood = extractMood(input)
        if (mood) {
          return {
            text: `I've recorded that you're feeling ${mood} today`,
            actions: [{
              type: 'RECORD_MOOD',
              data: { mood }
            }]
          }
        }
        return {
          text: "How are you feeling today?",
          actions: []
        }

      case 'SCHEDULE':
        if (lowerInput.includes('add') || lowerInput.includes('create')) {
          const eventDetails = extractEventDetails(input)
          return {
            text: `Adding "${eventDetails.title}" to your calendar`,
            actions: [{
              type: 'CREATE_EVENT',
              data: eventDetails
            }]
          }
        }
        return {
          text: "Opening your schedule",
          actions: [{
            type: 'NAVIGATE',
            data: { to: '/schedule' }
          }]
        }

      case 'SEARCH':
        const searchQuery = extractSearchQuery(input)
        return {
          text: `Searching for "${searchQuery}"`,
          actions: [{
            type: 'SEARCH',
            data: { query: searchQuery }
          }]
        }

      case 'HELP':
        return {
          text: "I can help you create notes, navigate spaces, check prayer times, play Quran, manage goals, view your story, track mood, schedule events, and connect with family. Just tell me what you'd like to do!",
          actions: []
        }

      case 'SETTINGS':
        return {
          text: "Opening settings",
          actions: [{
            type: 'OPEN_SETTINGS'
          }]
        }

      default:
        // Use AI-like responses for general queries
        return handleGeneralQuery(input)
    }
  }

  const handleGeneralQuery = (input: string) => {
    const lowerInput = input.toLowerCase()
    
    // Contextual responses based on current state
    if (lowerInput.includes('thank')) {
      return {
        text: "You're welcome! I'm always here to help you manage your life dashboard.",
        actions: []
      }
    }
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      const hour = new Date().getHours()
      const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
      return {
        text: `${greeting}! How can I assist you today?`,
        actions: []
      }
    }
    
    if (lowerInput.includes('love') && lowerInput.includes('wife')) {
      return {
        text: "That's beautiful! Would you like to add a note in your Love space?",
        actions: [{
          type: 'NAVIGATE',
          data: { to: '/dashboard', space: 'LOVE' }
        }]
      }
    }
    
    // Default response
    return {
      text: "I understand you want to: " + input + ". Let me help you with that. Could you be more specific about what you'd like to do?",
      actions: []
    }
  }

  // Helper extraction functions
  const extractNoteContent = (input: string): string => {
    const patterns = [
      /(?:note|write|add|jot down)(?:\s+that)?(?:\s+says?)?\s+(.+)/i,
      /(?:create|make)\s+(?:a\s+)?note\s+(?:about|for|that|saying)?\s+(.+)/i
    ]
    
    for (const pattern of patterns) {
      const match = input.match(pattern)
      if (match) return match[1].trim()
    }
    
    return input.replace(/create|add|write|note|new/gi, '').trim()
  }

  const extractSpace = (input: string): string | null => {
    const spaces = ['projects', 'family', 'home', 'love', 'buying', 'career', 'faith', 'storytelling']
    const lowerInput = input.toLowerCase()
    
    for (const space of spaces) {
      if (lowerInput.includes(space)) {
        return space.toUpperCase()
      }
    }
    
    return null
  }

  const extractDestination = (input: string): string => {
    if (input.includes('dashboard')) return '/dashboard'
    if (input.includes('schedule') || input.includes('calendar')) return '/schedule'
    if (input.includes('timeline')) return '/timeline'
    if (input.includes('faith') || input.includes('islamic')) return '/dashboard?space=FAITH'
    if (input.includes('story') || input.includes('stories')) return '/dashboard?space=STORYTELLING'
    if (input.includes('family')) return '/dashboard?space=FAMILY'
    if (input.includes('love')) return '/dashboard?space=LOVE'
    if (input.includes('project')) return '/dashboard?space=PROJECTS'
    if (input.includes('home')) return '/dashboard?space=HOME'
    
    return '/dashboard'
  }

  const extractReciter = (input: string): string | null => {
    const reciters = ['mishary', 'abdul basit', 'sudais', 'shuraim', 'minshawi', 'husary', 'ghamdi', 'ajmi']
    const lowerInput = input.toLowerCase()
    
    for (const reciter of reciters) {
      if (lowerInput.includes(reciter)) {
        return reciter
      }
    }
    
    return null
  }

  const extractGoalTitle = (input: string): string => {
    const patterns = [
      /(?:goal|target|objective)(?:\s+to)?\s+(.+)/i,
      /(?:create|add|set)\s+(?:a\s+)?goal\s+(?:to|for)?\s+(.+)/i
    ]
    
    for (const pattern of patterns) {
      const match = input.match(pattern)
      if (match) return match[1].trim()
    }
    
    return input.replace(/create|add|goal|target|objective|new/gi, '').trim()
  }

  const extractMood = (input: string): string | null => {
    const moods = {
      'happy': ['happy', 'good', 'great', 'excellent', 'wonderful', 'amazing'],
      'sad': ['sad', 'down', 'blue', 'unhappy', 'depressed'],
      'excited': ['excited', 'energetic', 'pumped', 'enthusiastic'],
      'calm': ['calm', 'peaceful', 'relaxed', 'serene'],
      'stressed': ['stressed', 'anxious', 'worried', 'nervous'],
      'grateful': ['grateful', 'thankful', 'blessed']
    }
    
    const lowerInput = input.toLowerCase()
    
    for (const [mood, keywords] of Object.entries(moods)) {
      if (keywords.some(keyword => lowerInput.includes(keyword))) {
        return mood
      }
    }
    
    return null
  }

  const extractEventDetails = (input: string): any => {
    // Simple extraction - could be enhanced with NLP
    const title = input.replace(/add|create|schedule|event|appointment|meeting/gi, '').trim()
    
    return {
      title,
      date: new Date().toISOString(),
      type: 'event'
    }
  }

  const extractSearchQuery = (input: string): string => {
    const patterns = [
      /(?:search|find|look for|where is)\s+(.+)/i,
      /(?:show me)\s+(.+)/i
    ]
    
    for (const pattern of patterns) {
      const match = input.match(pattern)
      if (match) return match[1].trim()
    }
    
    return input
  }

  const executeAction = async (action: any) => {
    switch (action.type) {
      case 'NAVIGATE':
        if (action.data.space) {
          // Navigate to specific space
          window.dispatchEvent(new CustomEvent('navigate-to-space', { 
            detail: { space: action.data.space } 
          }))
        } else {
          router.push(action.data.to)
        }
        break

      case 'CREATE_NOTE':
        // Trigger note creation
        window.dispatchEvent(new CustomEvent('create-note', { 
          detail: action.data 
        }))
        break

      case 'PLAY_ADHAN':
        window.dispatchEvent(new CustomEvent('play-adhan'))
        break

      case 'PLAY_QURAN':
        window.dispatchEvent(new CustomEvent('play-quran', { 
          detail: action.data 
        }))
        break

      case 'OPEN_FAMILY':
        window.dispatchEvent(new CustomEvent('open-family'))
        break

      case 'CREATE_GOAL':
        window.dispatchEvent(new CustomEvent('create-goal', { 
          detail: action.data 
        }))
        break

      case 'RECORD_MOOD':
        const moodEmojis: Record<string, string> = {
          happy: '😊',
          sad: '😢',
          excited: '🤩',
          calm: '😌',
          stressed: '😰',
          grateful: '🙏'
        }
        
        localStorage.setItem(
          `mood_${context.currentSpace || 'GENERAL'}_${new Date().toDateString()}`,
          moodEmojis[action.data.mood] || '😊'
        )
        break

      case 'CREATE_EVENT':
        window.dispatchEvent(new CustomEvent('create-event', { 
          detail: action.data 
        }))
        break

      case 'SEARCH':
        window.dispatchEvent(new CustomEvent('search', { 
          detail: action.data 
        }))
        break

      case 'OPEN_SETTINGS':
        window.dispatchEvent(new CustomEvent('open-settings'))
        break

      case 'ENABLE_FAMILY_SHARING':
        window.dispatchEvent(new CustomEvent('enable-family-sharing'))
        break

      default:
        if (onAction) {
          onAction(action)
        }
    }
    
    // Update context
    setContext(prev => ({
      ...prev,
      lastAction: action.type
    }))
  }

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      synthRef.current = new SpeechSynthesisUtterance(text)
      synthRef.current.rate = 1.0
      synthRef.current.pitch = 1.0
      synthRef.current.volume = 0.8
      
      // Select a nice voice if available
      const voices = speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || voice.name.includes('Microsoft')
      )
      if (preferredVoice) {
        synthRef.current.voice = preferredVoice
      }
      
      speechSynthesis.speak(synthRef.current)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputText.trim()) {
      processUserInput(inputText)
      setInputText("")
    }
  }

  const clearConversation = () => {
    setMessages([])
    setContext({})
  }

  return (
    <>
      {/* Floating AI Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl text-white"
      >
        <div className="relative">
          <Sparkles className="w-6 h-6" />
          {isListening && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
        </div>
      </motion.button>

      {/* AI Assistant Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="fixed bottom-20 right-6 z-50 w-[400px] max-h-[600px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">AI Assistant</h3>
                    <p className="text-xs text-gray-600">Ask me anything!</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-10 h-10 text-purple-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Hi! I'm your AI Assistant</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      I can help you with anything on your Life Dashboard
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        "Create a note",
                        "Check prayer times",
                        "Play Quran",
                        "Show my story",
                        "Track mood"
                      ].map(suggestion => (
                        <button
                          key={suggestion}
                          onClick={() => processUserInput(suggestion)}
                          className="px-3 py-1 bg-white/70 hover:bg-white rounded-full text-xs text-gray-700 border border-gray-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map(message => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div className={`p-2 rounded-xl flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-purple-100' 
                          : 'bg-gray-100'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Bot className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div className={`flex-1 p-3 rounded-xl ${
                        message.role === 'user'
                          ? 'bg-purple-100 text-purple-900'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        {message.actions && message.actions.length > 0 && (
                          <div className="mt-2 flex gap-2">
                            {message.actions.map((action, index) => (
                              <span
                                key={index}
                                className="text-xs bg-white/50 px-2 py-1 rounded"
                              >
                                ✓ {action.type}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}

                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="p-2 bg-gray-100 rounded-xl">
                      <Bot className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-100 rounded-xl p-3">
                      <div className="flex gap-1">
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {transcript && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3 flex-row-reverse"
                  >
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                      <p className="text-sm text-purple-800 italic">{transcript}...</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                <form onSubmit={handleTextSubmit} className="flex gap-2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-3 rounded-xl transition-all ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type or speak your request..."
                    className="flex-1 px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  
                  <button
                    type="submit"
                    disabled={!inputText.trim() && !transcript}
                    className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Press <kbd className="px-1.5 py-0.5 bg-white rounded text-xs">Cmd+Shift+A</kbd> to open
                  </p>
                  {messages.length > 0 && (
                    <button
                      onClick={clearConversation}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear chat
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}