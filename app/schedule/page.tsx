"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Filter, 
  Plus,
  Users,
  Lock,
  ChevronRight
} from "lucide-react"
import { motion } from "framer-motion"
import { SPACES } from "@/lib/spaces"

interface Event {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  isAllDay: boolean
  sharedWithFamily: boolean
  spaceType: string
  spaceName: string
  spaceColor: string
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Weekly Planning",
    description: "Review goals and set priorities",
    startDate: new Date(Date.now() + 86400000),
    isAllDay: false,
    sharedWithFamily: false,
    spaceType: "PROJECTS",
    spaceName: "Projects / Business",
    spaceColor: "#E63946"
  },
  {
    id: "2",
    title: "Family Dinner",
    description: "Sunday dinner with everyone",
    startDate: new Date(Date.now() + 172800000),
    isAllDay: false,
    sharedWithFamily: true,
    spaceType: "FAMILY",
    spaceName: "Family",
    spaceColor: "#06D6A0"
  },
  {
    id: "3",
    title: "Anniversary",
    description: "Special day with wife",
    startDate: new Date(Date.now() + 259200000),
    isAllDay: true,
    sharedWithFamily: true,
    spaceType: "LOVE",
    spaceName: "Love with Wife",
    spaceColor: "#FF8FA3"
  }
]

export default function SchedulePage() {
  const [filter, setFilter] = useState<"all" | "shared" | "private">("all")
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null)

  const filteredEvents = mockEvents.filter(event => {
    if (filter === "shared" && !event.sharedWithFamily) return false
    if (filter === "private" && event.sharedWithFamily) return false
    if (selectedSpace && event.spaceType !== selectedSpace) return false
    return true
  })

  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const dateKey = event.startDate.toDateString()
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(event)
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
            <button className="flex items-center gap-2 px-4 py-2 bg-sky-blue text-white rounded-lg hover:opacity-90 transition-opacity">
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
                  <space.icon className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([date, events]) => (
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
                {events.map(event => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
                  >
                    <div 
                      className="w-1 h-12 rounded-full"
                      style={{ backgroundColor: event.spaceColor }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-800">{event.title}</h4>
                        {event.sharedWithFamily && (
                          <Users className="w-3 h-3 text-gray-500" />
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600">{event.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">
                          {event.spaceName}
                        </span>
                        {!event.isAllDay && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.startDate.toLocaleTimeString("en-US", { 
                              hour: "numeric", 
                              minute: "2-digit" 
                            })}
                          </span>
                        )}
                        {event.isAllDay && (
                          <span className="text-xs text-gray-500">All day</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
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
    </div>
  )
}