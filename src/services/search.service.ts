import { type PrismaClient } from '../generated/prisma/index.js'

interface SearchFilters {
  search?: string
  status?: string
  categorie?: string
  date?: string
}

interface SearchResult {
  posts: any[]
  total: number
}

export class SearchService {
  constructor(private prisma: PrismaClient) {}

  async searchPosts(
    filters: SearchFilters,
    limit: number,
    offset: number
  ): Promise<SearchResult> {
    const { search, status, categorie, date } = filters
    const searchPattern = `%${search}%`
    
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    conditions.push(`(
      LOWER(title) LIKE LOWER($${paramIndex}) OR
      LOWER(excerpt) LIKE LOWER($${paramIndex}) OR
      LOWER(categorie) LIKE LOWER($${paramIndex}) OR
      $${paramIndex + 1} = ANY(tags) OR
      LOWER(content::text) LIKE LOWER($${paramIndex})
    )`)
    params.push(searchPattern, search)
    paramIndex += 2

    if (status) {
      conditions.push(`status = $${paramIndex}::text::"PostStatus"`)
      params.push(status)
      paramIndex++
    }

    if (categorie) {
      conditions.push(`categorie = $${paramIndex}::text::"PostCategory"`)
      params.push(categorie)
      paramIndex++
    }

    if (date) {
      conditions.push(`"createdAt" >= $${paramIndex}::timestamp`)
      params.push(new Date(date).toISOString())
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const posts: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT 
        id, title, slug, categorie, tags, content, excerpt, 
        status, "featuredImage", "createdAt", "updatedAt", "authorId"
      FROM posts
      ${whereClause}
      ORDER BY "createdAt" DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, ...params, limit, offset)

    const totalResult: any = await this.prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count
      FROM posts
      ${whereClause}
    `, ...params.slice(0, params.length))

    const total = Number(totalResult[0]?.count || 0)

    return { posts, total }
  }
}
