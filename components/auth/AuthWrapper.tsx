"use client"

import { useState, useEffect } from "react"
import { AuthPortal } from "./AuthPortal"
import { FamilyManager } from "../family/FamilyManager"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  familyId?: string
  role: 'owner' | 'member'
  createdAt: string
}

interface AuthWrapperProps {
  children: (user: User, showFamilyManager: () => void, logout: () => void) => React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null)
  const [showFamily, setShowFamily] = useState(false)
  
  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('current_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Failed to parse saved user:', error)
        localStorage.removeItem('current_user')
      }
    }
  }, [])

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('current_user', JSON.stringify(updatedUser))
  }

  const showFamilyManager = () => {
    setShowFamily(true)
  }

  const logout = () => {
    localStorage.removeItem('current_user')
    setUser(null)
    setShowFamily(false)
  }

  if (!user) {
    return <AuthPortal onAuthenticated={setUser} />
  }

  return (
    <>
      {children(user, showFamilyManager, logout)}
      
      <FamilyManager
        currentUser={user}
        isOpen={showFamily}
        onClose={() => setShowFamily(false)}
        onUserUpdate={handleUserUpdate}
      />
    </>
  )
}