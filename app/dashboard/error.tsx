'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to console for debugging
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-2">There was an error loading the dashboard.</p>
        <details className="text-left mb-6 p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">Error details</summary>
          <pre className="mt-2 text-xs text-red-600 overflow-auto">
            {error.message}
            {error.stack && '\n\nStack trace:\n' + error.stack}
          </pre>
        </details>
        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Try again
          </button>
          <button
            onClick={() => router.push('/auth/signin')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    </div>
  )
}