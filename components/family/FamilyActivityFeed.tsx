"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Heart, MessageCircle, Target, Calendar, BookOpen, 
  Clock, User, Sparkles, Trophy, Star, Moon
} from "lucide-react"

interface FamilyActivity {
  id: string
  userId: string
  userName: string
  type: 'note' | 'goal_complete' | 'prayer' | 'love_count' | 'mood' | 'achievement'
  title: string
  description: string
  spaceType: string
  spaceName: string
  timestamp: string
  data?: any
}

interface FamilyActivityFeedProps {
  familyId: string
  currentUserId: string
}

const ACTIVITY_ICONS = {
  note: BookOpen,
  goal_complete: Target,
  prayer: Moon,
  love_count: Heart,
  mood: Sparkles,
  achievement: Trophy
}

const ACTIVITY_COLORS = {
  note: 'text-blue-600 bg-blue-100',
  goal_complete: 'text-green-600 bg-green-100',
  prayer: 'text-purple-600 bg-purple-100',
  love_count: 'text-pink-600 bg-pink-100',
  mood: 'text-yellow-600 bg-yellow-100',
  achievement: 'text-orange-600 bg-orange-100'
}

export function FamilyActivityFeed({ familyId, currentUserId }: FamilyActivityFeedProps) {
  const [activities, setActivities] = useState<FamilyActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFamilyActivities()
    
    // Set up periodic refresh
    const interval = setInterval(loadFamilyActivities, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [familyId])

  const loadFamilyActivities = () => {
    try {
      // Get family info
      const families = JSON.parse(localStorage.getItem('app_families') || '[]')
      const family = families.find((f: any) => f.id === familyId)
      
      if (!family || !family.settings.shareNotes) {
        setActivities([])
        setLoading(false)
        return
      }

      // Get all family members
      const users = JSON.parse(localStorage.getItem('app_users') || '[]')
      const familyMembers = users.filter((u: any) => family.members.includes(u.id))
      
      const allActivities: FamilyActivity[] = []
      
      // Load activities for each family member
      familyMembers.forEach((member: any) => {
        // Load notes activities
        const memberNotes = JSON.parse(localStorage.getItem(`notes_${member.id}`) || '[]')
        memberNotes.slice(-5).forEach((note: any) => {
          if (note.shareWithFamily) {
            allActivities.push({
              id: `note_${note.id}`,
              userId: member.id,
              userName: member.name,
              type: 'note',
              title: 'Added a note',
              description: note.title || note.content.slice(0, 100) + '...',
              spaceType: note.spaceType,
              spaceName: note.spaceName,
              timestamp: note.createdAt,
              data: note
            })
          }
        })

        // Load goals achievements
        const memberGoals = JSON.parse(localStorage.getItem(`goals_${member.id}`) || '[]')
        memberGoals.forEach((goal: any) => {
          if (goal.completed && goal.shareWithFamily) {
            allActivities.push({
              id: `goal_${goal.id}`,
              userId: member.id,
              userName: member.name,
              type: 'goal_complete',
              title: 'Completed a goal',
              description: goal.title,
              spaceType: goal.spaceType || 'GENERAL',
              spaceName: goal.spaceName || 'General',
              timestamp: goal.completedAt || goal.updatedAt,
              data: goal
            })
          }
        })

        // Load prayer activities (for FAITH space)
        const prayerLog = JSON.parse(localStorage.getItem(`prayer_log_${member.id}`) || '[]')
        prayerLog.slice(-3).forEach((prayer: any) => {
          allActivities.push({
            id: `prayer_${prayer.id}`,
            userId: member.id,
            userName: member.name,
            type: 'prayer',
            title: 'Completed prayer',
            description: `${prayer.prayerName} prayer`,
            spaceType: 'FAITH',
            spaceName: 'Islamic Faith',
            timestamp: prayer.timestamp,
            data: prayer
          })
        })

        // Load love count activities
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(`loveCount_`) && key.includes(member.id)) {
            const spaceType = key.replace(`loveCount_`, '').replace(`_${member.id}`, '')
            const count = parseInt(localStorage.getItem(key) || '0')
            if (count > 0) {
              allActivities.push({
                id: `love_${member.id}_${spaceType}`,
                userId: member.id,
                userName: member.name,
                type: 'love_count',
                title: 'Expressed love',
                description: `${count} love expressions`,
                spaceType,
                spaceName: spaceType.charAt(0) + spaceType.slice(1).toLowerCase(),
                timestamp: new Date().toISOString(),
                data: { count }
              })
            }
          }
        })
      })

      // Sort by timestamp (newest first)
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      setActivities(allActivities.slice(0, 20)) // Show last 20 activities
      setLoading(false)
    } catch (error) {
      console.error('Error loading family activities:', error)
      setLoading(false)
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const sendHeartReaction = (activityId: string) => {
    // Simple heart reaction system
    const reactions = JSON.parse(localStorage.getItem(`activity_reactions_${activityId}`) || '[]')
    const userReaction = reactions.find((r: any) => r.userId === currentUserId)
    
    if (!userReaction) {
      reactions.push({
        userId: currentUserId,
        type: 'heart',
        timestamp: new Date().toISOString()
      })
      localStorage.setItem(`activity_reactions_${activityId}`, JSON.stringify(reactions))
      
      // Update the activity to show the reaction
      setActivities(prev => prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, data: { ...activity.data, reactions: reactions.length } }
          : activity
      ))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No family activities yet</h3>
        <p className="text-gray-600 text-sm">
          Family members' shared activities will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Family Activity Feed</h3>
        <button
          onClick={loadFamilyActivities}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {activities.map((activity, index) => {
            const Icon = ACTIVITY_ICONS[activity.type]
            const colorClass = ACTIVITY_COLORS[activity.type]
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/70 rounded-lg p-4 border border-gray-200 hover:border-purple-200 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Activity Icon */}
                  <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800 text-sm">
                        {activity.userId === currentUserId ? 'You' : activity.userName}
                      </span>
                      <span className="text-gray-600 text-sm">{activity.title}</span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {getTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                          {activity.spaceName}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Heart Reaction */}
                        <button
                          onClick={() => sendHeartReaction(activity.id)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-pink-600 transition-colors"
                        >
                          <Heart className="w-3 h-3" />
                          <span>{activity.data?.reactions || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}