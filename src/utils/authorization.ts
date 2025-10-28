import { type FastifyReply } from 'fastify'
import { type PrismaClient } from '../generated/prisma/index.js'

export async function validatePostOwnership(
  prisma: PrismaClient,
  postId: string,
  userId: string,
  reply: FastifyReply
): Promise<{ valid: boolean; post?: any }> {
  const post = await prisma.post.findUnique({
    where: { id: postId }
  })

  if (!post) {
    reply.status(404).send({ error: 'Post not found' })
    return { valid: false }
  }

  if (post.authorId !== userId) {
    reply.status(403).send({ error: 'Forbidden' })
    return { valid: false }
  }

  return { valid: true, post }
}

export function canViewDraft(post: any, isAuthenticated: boolean): boolean {
  if (post.status === 'DRAFT' && !isAuthenticated) {
    return false
  }
  return true
}
