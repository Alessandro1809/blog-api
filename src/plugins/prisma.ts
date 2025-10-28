import fp from "fastify-plugin"
import {PrismaClient} from "../generated/prisma/index.js"
import { type FastifyPluginAsync } from "fastify"

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient
    }
}

const prismaPlugin: FastifyPluginAsync = async (fastify, opts) => {
    const prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query'] : []
    })

    await prisma.$connect()

    fastify.decorate('prisma', prisma)

    fastify.addHook('onClose', async (fastify) => {
    await fastify.prisma.$disconnect()
  })

  
}
export default fp(prismaPlugin)