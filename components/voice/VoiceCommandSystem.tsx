"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react"

interface VoiceCommandSystemProps {
  onCommand: (command: string, params?: any) => void
}

interface Command {
  phrases: string[]
  action: string
  description: string
  params?: any
}

const VOICE_COMMANDS: Command[] = [
  // Navigation
  { phrases: ["go to dashboard", "show dashboard", "home"], action: "navigate", params: { to: "/dashboard" }, description: "Go to main dashboard" },
  { phrases: ["go to timeline", "show timeline", "show notes timeline"], action: "navigate", params: { to: "/timeline" }, description: "Open notes timeline" },
  { phrases: ["go to schedule", "show schedule", "show calendar"], action: "navigate", params: { to: "/schedule" }, description: "Open schedule" },
  
  // Islamic Commands
  { phrases: ["show prayer times", "prayer times", "when is next prayer"], action: "navigate", params: { to: "/dashboard", space: "FAITH" }, description: "Show prayer times" },
  { phrases: ["open islamic faith", "show islamic space", "faith space"], action: "navigate", params: { to: "/dashboard", space: "FAITH" }, description: "Open Islamic Faith space" },
  { phrases: ["start dhikr", "dhikr counter", "remembrance"], action: "islamic", params: { feature: "dhikr" }, description: "Start Dhikr counter" },
  { phrases: ["quran tracker", "quran reading", "show quran"], action: "islamic", params: { feature: "quran" }, description: "Open Quran tracker" },
  { phrases: ["play adhan", "call to prayer", "adhan now"], action: "islamic", params: { feature: "adhan" }, description: "Play Adhan" },
  { phrases: ["play quran", "recitation", "start recitation"], action: "islamic", params: { feature: "recitation" }, description: "Play Quran recitation" },
  
  // Storytelling Commands
  { phrases: ["show my story", "daily story", "storytelling", "my journey"], action: "navigate", params: { to: "/dashboard", space: "STORYTELLING" }, description: "Open daily storytelling" },
  { phrases: ["tell my story", "generate story", "create story"], action: "storytelling", params: { type: "generate" }, description: "Generate story from activities" },
  
  // Note Commands
  { phrases: ["create note", "new note", "add note", "write note"], action: "note", params: { type: "text" }, description: "Create a new text note" },
  { phrases: ["voice note", "record note", "voice memo"], action: "note", params: { type: "voice" }, description: "Create a voice note" },
  { phrases: ["show notes", "my notes", "all notes"], action: "navigate", params: { to: "/timeline" }, description: "Show all notes" },
  
  // Quick Actions
  { phrases: ["add task", "new task", "create task"], action: "quickAction", params: { type: "task" }, description: "Add a new task" },
  { phrases: ["add event", "new event", "schedule event"], action: "quickAction", params: { type: "event" }, description: "Add new event" },
  { phrases: ["family dashboard", "show family", "family space"], action: "quickAction", params: { type: "family" }, description: "Open family dashboard" },
  
  // System Commands
  { phrases: ["help", "what can you do", "voice commands"], action: "system", params: { type: "help" }, description: "Show available commands" },
  { phrases: ["settings", "open settings", "preferences"], action: "system", params: { type: "settings" }, description: "Open settings" },
  { phrases: ["stop listening", "disable voice", "turn off voice"], action: "system", params: { type: "disable" }, description: "Disable voice commands" },
]

