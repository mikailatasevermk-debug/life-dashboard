"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Target, Trash2, CheckCircle, Circle, Trophy } from "lucide-react"

interface Goal {
  id: string
  title: string
  description?: string
  category: string
  progress: number
  target: number
  unit?: string
  completed: boolean
  createdAt: Date
  completedAt?: Date
  deadline?: Date
}

interface GoalsManagerProps {
  spaceType: string
  spaceName: string
  onGoalComplete?: (goal: Goal) => void
}

export function GoalsManager({ spaceType, spaceName, onGoalComplete }: GoalsManagerProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    target: 100,
    unit: "items",
    deadline: ""
  })

  useEffect(() => {
    const savedGoals = localStorage.getItem(`goals_${spaceType}`)
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals).map((g: any) => ({
        ...g,
        createdAt: new Date(g.createdAt),
        completedAt: g.completedAt ? new Date(g.completedAt) : undefined,
        deadline: g.deadline ? new Date(g.deadline) : undefined
      })))
    }
  }, [spaceType])

  useEffect(() => {
    localStorage.setItem(`goals_${spaceType}`, JSON.stringify(goals))
  }, [goals, spaceType])

  const addGoal = () => {
    if (!newGoal.title.trim()) return

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: spaceType,
      progress: 0,
      target: newGoal.target,
      unit: newGoal.unit,
      completed: false,
      createdAt: new Date(),
      deadline: newGoal.deadline ? new Date(newGoal.deadline) : undefined
    }

    setGoals([...goals, goal])
    setNewGoal({ title: "", description: "", target: 100, unit: "items", deadline: "" })
    setShowAddGoal(false)
  }

  const updateProgress = (id: string, progress: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === id) {
        const newProgress = Math.min(progress, goal.target)
        const completed = newProgress >= goal.target
        
        if (completed && !goal.completed && onGoalComplete) {
          onGoalComplete(goal)
        }
        
        return {
          ...goal,
          progress: newProgress,
          completed,
          completedAt: completed ? new Date() : undefined
        }
      }
      return goal
    }))
  }

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id))
  }

  const activeGoals = goals.filter(g => !g.completed)
  const completedGoals = goals.filter(g => g.completed)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-1 sm:gap-2">
          <Target className="w-4 h-4 sm:w-5 sm:h-5" />
          Goals & Targets
        </h3>
        <motion.button
          onClick={() => setShowAddGoal(!showAddGoal)}
          className="p-1.5 sm:p-2 bg-white/60 hover:bg-white/80 rounded-lg transition-colors active:scale-95 touch-manipulation"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>
      </div>

      <AnimatePresence>
        {showAddGoal && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 sm:p-4 bg-white/50 rounded-lg space-y-2 sm:space-y-3">
              <input
                type="text"
                placeholder="Goal title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/70 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
              />
              <textarea
                placeholder="Description (optional)"
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/70 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 resize-none text-sm"
                rows={2}
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  placeholder="Target"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 0 })}
                  className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/70 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                  className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/70 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
                />
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/70 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 text-sm"
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm active:scale-95 touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  onClick={addGoal}
                  className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm active:scale-95 touch-manipulation"
                >
                  Add Goal
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs sm:text-sm font-medium text-gray-600">Active Goals</h4>
          {activeGoals.map((goal) => (
            <motion.div
              key={goal.id}
              layout
              className="p-2 sm:p-3 bg-white/50 rounded-lg"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-800 text-sm sm:text-base truncate">{goal.title}</h5>
                  {goal.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{goal.description}</p>
                  )}
                  {goal.deadline && (
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="p-1 hover:bg-red-100 rounded transition-colors active:scale-95 touch-manipulation flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{goal.progress} / {goal.target} {goal.unit}</span>
                  <span>{Math.round((goal.progress / goal.target) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(goal.progress / goal.target) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={goal.progress}
                    onChange={(e) => updateProgress(goal.id, parseInt(e.target.value) || 0)}
                    className="flex-1 px-2 py-1 text-xs sm:text-sm bg-white/70 rounded border border-gray-200 focus:outline-none focus:border-blue-400 min-w-0"
                  />
                  <button
                    onClick={() => updateProgress(goal.id, goal.progress + 1)}
                    className="px-2 py-1 bg-blue-500 text-white text-xs sm:text-sm rounded hover:bg-blue-600 transition-colors active:scale-95 touch-manipulation flex-shrink-0"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => updateProgress(goal.id, goal.progress + 10)}
                    className="px-2 py-1 bg-blue-500 text-white text-xs sm:text-sm rounded hover:bg-blue-600 transition-colors active:scale-95 touch-manipulation flex-shrink-0"
                  >
                    +10
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-1">
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
            Completed Goals
          </h4>
          {completedGoals.map((goal) => (
            <motion.div
              key={goal.id}
              layout
              className="p-2 sm:p-3 bg-green-50/50 rounded-lg opacity-75"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h5 className="font-medium text-gray-700 line-through text-sm sm:text-base truncate">{goal.title}</h5>
                    <p className="text-xs text-gray-500">
                      Completed: {goal.completedAt?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="p-1 hover:bg-red-100 rounded transition-colors active:scale-95 touch-manipulation flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {goals.length === 0 && (
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <Target className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-30" />
          <p className="text-xs sm:text-sm">No goals yet</p>
          <p className="text-xs mt-1">Click + to add your first goal</p>
        </div>
      )}
    </div>
  )
}