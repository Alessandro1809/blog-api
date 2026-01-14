import { sql } from 'drizzle-orm'
import { type Database } from '../db/index.js'
import { safeJsonParse } from '../utils/json-parser.js'

interface SearchFilters {
  search?: string
  status?: string
  categorie?: string
  date?: string
  featured?: boolean
}

interface SearchResult {
  posts: any[]
  total: number
}

export class SearchService {
  constructor(private db: Database) {}

  async searchPosts(
    filters: SearchFilters,
    limit: number,
    offset: number
  ): Promise<SearchResult> {
    const { search, status, categorie, date, featured } = filters
    const searchPattern = `%${search}%`
    
    let query = `
      SELECT 
        id, title, slug, categorie, tags, content, excerpt, 
        status, featured, featuredImage, createdAt, updatedAt, authorId, views
      FROM posts
      WHERE (
        LOWER(title) LIKE LOWER('${searchPattern}') OR
        LOWER(excerpt) LIKE LOWER('${searchPattern}') OR
        LOWER(categorie) LIKE LOWER('${searchPattern}') OR
        LOWER(tags) LIKE LOWER('${searchPattern}') OR
        LOWER(content) LIKE LOWER('${searchPattern}')
      )`

    if (status) {
      query += ` AND status = '${status}'`
    }

    if (categorie) {
      query += ` AND categorie = '${categorie}'`
    }

    if (date) {
      const dateTimestamp = Math.floor(new Date(date).getTime() / 1000)
      query += ` AND createdAt >= ${dateTimestamp}`
    }

    if (featured !== undefined) {
      query += ` AND featured = ${featured ? 1 : 0}`
    }

    query += ` ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${offset}`

    const postsResult: any[] = await this.db.all(sql.raw(query))
    
    const posts = postsResult.map(post => ({
      ...post,
      content: safeJsonParse(post.content, null),
      tags: safeJsonParse(post.tags, [])
    }))

    let countQuery = `
      SELECT COUNT(*) as count
      FROM posts
      WHERE (
        LOWER(title) LIKE LOWER('${searchPattern}') OR
        LOWER(excerpt) LIKE LOWER('${searchPattern}') OR
        LOWER(categorie) LIKE LOWER('${searchPattern}') OR
        LOWER(tags) LIKE LOWER('${searchPattern}') OR
        LOWER(content) LIKE LOWER('${searchPattern}')
      )`

    if (status) {
      countQuery += ` AND status = '${status}'`
    }

    if (categorie) {
      countQuery += ` AND categorie = '${categorie}'`
    }

    if (date) {
      const dateTimestamp = Math.floor(new Date(date).getTime() / 1000)
      countQuery += ` AND createdAt >= ${dateTimestamp}`
    }

    if (featured !== undefined) {
      countQuery += ` AND featured = ${featured ? 1 : 0}`
    }

    const totalResult: any = await this.db.all(sql.raw(countQuery))
    const total = Number(totalResult[0]?.count || 0)

    return { posts, total }
  }
}
