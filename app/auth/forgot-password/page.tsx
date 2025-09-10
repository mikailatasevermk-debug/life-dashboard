"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [resetLink, setResetLink] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Try the simple endpoint first (shows link directly)
      const response = await fetch("/api/auth/forgot-password-simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSent(true)
        if (data.resetLink) {
          setResetLink(data.resetLink)
        }
      } else {
        setError(data.error || "Failed to generate reset link")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            {sent ? (
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            ) : (
              <Mail className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            )}
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {sent ? "Check Your Email" : "Forgot Password?"}
            </h1>
            <p className="text-gray-600 mt-2">
              {sent 
                ? "We've sent password reset instructions to your email"
                : "Enter your email and we'll send you reset instructions"
              }
            </p>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                <p className="font-medium">Password Reset Link Generated!</p>
                {resetLink ? (
                  <>
                    <p className="mt-2">Click the link below to reset your password:</p>
                    <div className="mt-3 p-3 bg-white rounded-lg break-all">
                      <a 
                        href={resetLink}
                        className="text-purple-600 hover:underline text-xs"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {resetLink}
                      </a>
                    </div>
                    <p className="mt-3 text-xs">This link expires in 24 hours</p>
                  </>
                ) : (
                  <p>Check your email for password reset instructions.</p>
                )}
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => {
                    setSent(false)
                    setEmail("")
                    setResetLink("")
                  }}
                  className="text-purple-600 hover:underline text-sm font-medium"
                >
                  Try a different email
                </button>
              </div>

              <Link
                href="/auth/signin"
                className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Instructions"}
              </button>

              <Link
                href="/auth/signin"
                className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}