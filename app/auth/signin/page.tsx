"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function SignInPage() {
  const [email, setEmail] = useState("")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Sign in</h1>
        <p className="text-sm text-gray-600 mb-6">Choose a method to continue</p>

        <div className="space-y-3">
          <button
            onClick={() => signIn("google")}
            className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black/90"
          >
            Continue with Google
          </button>

          <div className="flex items-center gap-2">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-400">or</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <div className="flex gap-2">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <button
              onClick={() => signIn("email", { email })}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
            >
              Email link
            </button>
          </div>

          {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
            <button
              onClick={() => window.location.assign("/")}
              className="w-full px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600"
            >
              Continue as Demo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

