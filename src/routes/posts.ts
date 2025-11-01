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
  fastify.get('/categories', async (request, reply) => {
    return getCategories(request, reply)
  })

  fastify.get('/posts/stats/views', async (request, reply) => {
    return getPostStats(request, reply, fastify.db)
  })

  fastify.get('/posts', {
    schema: {
      querystring: PostQuerySchema
    }
  }, async (request, reply) => {
    return getAllPosts(request, reply, fastify.db)
  })

  fastify.get('/posts/id/:id', async (request, reply) => {
    return getPostById(request, reply, fastify.db)
  })

  fastify.get('/posts/:slug', async (request, reply) => {
    return getPostBySlug(request, reply, fastify.db)
  })

  fastify.post('/posts', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    return createPost(request, reply, fastify.db)
  })

  fastify.put('/posts/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    return updatePost(request, reply, fastify.db)
  })

  fastify.delete('/posts/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    return deletePost(request, reply, fastify.db)
  })
}

export default postsRoutes