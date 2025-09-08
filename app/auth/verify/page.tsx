"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "invalid">("loading")
  const [message, setMessage] = useState("")
  
  useEffect(() => {
    if (!token) {
      setStatus("invalid")
      setMessage("No verification token provided")
      return
    }
    
    verifyEmail(token)
  }, [token])
  
  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationToken }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "Email verified successfully!")
        
        // Redirect to signin after 3 seconds
        setTimeout(() => {
          router.push("/auth/signin?verified=true")
        }, 3000)
      } else {
        setStatus("error")
        setMessage(data.error || "Verification failed")
      }
    } catch (error) {
      setStatus("error")
      setMessage("An error occurred during verification")
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
          <div className="text-center">
            {status === "loading" && (
              <>
                <div className="mb-6">
                  <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Verifying Your Email
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your email address...
                </p>
              </>
            )}
            
            {status === "success" && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="mb-6"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Email Verified!
                </h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <p className="text-sm text-gray-500">
                  Redirecting to sign in...
                </p>
              </>
            )}
            
            {status === "error" && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="mb-6"
                >
                  <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="space-y-3">
                  <Link
                    href="/auth/signin"
                    className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
                  >
                    Go to Sign In
                  </Link>
                  <Link
                    href="/auth/resend-verification"
                    className="block w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                  >
                    Resend Verification Email
                  </Link>
                </div>
              </>
            )}
            
            {status === "invalid" && (
              <>
                <div className="mb-6">
                  <Mail className="w-16 h-16 text-gray-400 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Invalid Link
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <Link
                  href="/auth/signin"
                  className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
                >
                  Go to Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}