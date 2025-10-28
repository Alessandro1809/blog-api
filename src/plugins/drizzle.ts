import fp from 'fastify-plugin'
import { type FastifyPluginAsync } from 'fastify'
import { db, type Database } from '../db/index.js'

declare module 'fastify' {
  interface FastifyInstance {
    db: Database
  }
}

const drizzlePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('db', db)

  fastify.addHook('onClose', async () => {
    await db.$client.close()
  })
}

export default fp(drizzlePlugin)
