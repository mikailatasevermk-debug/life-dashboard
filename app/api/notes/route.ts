import { NextRequest, NextResponse } from "next/server"

// Mock data store for now
let mockNotes: any[] = []

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const spaceType = searchParams.get("spaceType")
    const userId = searchParams.get("userId") || "default-user"

    let filteredNotes = mockNotes.filter(note => {
      if (spaceType && note.spaceType !== spaceType) return false
      if (note.userId !== userId) return false
      return true
    })

    // Sort by pinned first, then by created date
    filteredNotes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return NextResponse.json(filteredNotes)
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId = "default-user", spaceType, title, content } = body

    const note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      spaceType,
      title,
      content: content || {},
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assets: [],
      tags: []
    }

    mockNotes.push(note)
    return NextResponse.json(note)
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, content, isPinned } = body

    const noteIndex = mockNotes.findIndex(note => note.id === id)
    if (noteIndex === -1) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    const note = mockNotes[noteIndex]
    if (title !== undefined) note.title = title
    if (content !== undefined) note.content = content
    if (isPinned !== undefined) note.isPinned = isPinned
    note.updatedAt = new Date().toISOString()

    return NextResponse.json(note)
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 })
    }

    const noteIndex = mockNotes.findIndex(note => note.id === id)
    if (noteIndex === -1) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    mockNotes.splice(noteIndex, 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
  }
}