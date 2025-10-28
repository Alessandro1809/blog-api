import { type FastifyRequest, type FastifyReply } from 'fastify'
import { type PrismaClient } from '../generated/prisma/index.js'
import { PostService } from '../services/post.service.js'
import { SearchService } from '../services/search.service.js'
import { ViewTrackingService } from '../services/view-tracking.service.js'
import { enrichPostsWithAuthors, enrichPostWithAuthor } from '../utils/post-enrichment.js'
import { validatePostOwnership, canViewDraft } from '../utils/authorization.js'
import { buildPaginationResponse } from '../utils/pagination.js'
import { CATEGORIES } from '../constants/categories.js'

export const getAllPosts = async (
  request: FastifyRequest,
  reply: FastifyReply,
  prisma: PrismaClient
) => {
  const { status, limit, offset, search, date, categorie } = request.query as any

  const postService = new PostService(prisma)
  const searchService = new SearchService(prisma)

  let posts: any[]
  let total: number

  if (search) {
    const result = await searchService.searchPosts(
      { search, status, categorie, date },
      limit,
      offset
    )
    posts = result.posts
    total = result.total
  } else {
    const result = await postService.findAllPosts(
      { status, categorie, date },
      limit,
      offset
    )
    posts = result.posts
    total = result.total
  }

  const postsWithAuthors = await enrichPostsWithAuthors(posts)
  return buildPaginationResponse(postsWithAuthors, total, limit, offset)
}

export const getPostById = async (
  request: FastifyRequest,
  reply: FastifyReply,
  prisma: PrismaClient
) => {
  const { id } = request.params as { id: string }
  const { skipViewIncrement } = request.query as { skipViewIncrement?: string }

  const postService = new PostService(prisma)
  const viewTrackingService = new ViewTrackingService(prisma)

  const post = await postService.findPostById(id)

  if (!post) {
    return reply.status(404).send({ error: 'Post not found' })
  }

  const isAuthenticated = !!request.headers.authorization
  if (!canViewDraft(post, isAuthenticated)) {
    return reply.status(404).send({ error: 'Post not found' })
  }

  if (post.status === 'PUBLISHED' && skipViewIncrement !== 'true') {
    const clientIp = request.ip || 'unknown'
    const userAgent = request.headers['user-agent'] || null
    await viewTrackingService.trackView(id, clientIp, userAgent)
  }

  return enrichPostWithAuthor(post)
}

export const getPostBySlug = async (
  request: FastifyRequest,
  reply: FastifyReply,
  prisma: PrismaClient
) => {
  const { slug } = request.params as { slug: string }
  const { skipViewIncrement } = request.query as { skipViewIncrement?: string }

  const postService = new PostService(prisma)
  const viewTrackingService = new ViewTrackingService(prisma)

  const post = await postService.findPostBySlug(slug)

  if (!post) {
    return reply.status(404).send({ error: 'Post not found' })
  }

  const isAuthenticated = !!request.headers.authorization
  if (!canViewDraft(post, isAuthenticated)) {
    return reply.status(404).send({ error: 'Post not found' })
  }

  if (post.status === 'PUBLISHED' && skipViewIncrement !== 'true') {
    const clientIp = request.ip || 'unknown'
    const userAgent = request.headers['user-agent'] || null
    await viewTrackingService.trackView(post.id, clientIp, userAgent)
  }

  return enrichPostWithAuthor(post)
}

export const createPost = async (
  request: FastifyRequest,
  reply: FastifyReply,
  prisma: PrismaClient
) => {
  const body = request.body as any
  const authorId = (request as any).user.sub

  const postService = new PostService(prisma)

  const existingPost = await postService.checkSlugExists(body.slug)
  if (existingPost) {
    return reply.status(409).send({ error: 'Slug already exists' })
  }

  const post = await postService.createPost(body, authorId)
  return reply.status(201).send(post)
}

export const updatePost = async (
  request: FastifyRequest,
  reply: FastifyReply,
  prisma: PrismaClient
) => {
  const { id } = request.params as any
  const body = request.body as any
  const userId = (request as any).user.sub

  const postService = new PostService(prisma)

  const validation = await validatePostOwnership(prisma, id, userId, reply)
  if (!validation.valid) return

  const existingPost = validation.post

  if (body.slug && body.slug !== existingPost.slug) {
    const slugExists = await postService.checkSlugExists(body.slug)
    if (slugExists) {
      return reply.status(409).send({ error: 'Slug already exists' })
    }
  }

  const updatedPost = await postService.updatePost(id, body)
  return updatedPost
}

export const deletePost = async (
  request: FastifyRequest,
  reply: FastifyReply,
  prisma: PrismaClient
) => {
  const { id } = request.params as any
  const userId = (request as any).user.sub

  const postService = new PostService(prisma)

  const validation = await validatePostOwnership(prisma, id, userId, reply)
  if (!validation.valid) return

  await postService.deletePost(id)
  return reply.status(204).send()
}

export const getCategories = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  return { categories: CATEGORIES }
}

export const getPostStats = async (
  request: FastifyRequest,
  reply: FastifyReply,
  prisma: PrismaClient
) => {
  const postService = new PostService(prisma)
  return postService.getStats()
}
