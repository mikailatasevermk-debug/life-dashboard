"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function uploadAsset({
  noteId,
  type,
  url,
  metadata,
}: {
  noteId: string
  type: "image" | "audio" | "sketch"
  url: string
  metadata?: any
}) {
  const asset = await prisma.asset.create({
    data: {
      noteId,
      type,
      url,
      metadata,
    },
  })

  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { spaceType: true },
  })

  if (note) {
    revalidatePath(`/space/${note.spaceType.toLowerCase()}`)
  }
  
  return asset
}

export async function deleteAsset(id: string) {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      note: {
        select: { spaceType: true },
      },
    },
  })

  if (asset) {
    await prisma.asset.delete({
      where: { id },
    })

    revalidatePath(`/space/${asset.note.spaceType.toLowerCase()}`)
  }
  
  return asset
}