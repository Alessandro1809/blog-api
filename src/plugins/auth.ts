import fp from 'fastify-plugin'
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { clerkClient, verifyToken } from '@clerk/clerk-sdk-node'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: { sub: string; [key: string]: any }
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No token provided')
      }

      const token = authHeader.substring(7)

      const secretKey = process.env.CLERK_SECRET_KEY
      if (!secretKey) {
        throw new Error('CLERK_SECRET_KEY not configured')
      }

      const payload = await verifyToken(token, {
        secretKey,
      })

      request.user = payload as { sub: string; [key: string]: any }

      const user = await clerkClient.users.getUser(payload.sub)
      if (!user) {
        throw new Error('User not found')
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      reply.status(401).send({ error: 'Unauthorized', message: err.message })
    }
  })
}

export default fp(authPlugin)