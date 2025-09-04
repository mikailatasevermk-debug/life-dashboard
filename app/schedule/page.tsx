"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Filter, 
  Plus,
  Users,
  Lock,
  ChevronRight,
  Edit,
  Trash2,
  MapPin
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { SPACES } from "@/lib/spaces"
import { EventModal } from "@/components/calendar/EventModal"
import { useUserProgress } from "@/lib/user-progress"

import { Briefcase, Home, Heart, ShoppingBag, Building2, Church, Moon, BookOpen, Dumbbell, Star } from "lucide-react"

const iconMap = {
  "briefcase": Briefcase,
  "users": Users,
  "home": Home,
  "heart": Heart,
  "shopping-bag": ShoppingBag,
  "building-2": Building2,
  "church": Church,
  "moon": Moon,
  "book-open": BookOpen,
  "dumbbell": Dumbbell,
  "star": Star,
} as const

// Use specific lucide icons for the spaces where available
// We already have Users imported; for others, fallback to Calendar if not imported

interface Event {
  id: string
  title: string
  description?: string
  startDate: string
  endDate?: string
  startTime: string
  endTime?: string
  isAllDay: boolean
  sharedWithFamily: boolean
  spaceType: string
  location?: string
  createdAt?: string
}

// Initial demo events
const getInitialEvents = (): Event[] => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date()
  dayAfter.setDate(dayAfter.getDate() + 2)
  const dayAfterThat = new Date()
  dayAfterThat.setDate(dayAfterThat.getDate() + 3)

  return [
    {
      id: "1",
      title: "Weekly Planning",
      description: "Review goals and set priorities",
      startDate: tomorrow.toISOString().split('T')[0],
      startTime: "10:00",
      endTime: "11:00",
      isAllDay: false,
      sharedWithFamily: false,
      spaceType: "PROJECTS",
      location: "Home Office"
    },
    {
      id: "2",
      title: "Family Dinner",
      description: "Sunday dinner with everyone",
      startDate: dayAfter.toISOString().split('T')[0],
      startTime: "18:00",
      endTime: "20:00",
      isAllDay: false,
      sharedWithFamily: true,
      spaceType: "FAMILY",
      location: "Kitchen"
    },
    {
      id: "3",
      title: "Anniversary",
      description: "Special day with wife",
      startDate: dayAfterThat.toISOString().split('T')[0],
      startTime: "00:00",
      isAllDay: true,
      sharedWithFamily: true,
      spaceType: "LOVE",
      location: "Romantic Restaurant"
    }
  ]
}

