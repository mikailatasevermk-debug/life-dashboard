"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, Mail, Lock, Eye, EyeOff, UserPlus, LogIn, 
  Users, Shield, Heart, Home, Sparkles, ArrowRight
} from "lucide-react"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  familyId?: string
  role: 'owner' | 'member'
  createdAt: string
}

interface AuthPortalProps {
  onAuthenticated: (user: User) => void
}

export function AuthPortal({ onAuthenticated }: AuthPortalProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register' | 'family'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    familyCode: ''
  })

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('current_user')
    if (savedUser) {
      onAuthenticated(JSON.parse(savedUser))
      router.push('/dashboard')
    }
  }, [onAuthenticated, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate login process
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('app_users') || '[]')
      const user = users.find((u: User) => u.email === formData.email)
      
      if (user) {
        localStorage.setItem('current_user', JSON.stringify(user))
        onAuthenticated(user)
        router.push('/dashboard')
      } else {
        alert('User not found. Please register first.')
      }
      setLoading(false)
    }, 1000)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate registration process
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('app_users') || '[]')
      
      // Check if email already exists
      if (users.some((u: User) => u.email === formData.email)) {
        alert('Email already registered. Please login instead.')
        setLoading(false)
        return
      }

      const newUser: User = {
        id: Date.now().toString(),
        email: formData.email,
        name: formData.name,
        role: 'owner',
        createdAt: new Date().toISOString()
      }

      users.push(newUser)
      localStorage.setItem('app_users', JSON.stringify(users))
      localStorage.setItem('current_user', JSON.stringify(newUser))
      
      onAuthenticated(newUser)
      router.push('/dashboard')
      setLoading(false)
    }, 1000)
  }

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate joining family
    setTimeout(() => {
      const families = JSON.parse(localStorage.getItem('app_families') || '[]')
      const family = families.find((f: any) => f.code === formData.familyCode)
      
      if (family) {
        const newUser: User = {
          id: Date.now().toString(),
          email: formData.email,
          name: formData.name,
          familyId: family.id,
          role: 'member',
          createdAt: new Date().toISOString()
        }

        const users = JSON.parse(localStorage.getItem('app_users') || '[]')
        users.push(newUser)
        localStorage.setItem('app_users', JSON.stringify(users))
        localStorage.setItem('current_user', JSON.stringify(newUser))
        
        // Add user to family
        family.members.push(newUser.id)
        localStorage.setItem('app_families', JSON.stringify(families))
        
        onAuthenticated(newUser)
        router.push('/dashboard')
      } else {
        alert('Invalid family code. Please check and try again.')
      }
      setLoading(false)
    }, 1000)
  }

  const createDemoAccount = () => {
    const demoUser: User = {
      id: 'demo-user',
      email: 'demo@lifedashboard.com',
      name: 'Demo User',
      role: 'owner',
      createdAt: new Date().toISOString()
    }
    
    localStorage.setItem('current_user', JSON.stringify(demoUser))
    onAuthenticated(demoUser)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-white/90 rounded-2xl shadow-lg">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Life Dashboard
            </h1>
          </div>
          <p className="text-gray-600">
            {mode === 'login' && 'Welcome back! Sign in to your personal dashboard'}
            {mode === 'register' && 'Create your personal life tracking account'}
            {mode === 'family' && 'Join your family dashboard with a family code'}
          </p>
        </motion.div>

        {/* Mode Tabs */}
        <div className="flex bg-white/60 backdrop-blur-sm rounded-2xl p-1 mb-6">
          {[
            { key: 'login', label: 'Sign In', icon: LogIn },
            { key: 'register', label: 'Register', icon: UserPlus },
            { key: 'family', label: 'Join Family', icon: Users }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setMode(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-colors ${
                  mode === tab.key 
                    ? 'bg-white text-purple-600 shadow-md' 
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Form Card */}
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6"
        >
          <form onSubmit={
            mode === 'login' ? handleLogin : 
            mode === 'register' ? handleRegister : 
            handleJoinFamily
          }>
            <div className="space-y-4">
              {/* Name Field (Register & Family) */}
              {(mode === 'register' || mode === 'family') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 bg-white/70"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 bg-white/70"
                    required
                  />
                </div>
              </div>

              {/* Password Field (Login & Register) */}
              {(mode === 'login' || mode === 'register') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 bg-white/70"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Family Code Field */}
              {mode === 'family' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Family Code
                  </label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.familyCode}
                      onChange={(e) => setFormData({ ...formData, familyCode: e.target.value.toUpperCase() })}
                      placeholder="Enter 6-digit family code"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 bg-white/70 font-mono text-center text-lg tracking-wider"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Ask a family member for the 6-digit family code
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                } flex items-center justify-center gap-2`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' && <LogIn className="w-5 h-5" />}
                    {mode === 'register' && <UserPlus className="w-5 h-5" />}
                    {mode === 'family' && <Users className="w-5 h-5" />}
                    <span>
                      {mode === 'login' && 'Sign In'}
                      {mode === 'register' && 'Create Account'}
                      {mode === 'family' && 'Join Family'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Demo Access */}
          <button
            onClick={createDemoAccount}
            className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Home className="w-5 h-5" />
            <span>Try Demo Mode</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            {mode === 'login' && (
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button 
                  onClick={() => setMode('register')}
                  className="text-purple-600 hover:underline font-medium"
                >
                  Create one
                </button>
              </p>
            )}
            {(mode === 'register' || mode === 'family') && (
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button 
                  onClick={() => setMode('login')}
                  className="text-purple-600 hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </motion.div>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>Your data is stored locally and privately</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}