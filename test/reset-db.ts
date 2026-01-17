import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function resetDatabase() {
  await prisma.message.deleteMany()
  await prisma.connection.deleteMany()
  await prisma.user.deleteMany()
}