export default function SchedulePage() {
  const [filter, setFilter] = useState<"all" | "shared" | "private">("all")
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const { addCoins, COIN_REWARDS } = useUserProgress()

  // Load events from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar_events')
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents))
    } else {
      // Set initial demo events if none exist
      const initialEvents = getInitialEvents()
      setEvents(initialEvents)
      localStorage.setItem('calendar_events', JSON.stringify(initialEvents))
    }
  }, [])

  const saveEvent = (eventData: any) => {
    let updatedEvents
    
    if (editingEvent) {
      // Update existing event
      updatedEvents = events.map(event => 
        event.id === editingEvent.id ? { ...eventData, createdAt: event.createdAt } : event
      )
    } else {
      // Add new event
      const newEvent = {
        ...eventData,
        createdAt: new Date().toISOString()
      }
      updatedEvents = [newEvent, ...events]
      addCoins(COIN_REWARDS.ADD_EVENT)
    }
    
    setEvents(updatedEvents)
    localStorage.setItem('calendar_events', JSON.stringify(updatedEvents))
    setEditingEvent(null)
  }

  const deleteEvent = (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    
    const updatedEvents = events.filter(event => event.id !== eventId)
    setEvents(updatedEvents)
    localStorage.setItem('calendar_events', JSON.stringify(updatedEvents))
  }

  const editEvent = (event: Event) => {
    setEditingEvent(event)
    setShowEventModal(true)
  }

  const filteredEvents = events.filter(event => {
    if (filter === "shared" && !event.sharedWithFamily) return false
    if (filter === "private" && event.sharedWithFamily) return false
    if (selectedSpace && event.spaceType !== selectedSpace) return false
    return true
  })

  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const dateKey = new Date(event.startDate).toDateString()
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(event)
    return acc
  }, {} as Record<string, Event[]>)

  // Sort events by date
  const sortedGroupedEvents = Object.entries(groupedEvents)
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .reduce((acc, [date, events]) => {
      acc[date] = events.sort((a, b) => {
        if (a.isAllDay && !b.isAllDay) return -1
        if (!a.isAllDay && b.isAllDay) return 1
        if (a.isAllDay && b.isAllDay) return 0
        return a.startTime.localeCompare(b.startTime)
      })
      return acc
    }, {} as Record<string, Event[]>)

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 bg-white/60 backdrop-blur-xl rounded-lg hover:bg-white/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>
              <div className="p-2 bg-white/60 backdrop-blur-xl rounded-lg">
                <Calendar className="w-6 h-6 text-sky-blue" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Schedule</h1>
                <p className="text-sm text-gray-600">Your events from all spaces</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setEditingEvent(null)
                setShowEventModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-sky-blue text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Event</span>
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="flex bg-white/60 backdrop-blur-xl rounded-lg p-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === "all" 
                    ? "bg-white text-gray-800" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setFilter("shared")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === "shared" 
                    ? "bg-white text-gray-800" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Users className="w-3 h-3 inline mr-1" />
                Shared
              </button>
              <button
                onClick={() => setFilter("private")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === "private" 
                    ? "bg-white text-gray-800" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Lock className="w-3 h-3 inline mr-1" />
                Private
              </button>
            </div>

            <div className="flex gap-1 bg-white/60 backdrop-blur-xl rounded-lg p-1">
              <button
                onClick={() => setSelectedSpace(null)}
                className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                  !selectedSpace 
                    ? "bg-white text-gray-800" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                All
              </button>
              {SPACES.map(space => (
                <button
                  key={space.type}
                  onClick={() => setSelectedSpace(space.type)}
                  className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                    selectedSpace === space.type 
                      ? "bg-white" 
                      : "hover:bg-white/50"
                  }`}
                  style={{
                    color: selectedSpace === space.type ? space.color : undefined
                  }}
                >
                  {(() => {
                    const Icon = iconMap[space.iconName as keyof typeof iconMap] || Calendar
                    return <Icon className="w-3 h-3" />
                  })()}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {Object.entries(sortedGroupedEvents).map(([date, events]) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4"
            >
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {new Date(date).toLocaleDateString("en-US", { 
                  weekday: "long", 
                  month: "long", 
                  day: "numeric" 
                })}
              </h3>
              <div className="space-y-2">
                {events.map(event => {
                  const space = SPACES.find(s => s.type === event.spaceType)
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
                    >
                      <div 
                        className="w-1 h-12 rounded-full"
                        style={{ backgroundColor: space?.color }}
                      />
                      <div className="flex-1" onClick={() => editEvent(event)}>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-800">{event.title}</h4>
                          {event.sharedWithFamily && (
                            <Users className="w-3 h-3 text-gray-500" />
                          )}
                          {!event.sharedWithFamily && (
                            <Lock className="w-3 h-3 text-gray-500" />
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-600">{event.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-gray-500">
                            {space?.name}
                          </span>
                          {!event.isAllDay && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.startTime} - {event.endTime}
                            </span>
                          )}
                          {event.isAllDay && (
                            <span className="text-xs text-gray-500">All day</span>
                          )}
                          {event.location && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            editEvent(event)
                          }}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="Edit event"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteEvent(event.id)
                          }}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="Delete event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="glass-card p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No events scheduled</p>
              <p className="text-sm text-gray-500 mt-1">
                Events from your notes will appear here
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-white/40 backdrop-blur-xl rounded-2xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Export calendar • Sync with Google Calendar • Set reminders
            </p>
            <button className="text-sm text-sky-blue hover:underline">
              Export as ICS
            </button>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false)
          setEditingEvent(null)
        }}
        onSave={saveEvent}
        editingEvent={editingEvent}
      />
    </div>
  )
}
