import { type PrismaClient } from '../generated/prisma/index.js'
import { CATEGORY_LABEL_TO_ENUM } from '../constants/categories.js'

interface PostFilters {
  status?: string
  categorie?: string
  date?: string
}

interface CreatePostData {
  [key: string]: any
}

export class PostService {
  constructor(private prisma: PrismaClient) {}

  async findAllPosts(filters: PostFilters, limit: number, offset: number) {
    const where: any = {}

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.categorie) {
      where.categorie = filters.categorie
    }

    if (filters.date) {
      where.createdAt = {
        gte: new Date(filters.date)
      }
    }

    const posts = await this.prisma.post.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        categorie: true,
        tags: true,
        content: true,
        excerpt: true,
        status: true,
        featuredImage: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        authorId: true
      }
    })

    const total = await this.prisma.post.count({ where })

    return { posts, total }
  }

  async findPostById(id: string) {
    return this.prisma.post.findUnique({
      where: { id }
    })
  }

  async findPostBySlug(slug: string) {
    return this.prisma.post.findUnique({
      where: { slug }
    })
  }

  async createPost(data: CreatePostData, authorId: string) {
    if (data.categorie && CATEGORY_LABEL_TO_ENUM[data.categorie]) {
      data.categorie = CATEGORY_LABEL_TO_ENUM[data.categorie]
    }

    return this.prisma.post.create({
      data: {
        ...data,
        authorId
      } as any
    })
  }

  async updatePost(id: string, data: CreatePostData) {
    if (data.categorie && CATEGORY_LABEL_TO_ENUM[data.categorie]) {
      data.categorie = CATEGORY_LABEL_TO_ENUM[data.categorie]
    }

    return this.prisma.post.update({
      where: { id },
      data
    })
  }

  async deletePost(id: string) {
    return this.prisma.post.delete({
      where: { id }
    })
  }

  async checkSlugExists(slug: string) {
    return this.prisma.post.findUnique({
      where: { slug }
    })
  }

  async getStats() {
    const [totalPosts, publishedPosts, draftPosts, viewsAggregate, postsByCategory] = await Promise.all([
      this.prisma.post.count(),
      this.prisma.post.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.post.count({ where: { status: 'DRAFT' } }),
      this.prisma.post.aggregate({
        _sum: {
          views: true
        }
      }),
      this.prisma.post.groupBy({
        by: ['categorie'],
        _count: true
      })
    ])

    return {
      total: totalPosts,
      published: publishedPosts,
      drafts: draftPosts,
      totalViews: viewsAggregate._sum.views || 0,
      byCategory: postsByCategory.map(item => ({
        category: item.categorie,
        count: item._count
      }))
    }
  }
}
