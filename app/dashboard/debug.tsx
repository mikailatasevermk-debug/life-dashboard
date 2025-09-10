"use client"

import { useState, useEffect } from "react"

interface DebugProps {
  user: {
    id?: string
    email?: string | null
    name?: string | null
    image?: string | null
  }
}

export default function DebugDashboard({ user }: DebugProps) {
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progressData, setProgressData] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    
    // Test API call
    fetch('/api/user/progress')
      .then(res => res.json())
      .then(data => {
        console.log('Progress data:', data)
        setProgressData(data)
      })
      .catch(err => {
        console.error('Progress error:', err)
        setError(err.message)
      })
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Dashboard</h1>
        
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Info</h2>
          <pre className="text-sm bg-gray-100 p-4 rounded">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Progress API</h2>
          {error ? (
            <div className="text-red-600">Error: {error}</div>
          ) : progressData ? (
            <pre className="text-sm bg-gray-100 p-4 rounded">
              {JSON.stringify(progressData, null, 2)}
            </pre>
          ) : (
            <div>Loading progress...</div>
          )}
        </div>

        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">System Check</h2>
          <ul className="space-y-2">
            <li>✅ Component mounted</li>
            <li>✅ User data received</li>
            <li>{progressData ? '✅' : '❌'} Progress API working</li>
            <li>{error ? '❌' : '✅'} No API errors</li>
          </ul>
        </div>
      </div>
    </div>
  )
}