"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, X, Save, MapPin, Users, Lock } from "lucide-react"

interface QuickScheduleProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: any) => void
  spaceType: string
  spaceName: string
}

export function QuickSchedule({ isOpen, onClose, onSave, spaceType, spaceName }: QuickScheduleProps) {
  const [formData, setFormData] = useState({
    title: "",
    startDate: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "10:00",
    location: "",
    isAllDay: false,
    sharedWithFamily: false
  })

  // Quick event templates
  const templates = [
    { name: "Meeting", duration: 60, icon: "💼" },
    { name: "Appointment", duration: 30, icon: "📅" },
    { name: "Workout", duration: 45, icon: "💪" },
    { name: "Call", duration: 30, icon: "📞" },
    { name: "Break", duration: 15, icon: "☕" },
    { name: "Lunch", duration: 60, icon: "🍽️" }
  ]

  const useTemplate = (template: typeof templates[0]) => {
    const now = new Date()
    const start = new Date(now.getTime() + 60000) // 1 minute from now
    const end = new Date(start.getTime() + template.duration * 60000)

    setFormData(prev => ({
      ...prev,
      title: `${template.icon} ${template.name}`,
      startTime: start.toTimeString().slice(0, 5),
      endTime: end.toTimeString().slice(0, 5)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    const eventData = {
      id: Date.now().toString(),
      title: formData.title,
      startDate: formData.startDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location,
      isAllDay: formData.isAllDay,
      sharedWithFamily: formData.sharedWithFamily,
      spaceType,
      createdAt: new Date().toISOString()
    }

    // Save to localStorage
    const existingEvents = JSON.parse(localStorage.getItem('calendar_events') || '[]')
    existingEvents.unshift(eventData)
    localStorage.setItem('calendar_events', JSON.stringify(existingEvents))

    onSave(eventData)
  }

  const getNextAvailableTime = () => {
    const now = new Date()
    const nextHour = new Date(now.getTime() + 3600000) // 1 hour from now
    return nextHour.toTimeString().slice(0, 5)
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

          {/* Quick Schedule Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 w-full max-w-lg">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Quick Schedule</h2>
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
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Quick Templates */}
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">Quick Templates</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {templates.map((template) => (
                      <button
                        key={template.name}
                        type="button"
                        onClick={() => useTemplate(template)}
                        className="p-2 text-center bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                      >
                        <div className="text-lg mb-1">{template.icon}</div>
                        <div className="text-xs font-medium text-gray-700">{template.name}</div>
                        <div className="text-xs text-gray-500">{template.duration}m</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Event Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="What's the event?"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
                    required
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  {/* All Day Toggle */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="allDay"
                      checked={formData.isAllDay}
                      onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="allDay" className="text-sm font-medium text-gray-700">
                      All day event
                    </label>
                  </div>

                  {/* Time Inputs */}
                  {!formData.isAllDay && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (optional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Where is this happening?"
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Privacy */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="shared"
                    checked={formData.sharedWithFamily}
                    onChange={(e) => setFormData({ ...formData, sharedWithFamily: e.target.checked })}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="shared" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    {formData.sharedWithFamily ? (
                      <>
                        <Users className="w-4 h-4" />
                        Share with family
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Keep private
                      </>
                    )}
                  </label>
                </div>

                {/* Quick Time Suggestions */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Quick Times</p>
                  <div className="flex gap-2 flex-wrap">
                    {['09:00', '12:00', '14:00', '16:00', getNextAvailableTime()].map(time => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setFormData({ ...formData, startTime: time })}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Schedule Event
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}