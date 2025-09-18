import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Initialize spaces if they don't exist
export async function initializeSpaces() {
  // In demo mode, skip database initialization
  if (process.env.DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    console.log("Demo mode enabled, skipping database initialization")
    return
  }

  const spaces = [
    {
      type: "PROJECTS",
      name: "Projects / Business",
      color: "#E63946",
      icon: "briefcase",
      description: "Your creative ventures and business ideas",
      order: 1,
    },
    {
      type: "FAMILY",
      name: "Family",
      color: "#06D6A0",
      icon: "users", 
      description: "Memories and moments with loved ones",
      order: 2,
    },
    {
      type: "HOME",
      name: "Home / Dreams",
      color: "#118AB2",
      icon: "home",
      description: "Your sanctuary and future aspirations",
      order: 3,
    },
    {
      type: "LOVE",
      name: "Love with Wife",
      color: "#FF8FA3",
      icon: "heart",
      description: "Cherished moments and expressions of love",
      order: 4,
    },
    {
      type: "BUYING",
      name: "Conscious Buying",
      color: "#FFD166",
      icon: "shopping-bag",
      description: "Mindful purchases and financial decisions",
      order: 5,
    },
    {
      type: "CAREER",
      name: "Work / Career",
      color: "#5F6C7B",
      icon: "building-2",
      description: "Professional growth and achievements",
      order: 6,
    },
    {
      type: "FAITH",
      name: "Religion / Faith",
      color: "#6A4C93",
      icon: "church",
      description: "Spiritual journey and reflections",
      order: 7,
    },
  ]

  try {
    for (const space of spaces) {
      await prisma.space.upsert({
        where: { type: space.type as any },
        update: {},
        create: space as any,
      })
    }
    console.log("Spaces initialized successfully")
  } catch (error) {
    console.error("Error initializing spaces:", error)
    console.log("Continuing without database initialization...")
  }
}