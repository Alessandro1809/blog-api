import { type FastifyReply } from 'fastify'
import { eq } from 'drizzle-orm'
import { type Database } from '../db/index.js'
import { posts } from '../db/schema.js'

export async function validatePostOwnership(
  db: Database,
  postId: string,
  userId: string,
  reply: FastifyReply
): Promise<{ valid: boolean; post?: any }> {
  const result = await db.select().from(posts).where(eq(posts.id, postId)).limit(1)
  const post = result[0]

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
