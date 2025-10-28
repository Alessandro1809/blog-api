import { sql } from 'drizzle-orm'
import { type Database } from '../db/index.js'

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
  constructor(private db: Database) {}

  async searchPosts(
    filters: SearchFilters,
    limit: number,
    offset: number
  ): Promise<SearchResult> {
    const { search, status, categorie, date } = filters
    const searchPattern = `%${search}%`
    
    let query = `
      SELECT 
        id, title, slug, categorie, tags, content, excerpt, 
        status, featuredImage, createdAt, updatedAt, authorId, views
      FROM posts
      WHERE (
        LOWER(title) LIKE LOWER('${searchPattern}') OR
        LOWER(excerpt) LIKE LOWER('${searchPattern}') OR
        LOWER(categorie) LIKE LOWER('${searchPattern}') OR
        json_extract(tags, '$') LIKE '%"${search}"%' OR
        LOWER(json_extract(content, '$')) LIKE LOWER('${searchPattern}')
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

    query += ` ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${offset}`

    const posts: any[] = await this.db.all(sql.raw(query))

    let countQuery = `
      SELECT COUNT(*) as count
      FROM posts
      WHERE (
        LOWER(title) LIKE LOWER('${searchPattern}') OR
        LOWER(excerpt) LIKE LOWER('${searchPattern}') OR
        LOWER(categorie) LIKE LOWER('${searchPattern}') OR
        json_extract(tags, '$') LIKE '%"${search}"%' OR
        LOWER(json_extract(content, '$')) LIKE LOWER('${searchPattern}')
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

    const totalResult: any = await this.db.all(sql.raw(countQuery))
    const total = Number(totalResult[0]?.count || 0)

    return { posts, total }
  }
}
