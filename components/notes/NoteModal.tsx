"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Save, FileText, Loader2, Users } from "lucide-react"

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  spaceType: string
  spaceName: string
  onSave: (note: { title: string; content: string; shareWithFamily?: boolean }) => Promise<void>
}

export function NoteModal({ isOpen, onClose, spaceType, spaceName, onSave }: NoteModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [shareWithFamily, setShareWithFamily] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return

    setIsSaving(true)
    try {
      await onSave({ title: title.trim(), content: content.trim(), shareWithFamily })
      setTitle("")
      setContent("")
      setShareWithFamily(false)
      onClose()
    } catch (error) {
      console.error("Error saving note:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      setTitle("")
      setContent("")
      setShareWithFamily(false)
      onClose()
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200/50">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="p-2 bg-purple-100 rounded-xl flex-shrink-0">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">New Note</h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{spaceName}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors active:scale-95 touch-manipulation flex-shrink-0"
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter note title..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/70 backdrop-blur border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your thoughts..."
                    rows={6}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/70 backdrop-blur border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-sm sm:text-base"
                    disabled={isSaving}
                  />
                </div>

                {/* Family Sharing Option */}
                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-pink-50 rounded-lg sm:rounded-xl border border-pink-200">
                  <input
                    type="checkbox"
                    id="shareWithFamily"
                    checked={shareWithFamily}
                    onChange={(e) => setShareWithFamily(e.target.checked)}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 bg-white border-2 border-pink-300 rounded focus:ring-pink-500 focus:ring-2 mt-0.5 flex-shrink-0"
                    disabled={isSaving}
                  />
                  <label htmlFor="shareWithFamily" className="flex flex-col gap-1 text-xs sm:text-sm font-medium text-gray-700 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-pink-600" />
                      Share with family
                    </div>
                    <span className="text-xs text-gray-500">(Family members can see this note)</span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200/50 bg-gray-50/50">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base active:scale-95 touch-manipulation"
                  disabled={isSaving}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isSaving || (!title.trim() && !content.trim())}
                  className="px-4 sm:px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95 touch-manipulation"
                >
                  {isSaving ? (
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  {isSaving ? "Saving..." : "Save Note"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}