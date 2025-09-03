"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Play, Pause, Square, Save, X, Download } from "lucide-react"

interface VoiceRecorderProps {
  isOpen: boolean
  onClose: () => void
  onSave: (audioBlob: Blob, transcript?: string) => void
  spaceType: string
  spaceName: string
}

export function VoiceRecorder({ isOpen, onClose, onSave, spaceType, spaceName }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [transcript, setTranscript] = useState("")
  const [title, setTitle] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check your permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleSave = () => {
    if (audioBlob) {
      const voiceNote = {
        title: title || `Voice Note - ${new Date().toLocaleString()}`,
        audioBlob,
        transcript,
        duration: recordingTime,
        spaceType,
        createdAt: new Date().toISOString()
      }
      
      // Save to localStorage as base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64data = reader.result as string
        const existingVoiceNotes = JSON.parse(localStorage.getItem(`voice_notes_${spaceType}`) || '[]')
        existingVoiceNotes.unshift({
          ...voiceNote,
          audioData: base64data
        })
        localStorage.setItem(`voice_notes_${spaceType}`, JSON.stringify(existingVoiceNotes))
        
        onSave(audioBlob, transcript)
      }
      reader.readAsDataURL(audioBlob)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const downloadRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `voice-note-${spaceType}-${Date.now()}.webm`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

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

          {/* Voice Recorder Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 w-full max-w-md">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <Mic className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Voice Recorder</h2>
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
                {/* Recording Status */}
                <div className="text-center">
                  <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    isRecording ? 'bg-red-100 animate-pulse' : 'bg-gray-100'
                  }`}>
                    {isRecording ? (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <Mic className="w-12 h-12 text-red-600" />
                      </motion.div>
                    ) : (
                      <Mic className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="text-3xl font-mono font-bold text-gray-800 mb-2">
                    {formatTime(recordingTime)}
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    {isRecording ? 'Recording in progress...' : 
                     audioBlob ? 'Recording complete' : 'Ready to record'}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  {!isRecording && !audioBlob && (
                    <button
                      onClick={startRecording}
                      className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                    >
                      <Mic className="w-6 h-6" />
                    </button>
                  )}

                  {isRecording && (
                    <button
                      onClick={stopRecording}
                      className="p-4 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors shadow-lg"
                    >
                      <Square className="w-6 h-6" />
                    </button>
                  )}

                  {audioBlob && (
                    <>
                      <button
                        onClick={isPlaying ? pauseRecording : playRecording}
                        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      
                      <button
                        onClick={downloadRecording}
                        className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Audio Element */}
                {audioUrl && (
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                )}

                {/* Title Input */}
                {audioBlob && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title (optional)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={`Voice Note - ${new Date().toLocaleString()}`}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                    />
                  </div>
                )}

                {/* Transcript */}
                {audioBlob && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes/Transcript (optional)
                    </label>
                    <textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder="Add notes about this recording..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 resize-none"
                      rows={3}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                {audioBlob && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setAudioBlob(null)
                        setAudioUrl(null)
                        setRecordingTime(0)
                        setTitle("")
                        setTranscript("")
                      }}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Record Again
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Recording
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}