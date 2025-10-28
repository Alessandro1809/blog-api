import Fastify from 'fastify';
import cors from '@fastify/cors';
import 'dotenv/config';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';

import authPlugin from './plugins/auth.js';
import drizzlePlugin from './plugins/drizzle.js';
import postsRoutes from './routes/posts.js';

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
}).withTypeProvider<ZodTypeProvider>();

// Configurar validadores de Zod
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

async function start() {
  try {
    // Registrar CORS
    await fastify.register(cors, {
  origin: process.env.NODE_ENV === 'production' 
    ? ['*'] 
    : true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // ← Agregar esto
  allowedHeaders: ['Content-Type', 'Authorization'],
})
    // Registrar plugins
    await fastify.register(drizzlePlugin)
    await fastify.register(authPlugin)

    // Registrar rutas
    await fastify.register(postsRoutes, { prefix: '/api/v1' })

    // Health check
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() }
    })

    // Iniciar servidor
    const port = Number(process.env.PORT) || 51214
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'

    await fastify.listen({ port, host })
    fastify.log.info(`🚀 Server running on http://${host}:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()