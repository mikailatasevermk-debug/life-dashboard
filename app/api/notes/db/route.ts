import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/notes/db - Fetch notes from database
export async function GET(request: NextRequest) {
  try {
    // For now, we'll use a demo user ID
    // Later this will come from the session
    const userId = request.headers.get("x-user-id") || "demo-user"
    
    const searchParams = request.nextUrl.searchParams
    const spaceType = searchParams.get("spaceType")
    
    const notes = await prisma.note.findMany({
      where: {
        userId,
        ...(spaceType && { spaceType })
      },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' }
      ],
      include: {
        tags: true,
        assets: true
      }
    })
    
    return NextResponse.json({ notes })
  } catch (error) {
    console.error("Database read error:", error)
    // Return empty array on error (fallback to localStorage)
    return NextResponse.json({ notes: [], error: "Database unavailable" }, { status: 200 })
  }
}

// POST /api/notes/db - Create note in database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = request.headers.get("x-user-id") || "demo-user"
    
    const note = await prisma.note.create({
      data: {
        userId,
        spaceType: body.spaceType,
        title: body.title,
        content: body.content || {},
        isPinned: body.isPinned || false
      },
      include: {
        tags: true,
        assets: true
      }
    })
    
    return NextResponse.json({ note })
  } catch (error) {
    console.error("Database write error:", error)
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}

// PUT /api/notes/db - Update note in database
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    const note = await prisma.note.update({
      where: { id },
      data: updateData,
      include: {
        tags: true,
        assets: true
      }
    })
    
    return NextResponse.json({ note })
  } catch (error) {
    console.error("Database update error:", error)
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
}

// DELETE /api/notes/db - Delete note from database
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 })
    }
    
    await prisma.note.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database delete error:", error)
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
  }
}