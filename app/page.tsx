"use client"

import { AuthWrapper } from "@/components/auth/AuthWrapper"

export default function HomePage() {
  return (
    <AuthWrapper>
      {(user, showFamilyManager, logout) => {
        // User is authenticated, redirect to dashboard
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard'
        }
        return null
      }}
    </AuthWrapper>
  )
}

