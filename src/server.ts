import Fastify from 'fastify';
import cors from '@fastify/cors';
import 'dotenv/config';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';

import authPlugin from './plugins/auth.js';
import drizzlePlugin from './plugins/drizzle.js';
import postsRoutes from './routes/posts.js';

export function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'test' ? 'silent' : (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
    }
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  return app;
}

export async function registerPlugins(app: any) {
  await app.register(cors, {
    origin: process.env.NODE_ENV === 'production'
      ? ['cms-only-test.vercel.app', 'http://localhost:4321']
      : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  await app.register(drizzlePlugin);
  await app.register(authPlugin);
  await app.register(postsRoutes, { prefix: '/api/v1' });

  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return app;
}

async function start() {
  const app = buildApp();
  await registerPlugins(app);

  try {
    const port = Number(process.env.PORT) || 51214;
    const host = '0.0.0.0';

    await app.listen({ port, host });
    app.log.info(`🚀 Server running on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}
