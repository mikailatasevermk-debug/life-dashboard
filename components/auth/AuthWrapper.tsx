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
  const [isLoading, setIsLoading] = useState(true)
  
  // Load user from localStorage on mount - client side only
  useEffect(() => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('current_user')
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (error) {
          console.error('Failed to parse saved user:', error)
          localStorage.removeItem('current_user')
        }
      }
      setIsLoading(false)
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

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
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