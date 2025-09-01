"use server"

import { prisma } from "@/lib/prisma"
import { SpaceType } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function createNote({
  userId,
  spaceType,
  title,
  content,
}: {
  userId: string
  spaceType: SpaceType
  title?: string
  content: any
}) {
  const note = await prisma.note.create({
    data: {
      userId,
      spaceType,
      title,
      content,
    },
  })

  revalidatePath("/")
  revalidatePath(`/space/${spaceType.toLowerCase()}`)
  
  return note
}

export async function updateNote({
  id,
  title,
  content,
  isPinned,
}: {
  id: string
  title?: string
  content?: any
  isPinned?: boolean
}) {
  const note = await prisma.note.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(isPinned !== undefined && { isPinned }),
    },
  })

  revalidatePath("/")
  revalidatePath(`/space/${note.spaceType.toLowerCase()}`)
  
  return note
}

export async function deleteNote(id: string) {
  const note = await prisma.note.delete({
    where: { id },
  })

  revalidatePath("/")
  revalidatePath(`/space/${note.spaceType.toLowerCase()}`)
  
  return note
}

export async function getNotesBySpace(userId: string, spaceType: SpaceType) {
  const notes = await prisma.note.findMany({
    where: {
      userId,
      spaceType,
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

  return notes
}

export async function getRecentNotes(userId: string, limit = 10) {
  const notes = await prisma.note.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      space: true,
    },
  })

  return notes
}