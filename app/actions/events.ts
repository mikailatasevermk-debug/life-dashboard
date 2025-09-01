"use server"

import { prisma } from "@/lib/prisma"
import { SpaceType } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function createEvent({
  userId,
  spaceType,
  noteId,
  title,
  description,
  startDate,
  endDate,
  isAllDay,
  sharedWithFamily,
  recurrence,
}: {
  userId: string
  spaceType: SpaceType
  noteId?: string
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  isAllDay?: boolean
  sharedWithFamily?: boolean
  recurrence?: string
}) {
  const event = await prisma.event.create({
    data: {
      userId,
      spaceType,
      noteId,
      title,
      description,
      startDate,
      endDate,
      isAllDay,
      sharedWithFamily,
      recurrence,
    },
  })

  revalidatePath("/schedule")
  revalidatePath(`/space/${spaceType.toLowerCase()}`)
  
  return event
}

export async function updateEvent({
  id,
  title,
  description,
  startDate,
  endDate,
  isAllDay,
  sharedWithFamily,
}: {
  id: string
  title?: string
  description?: string
  startDate?: Date
  endDate?: Date
  isAllDay?: boolean
  sharedWithFamily?: boolean
}) {
  const event = await prisma.event.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(startDate !== undefined && { startDate }),
      ...(endDate !== undefined && { endDate }),
      ...(isAllDay !== undefined && { isAllDay }),
      ...(sharedWithFamily !== undefined && { sharedWithFamily }),
    },
  })

  revalidatePath("/schedule")
  revalidatePath(`/space/${event.spaceType.toLowerCase()}`)
  
  return event
}

export async function deleteEvent(id: string) {
  const event = await prisma.event.delete({
    where: { id },
  })

  revalidatePath("/schedule")
  revalidatePath(`/space/${event.spaceType.toLowerCase()}`)
  
  return event
}

export async function getUpcomingEvents(userId: string, limit = 20) {
  const events = await prisma.event.findMany({
    where: {
      userId,
      startDate: {
        gte: new Date(),
      },
    },
    orderBy: { startDate: "asc" },
    take: limit,
    include: {
      space: true,
      note: true,
    },
  })

  return events
}

export async function getEventsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  const events = await prisma.event.findMany({
    where: {
      userId,
      OR: [
        {
          startDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          endDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      ],
    },
    orderBy: { startDate: "asc" },
    include: {
      space: true,
      note: true,
    },
  })

  return events
}