export function VoiceCommandSystem({ onCommand }: VoiceCommandSystemProps) {
  const [isListening, setIsListening] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [confidence, setConfidence] = useState(0)
  const [showCommands, setShowCommands] = useState(false)
  const [lastCommand, setLastCommand] = useState<string | null>(null)
  
  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check if speech recognition is available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.toLowerCase().trim()
          const confidence = event.results[i][0].confidence
          
          if (event.results[i].isFinal) {
            finalTranscript = transcript
            setConfidence(confidence)
            processCommand(transcript)
          } else {
            interimTranscript = transcript
          }
        }
        
        setTranscript(finalTranscript || interimTranscript)
      }
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'not-allowed') {
          setIsEnabled(false)
          setIsListening(false)
        }
      }
      
      recognitionRef.current.onend = () => {
        if (isEnabled && isListening) {
          // Restart recognition if it stops
          setTimeout(() => {
            if (recognitionRef.current && isEnabled) {
              recognitionRef.current.start()
            }
          }, 100)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isEnabled, isListening])

  const processCommand = (transcript: string) => {
    console.log('Processing command:', transcript)
    
    // Find matching command
    const matchedCommand = VOICE_COMMANDS.find(cmd => 
      cmd.phrases.some(phrase => 
        transcript.includes(phrase) || 
        phrase.split(' ').every(word => transcript.includes(word))
      )
    )
    
    if (matchedCommand) {
      setLastCommand(matchedCommand.description)
      onCommand(matchedCommand.action, matchedCommand.params)
      
      // Provide audio feedback
      speak(`${matchedCommand.description}`)
      
      // Clear command after 3 seconds
      setTimeout(() => setLastCommand(null), 3000)
    } else {
      // No command found
      speak("Sorry, I didn't understand that command")
    }
    
    // Clear transcript
    setTimeout(() => setTranscript(""), 2000)
  }

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 0.7
      speechSynthesis.speak(utterance)
    }
  }

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setIsEnabled(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
      setIsEnabled(true)
      speak("Voice commands activated")
    }
  }

  const toggleCommandsHelp = () => {
    setShowCommands(!showCommands)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Voice Command Button */}
      <div className="flex flex-col items-end gap-3">
        {/* Help Button */}
        <motion.button
          onClick={toggleCommandsHelp}
          className="p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Voice Commands Help"
        >
          <Volume2 className="w-5 h-5" />
        </motion.button>

        {/* Main Voice Control Button */}
        <motion.button
          onClick={toggleListening}
          className={`p-4 rounded-full shadow-lg transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isListening ? "Stop Voice Commands" : "Start Voice Commands"}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Status Display */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-20 right-0 bg-black/80 text-white p-4 rounded-lg backdrop-blur-sm min-w-64 max-w-80"
          >
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">Listening...</span>
            </div>
            
            {transcript && (
              <div className="text-sm text-gray-300 mb-2">
                <strong>Heard:</strong> "{transcript}"
              </div>
            )}
            
            {lastCommand && (
              <div className="text-sm text-green-400">
                <strong>Executing:</strong> {lastCommand}
              </div>
            )}
            
            <div className="text-xs text-gray-400 mt-2">
              Try: "show prayer times", "create note", "go to timeline"
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Commands Help Panel */}
      <AnimatePresence>
        {showCommands && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: 20 }}
            className="absolute bottom-32 right-0 bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/50 min-w-80 max-w-96 max-h-96 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">🎙️ Voice Commands</h3>
              <button
                onClick={toggleCommandsHelp}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Navigation Commands */}
              <div>
                <h4 className="font-semibold text-sm text-blue-600 mb-2">Navigation</h4>
                <div className="space-y-1">
                  {VOICE_COMMANDS.filter(cmd => cmd.action === 'navigate').map((cmd, index) => (
                    <div key={index} className="text-xs">
                      <span className="font-medium text-gray-700">"{cmd.phrases[0]}"</span>
                      <span className="text-gray-500 ml-2">→ {cmd.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Islamic Commands */}
              <div>
                <h4 className="font-semibold text-sm text-green-600 mb-2">Islamic Features</h4>
                <div className="space-y-1">
                  {VOICE_COMMANDS.filter(cmd => cmd.action === 'islamic').map((cmd, index) => (
                    <div key={index} className="text-xs">
                      <span className="font-medium text-gray-700">"{cmd.phrases[0]}"</span>
                      <span className="text-gray-500 ml-2">→ {cmd.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note Commands */}
              <div>
                <h4 className="font-semibold text-sm text-purple-600 mb-2">Notes</h4>
                <div className="space-y-1">
                  {VOICE_COMMANDS.filter(cmd => cmd.action === 'note').map((cmd, index) => (
                    <div key={index} className="text-xs">
                      <span className="font-medium text-gray-700">"{cmd.phrases[0]}"</span>
                      <span className="text-gray-500 ml-2">→ {cmd.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Tip:</strong> Speak clearly and wait for the green feedback. 
                Voice commands work best in quiet environments.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}