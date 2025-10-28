// src/routes/posts.ts
import { type FastifyPluginAsync } from 'fastify'
import {
  getAllPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getCategories,
  getPostStats
} from '../controllers/posts.controller.js'
import { PostQuerySchema } from '../types/index.js'

const postsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /categories - Obtener categorías disponibles (público)
  fastify.get('/categories', async (request, reply) => {
    return getCategories(request, reply)
  })

  // GET /posts/stats/views - Obtener estadísticas de posts (público)
  fastify.get('/posts/stats/views', async (request, reply) => {
    return getPostStats(request, reply, fastify.db)
  })

  // GET /posts - Listar posts (público)
  fastify.get('/posts', {
    schema: {
      querystring: PostQuerySchema
    }
  }, async (request, reply) => {
    return getAllPosts(request, reply, fastify.db)
  })

  // GET /posts/id/:id - Obtener post por ID (público)
  fastify.get('/posts/id/:id', async (request, reply) => {
    return getPostById(request, reply, fastify.db)
  })

  // GET /posts/:slug - Obtener post por slug (público)
  fastify.get('/posts/:slug', async (request, reply) => {
    return getPostBySlug(request, reply, fastify.db)
  })

  // POST /posts - Crear post (protegido)
  fastify.post('/posts', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    return createPost(request, reply, fastify.db)
  })

  // PUT /posts/:id - Actualizar post (protegido)
  fastify.put('/posts/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    return updatePost(request, reply, fastify.db)
  })

  // DELETE /posts/:id - Eliminar post (protegido)
  fastify.delete('/posts/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    return deletePost(request, reply, fastify.db)
  })
}

export default postsRoutes