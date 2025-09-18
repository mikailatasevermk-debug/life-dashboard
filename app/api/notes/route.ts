import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { initializeSpaces } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { SpaceType } from "@prisma/client"

async function getOrCreateUserId() {
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    return session.user.id
  }

  if (process.env.DEMO_MODE === "true") {
    const email = process.env.DEMO_USER_EMAIL || "demo@example.com"
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: "Demo User" },
    })
    return user.id
  }

  // No session and no demo; reject
  return null
}

export async function GET(request: NextRequest) {
  try {
    // In demo mode, skip database operations
    if (process.env.DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      return NextResponse.json([])
    }
    
    await initializeSpaces()
    const userId = await getOrCreateUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const searchParams = request.nextUrl.searchParams
    const spaceType = searchParams.get("spaceType") as keyof typeof SpaceType | null

    const notes = await prisma.note.findMany({
      where: {
        userId,
        ...(spaceType ? { spaceType: spaceType as SpaceType } : {}),
      },
      orderBy: [
        { isPinned: "desc" },
        { updatedAt: "desc" },
      ],
      include: {
        assets: true,
        tags: true,
      },
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // In demo mode, skip database operations  
    if (process.env.DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      const body = await request.json()
      return NextResponse.json({
        success: true,
        message: 'Note saved to localStorage (demo mode)',
        note: {
          id: Date.now().toString(),
          ...body,
          createdAt: new Date().toISOString()
        }
      })
    }
    
    await initializeSpaces()
    const userId = await getOrCreateUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { spaceType, title, content } = body as {
      spaceType: keyof typeof SpaceType
      title?: string
      content?: any
    }

    if (!spaceType) {
      return NextResponse.json({ error: "spaceType is required" }, { status: 400 })
    }

    const note = await prisma.note.create({
      data: {
        userId,
        spaceType: spaceType as SpaceType,
        title,
        content: content ?? {},
      },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getOrCreateUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { id, title, content, isPinned } = body as {
      id: string
      title?: string
      content?: any
      isPinned?: boolean
    }

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })

    // Ensure note belongs to user
    const existing = await prisma.note.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    const note = await prisma.note.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(isPinned !== undefined && { isPinned }),
      },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getOrCreateUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 })
    }

    const existing = await prisma.note.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    await prisma.note.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
  }
}
