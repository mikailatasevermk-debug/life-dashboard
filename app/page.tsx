"use client"

import { useEffect } from "react"
import { AuthWrapper } from "@/components/auth/AuthWrapper"

export default function HomePage() {
  useEffect(() => {
    // Check if user is authenticated
    const savedUser = localStorage.getItem('current_user')
    if (savedUser) {
      // Redirect to authenticated dashboard
      window.location.href = '/dashboard'
    }
  }, [])

  return (
    <AuthWrapper>
      {(user, showFamilyManager, logout) => {
        // This will automatically redirect to /dashboard if user is authenticated
        // The AuthPortal will be shown if no user is found
        return null
      }}
    </AuthWrapper>
  )
}

