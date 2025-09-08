import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user with progress
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        progress: true,
        achievements: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create progress if it doesn't exist
    let progress = user.progress
    if (!progress) {
      progress = await prisma.userProgress.create({
        data: {
          userId: user.id,
          coins: 0,
          level: 1,
          xp: 0,
          totalActions: 0,
          dailyStreak: 0
        }
      })
    }

    // Check for daily login bonus
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const lastLogin = new Date(progress.lastLoginDate)
    lastLogin.setHours(0, 0, 0, 0)

    let dailyBonus = false
    if (today.getTime() > lastLogin.getTime()) {
      // Award daily login bonus
      progress = await prisma.userProgress.update({
        where: { id: progress.id },
        data: {
          coins: progress.coins + 20,
          xp: progress.xp + 20,
          lastLoginDate: new Date(),
          dailyStreak: progress.dailyStreak + 1,
          lastActivity: new Date()
        }
      })
      dailyBonus = true
    }

    return NextResponse.json({
      progress,
      achievements: user.achievements,
      dailyBonus
    })
  } catch (error) {
    console.error("Error fetching user progress:", error)
    return NextResponse.json(
      { error: "Failed to fetch user progress" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { action, amount } = body

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { progress: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Ensure progress exists
    let progress = user.progress
    if (!progress) {
      progress = await prisma.userProgress.create({
        data: {
          userId: user.id,
          coins: 0,
          level: 1,
          xp: 0,
          totalActions: 0,
          dailyStreak: 0
        }
      })
    }

    // Calculate rewards based on action
    const COIN_REWARDS: Record<string, number> = {
      CREATE_NOTE: 10,
      COMPLETE_TASK: 15,
      ADD_EVENT: 5,
      DAILY_LOGIN: 20,
      WEEKLY_STREAK: 50,
      MOOD_TRACK: 3,
      SPACE_VISIT: 2
    }

    const coinReward = amount || COIN_REWARDS[action] || 0
    const newCoins = progress.coins + coinReward
    const newXP = progress.xp + coinReward
    const newLevel = Math.floor(newXP / 100) + 1

    // Update progress
    const updatedProgress = await prisma.userProgress.update({
      where: { id: progress.id },
      data: {
        coins: newCoins,
        xp: newXP,
        level: newLevel,
        totalActions: progress.totalActions + 1,
        lastActivity: new Date()
      }
    })

    // Check for achievements
    const achievements = []

    // First note achievement
    if (action === "CREATE_NOTE" && progress.totalActions === 0) {
      const achievement = await prisma.achievement.upsert({
        where: {
          userId_code: {
            userId: user.id,
            code: "first_note"
          }
        },
        update: {},
        create: {
          userId: user.id,
          code: "first_note",
          name: "First Step",
          description: "Created your first note",
          icon: "📝"
        }
      })
      achievements.push(achievement)
    }

    // Level achievements
    if (newLevel >= 5 && progress.level < 5) {
      const achievement = await prisma.achievement.upsert({
        where: {
          userId_code: {
            userId: user.id,
            code: "level_5"
          }
        },
        update: {},
        create: {
          userId: user.id,
          code: "level_5",
          name: "Rising Star",
          description: "Reached level 5",
          icon: "⭐"
        }
      })
      achievements.push(achievement)
    }

    if (newLevel >= 10 && progress.level < 10) {
      const achievement = await prisma.achievement.upsert({
        where: {
          userId_code: {
            userId: user.id,
            code: "level_10"
          }
        },
        update: {},
        create: {
          userId: user.id,
          code: "level_10",
          name: "Dedicated",
          description: "Reached level 10",
          icon: "🏆"
        }
      })
      achievements.push(achievement)
    }

    // Coin achievement
    if (newCoins >= 100 && progress.coins < 100) {
      const achievement = await prisma.achievement.upsert({
        where: {
          userId_code: {
            userId: user.id,
            code: "100_coins"
          }
        },
        update: {},
        create: {
          userId: user.id,
          code: "100_coins",
          name: "Coin Collector",
          description: "Earned 100 coins",
          icon: "💰"
        }
      })
      achievements.push(achievement)
    }

    return NextResponse.json({
      progress: updatedProgress,
      newAchievements: achievements,
      coinReward
    })
  } catch (error) {
    console.error("Error updating user progress:", error)
    return NextResponse.json(
      { error: "Failed to update user progress" },
      { status: 500 }
    )
  }
}