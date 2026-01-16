import { prisma } from '@/lib/prisma'

export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
) {
  const isFriend = await prisma.connection.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  })

  if (!isFriend) throw new Error('NOT_FRIENDS')

  return prisma.message.create({
    data: { senderId, receiverId, content },
  })
}

export async function fetchMessages(
  userId: string,
  friendId: string
) {
  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
  })
}
