import { prisma } from '@/lib/prisma'

export async function sendConnection(
  senderId: string,
  receiverId: string
) {
  if (senderId === receiverId) throw new Error('SELF_REQUEST')

  const exists = await prisma.connection.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  })

  if (exists) throw new Error('ALREADY_EXISTS')

  return prisma.connection.create({
    data: { senderId, receiverId },
  })
}

export async function acceptConnection(
  userId: string,
  connectionId: string
) {
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  })

  if (!connection || connection.receiverId !== userId) {
    throw new Error('FORBIDDEN')
  }

  return prisma.connection.update({
    where: { id: connectionId },
    data: { status: 'ACCEPTED' },
  })
}

export async function getFriends(userId: string) {
  const connections = await prisma.connection.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: { select: { id: true, email: true, name: true } },
      receiver: { select: { id: true, email: true, name: true } },
    },
  })

  return connections.map(c =>
    c.senderId === userId ? c.receiver : c.sender
  )
}
