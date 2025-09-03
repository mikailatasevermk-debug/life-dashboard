"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Users, UserPlus, Copy, Check, Crown, User, 
  Settings, LogOut, Trash2, Shield, Heart, 
  X, Share, Eye, EyeOff, Activity, BarChart3
} from "lucide-react"
import { FamilyActivityFeed } from "./FamilyActivityFeed"
import { FamilyInsights } from "./FamilyInsights"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  familyId?: string
  role: 'owner' | 'member'
  createdAt: string
}

interface Family {
  id: string
  name: string
  code: string
  ownerId: string
  members: string[]
  createdAt: string
  settings: {
    allowMemberInvites: boolean
    shareCalendar: boolean
    shareNotes: boolean
    shareGoals: boolean
  }
}

interface FamilyManagerProps {
  currentUser: User
  isOpen: boolean
  onClose: () => void
  onUserUpdate: (user: User) => void
}

export function FamilyManager({ currentUser, isOpen, onClose, onUserUpdate }: FamilyManagerProps) {
  const [family, setFamily] = useState<Family | null>(null)
  const [familyMembers, setFamilyMembers] = useState<User[]>([])
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'members' | 'activity' | 'insights' | 'sharing' | 'settings'>('members')

  useEffect(() => {
    if (isOpen && currentUser.familyId) {
      loadFamily()
    }
  }, [isOpen, currentUser.familyId])

  const loadFamily = () => {
    const families = JSON.parse(localStorage.getItem('app_families') || '[]')
    const userFamily = families.find((f: Family) => f.id === currentUser.familyId)
    
    if (userFamily) {
      setFamily(userFamily)
      
      // Load family members
      const users = JSON.parse(localStorage.getItem('app_users') || '[]')
      const members = users.filter((u: User) => userFamily.members.includes(u.id))
      setFamilyMembers(members)
    }
  }

  const createFamily = () => {
    const familyCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const newFamily: Family = {
      id: Date.now().toString(),
      name: `${currentUser.name}'s Family`,
      code: familyCode,
      ownerId: currentUser.id,
      members: [currentUser.id],
      createdAt: new Date().toISOString(),
      settings: {
        allowMemberInvites: true,
        shareCalendar: true,
        shareNotes: false,
        shareGoals: true
      }
    }

    // Save family
    const families = JSON.parse(localStorage.getItem('app_families') || '[]')
    families.push(newFamily)
    localStorage.setItem('app_families', JSON.stringify(families))

    // Update user
    const updatedUser = { ...currentUser, familyId: newFamily.id }
    const users = JSON.parse(localStorage.getItem('app_users') || '[]')
    const userIndex = users.findIndex((u: User) => u.id === currentUser.id)
    users[userIndex] = updatedUser
    localStorage.setItem('app_users', JSON.stringify(users))
    localStorage.setItem('current_user', JSON.stringify(updatedUser))

    onUserUpdate(updatedUser)
    setFamily(newFamily)
    setFamilyMembers([updatedUser])
  }

  const copyFamilyCode = () => {
    if (family) {
      navigator.clipboard.writeText(family.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const removeMember = (memberId: string) => {
    if (!family || family.ownerId !== currentUser.id) return
    if (!confirm('Remove this member from the family?')) return

    // Update family
    const updatedFamily = {
      ...family,
      members: family.members.filter(id => id !== memberId)
    }

    const families = JSON.parse(localStorage.getItem('app_families') || '[]')
    const familyIndex = families.findIndex((f: Family) => f.id === family.id)
    families[familyIndex] = updatedFamily
    localStorage.setItem('app_families', JSON.stringify(families))

    // Update member
    const users = JSON.parse(localStorage.getItem('app_users') || '[]')
    const memberIndex = users.findIndex((u: User) => u.id === memberId)
    if (memberIndex >= 0) {
      users[memberIndex].familyId = undefined
      localStorage.setItem('app_users', JSON.stringify(users))
    }

    setFamily(updatedFamily)
    loadFamily()
  }

  const leaveFamily = () => {
    if (!family) return
    if (!confirm('Leave this family? You can rejoin with the family code.')) return

    // Update user
    const updatedUser = { ...currentUser, familyId: undefined }
    const users = JSON.parse(localStorage.getItem('app_users') || '[]')
    const userIndex = users.findIndex((u: User) => u.id === currentUser.id)
    users[userIndex] = updatedUser
    localStorage.setItem('app_users', JSON.stringify(users))
    localStorage.setItem('current_user', JSON.stringify(updatedUser))

    // Update family
    const updatedFamily = {
      ...family,
      members: family.members.filter(id => id !== currentUser.id)
    }

    const families = JSON.parse(localStorage.getItem('app_families') || '[]')
    const familyIndex = families.findIndex((f: Family) => f.id === family.id)
    families[familyIndex] = updatedFamily
    localStorage.setItem('app_families', JSON.stringify(families))

    onUserUpdate(updatedUser)
    onClose()
  }

  const updateFamilySettings = (key: keyof Family['settings'], value: boolean) => {
    if (!family || family.ownerId !== currentUser.id) return

    const updatedFamily = {
      ...family,
      settings: {
        ...family.settings,
        [key]: value
      }
    }

    const families = JSON.parse(localStorage.getItem('app_families') || '[]')
    const familyIndex = families.findIndex((f: Family) => f.id === family.id)
    families[familyIndex] = updatedFamily
    localStorage.setItem('app_families', JSON.stringify(families))

    setFamily(updatedFamily)
  }

  const isOwner = family?.ownerId === currentUser.id

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
                  <div className="p-2 bg-pink-100 rounded-xl">
                    <Users className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Family Dashboard</h2>
                    <p className="text-sm text-gray-600">
                      {family ? family.name : 'Manage your family sharing'}
                    </p>
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
              <div className="p-6">
                {!family ? (
                  /* No Family - Create One */
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart className="w-10 h-10 text-pink-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Create Your Family</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Start sharing notes, goals, and events with your loved ones. Create a family dashboard to stay connected.
                    </p>
                    <button
                      onClick={createFamily}
                      className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-colors font-medium flex items-center gap-2 mx-auto"
                    >
                      <Users className="w-5 h-5" />
                      Create Family Dashboard
                    </button>
                  </div>
                ) : (
                  /* Family Exists */
                  <div className="space-y-6">
                    {/* Family Info Card */}
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{family.name}</h3>
                          <p className="text-sm text-gray-600">{familyMembers.length} member(s)</p>
                        </div>
                        {isOwner && (
                          <Crown className="w-6 h-6 text-yellow-500" />
                        )}
                      </div>
                      
                      <div className="bg-white/60 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Family Code</p>
                            <p className="text-2xl font-mono font-bold text-gray-800 tracking-wider">
                              {family.code}
                            </p>
                          </div>
                          <button
                            onClick={copyFamilyCode}
                            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors border"
                          >
                            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            <span className="text-sm font-medium">
                              {copied ? 'Copied!' : 'Copy'}
                            </span>
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Share this code with family members to invite them
                        </p>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-gray-100 rounded-xl p-1 overflow-x-auto">
                      {[
                        { key: 'members', label: 'Members', icon: Users },
                        { key: 'activity', label: 'Activity', icon: Activity },
                        { key: 'insights', label: 'Insights', icon: BarChart3 },
                        { key: 'sharing', label: 'Sharing', icon: Share },
                        { key: 'settings', label: 'Settings', icon: Settings }
                      ].map(tab => {
                        const Icon = tab.icon
                        return (
                          <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors ${
                              activeTab === tab.key 
                                ? 'bg-white text-purple-600 shadow-sm' 
                                : 'text-gray-600 hover:text-purple-600'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{tab.label}</span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[300px]">
                      {activeTab === 'members' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-800">Family Members</h4>
                            {isOwner && (
                              <p className="text-sm text-gray-600">You can remove members as the owner</p>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            {familyMembers.map(member => (
                              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800 flex items-center gap-2">
                                      {member.name}
                                      {member.id === family.ownerId && (
                                        <Crown className="w-4 h-4 text-yellow-500" />
                                      )}
                                    </p>
                                    <p className="text-sm text-gray-600">{member.email}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    member.role === 'owner' 
                                      ? 'bg-yellow-100 text-yellow-700' 
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {member.role === 'owner' ? 'Owner' : 'Member'}
                                  </span>
                                  
                                  {isOwner && member.id !== currentUser.id && (
                                    <button
                                      onClick={() => removeMember(member.id)}
                                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === 'activity' && (
                        <div>
                          {family && (
                            <FamilyActivityFeed 
                              familyId={family.id}
                              currentUserId={currentUser.id}
                            />
                          )}
                        </div>
                      )}

                      {activeTab === 'insights' && (
                        <div>
                          {family && (
                            <FamilyInsights 
                              familyId={family.id}
                              familyMembers={familyMembers}
                            />
                          )}
                        </div>
                      )}

                      {activeTab === 'sharing' && (
                        <div className="space-y-6">
                          <h4 className="font-semibold text-gray-800">What gets shared with family</h4>
                          
                          <div className="space-y-4">
                            {[
                              { key: 'shareCalendar', label: 'Calendar Events', desc: 'Family members can see events marked as shared', icon: '📅' },
                              { key: 'shareNotes', label: 'Notes & Journal', desc: 'Share personal reflections and thoughts', icon: '📝' },
                              { key: 'shareGoals', label: 'Goals & Progress', desc: 'Let family support your goal achievements', icon: '🎯' }
                            ].map(item => (
                              <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{item.icon}</span>
                                  <div>
                                    <p className="font-medium text-gray-800">{item.label}</p>
                                    <p className="text-sm text-gray-600">{item.desc}</p>
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => updateFamilySettings(item.key as any, !family.settings[item.key as keyof Family['settings']])}
                                  disabled={!isOwner}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                    family.settings[item.key as keyof Family['settings']]
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-200 text-gray-600'
                                  } ${!isOwner && 'opacity-50 cursor-not-allowed'}`}
                                >
                                  {family.settings[item.key as keyof Family['settings']] ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  <span className="text-sm font-medium">
                                    {family.settings[item.key as keyof Family['settings']] ? 'Shared' : 'Private'}
                                  </span>
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          {!isOwner && (
                            <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                              <Shield className="w-4 h-4 inline mr-2" />
                              Only the family owner can change sharing settings
                            </p>
                          )}
                        </div>
                      )}

                      {activeTab === 'settings' && (
                        <div className="space-y-6">
                          <h4 className="font-semibold text-gray-800">Family Settings</h4>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-800">Allow Member Invites</p>
                                <p className="text-sm text-gray-600">Let family members invite others</p>
                              </div>
                              <button
                                onClick={() => updateFamilySettings('allowMemberInvites', !family.settings.allowMemberInvites)}
                                disabled={!isOwner}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  family.settings.allowMemberInvites ? 'bg-purple-600' : 'bg-gray-300'
                                } ${!isOwner && 'opacity-50 cursor-not-allowed'}`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  family.settings.allowMemberInvites ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 pt-6">
                            <h5 className="font-medium text-gray-800 mb-4">Danger Zone</h5>
                            <button
                              onClick={leaveFamily}
                              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                            >
                              <LogOut className="w-4 h-4" />
                              <span className="font-medium">
                                {isOwner ? 'Delete Family' : 'Leave Family'}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
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