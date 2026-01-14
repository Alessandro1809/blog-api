import { eq, and, gte, desc, sql, count } from 'drizzle-orm'
import { type Database } from '../db/index.js'
import { posts } from '../db/schema.js'
import { CATEGORY_LABEL_TO_ENUM } from '../constants/categories.js'
import { safeJsonParse, safeJsonStringify } from '../utils/json-parser.js'
 
interface PostFilters {
  status?: string
  categorie?: string
  date?: string
  featured?: boolean
}
 
interface CreatePostData {
  [key: string]: any
}
 
export class PostService {
  constructor(private db: Database) {}
 
  // Helper method to parse content - detects if it's markdown or JSON
  private parseContent(content: string | null): any {
    if (!content) return null;
 
    // If starts with ---, it's markdown, return as string
    if (content.startsWith('---')) {
      return content;
    }
 
    // Otherwise, try to parse as JSON
    return safeJsonParse(content, null);
  }
 
  async findAllPosts(filters: PostFilters, limit: number, offset: number) {
    const conditions = []
 
    if (filters.status) {
      conditions.push(eq(posts.status, filters.status))
    }
 
    if (filters.categorie) {
      conditions.push(eq(posts.categorie, filters.categorie))
    }
 
    if (filters.date) {
      const dateTimestamp = Math.floor(new Date(filters.date).getTime() / 1000)
      conditions.push(gte(posts.createdAt, new Date(dateTimestamp * 1000)))
    }

    if (filters.featured !== undefined) {
      conditions.push(eq(posts.featured, filters.featured))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
 
    const [postsResult, totalResult] = await Promise.all([
      this.db.select().from(posts).where(whereClause).orderBy(desc(posts.createdAt)).limit(limit).offset(offset),
      this.db.select({ count: count() }).from(posts).where(whereClause)
    ])
 
    const parsedPosts = postsResult.map(post => ({
      ...post,
      content: this.parseContent(post.content),
      tags: safeJsonParse(post.tags, [])
    }))
 
    return { posts: parsedPosts, total: totalResult[0]?.count || 0 }
  }
 
  async findPostById(id: string) {
    const result = await this.db.select().from(posts).where(eq(posts.id, id)).limit(1)
    if (!result[0]) return null
 
    return {
      ...result[0],
      content: this.parseContent(result[0].content),
      tags: safeJsonParse(result[0].tags, [])
    }
  }
 
  async findPostBySlug(slug: string) {
    const result = await this.db.select().from(posts).where(eq(posts.slug, slug)).limit(1)
    if (!result[0]) return null
 
    return {
      ...result[0],
      content: this.parseContent(result[0].content),
      tags: safeJsonParse(result[0].tags, [])
    }
  }
 
  async createPost(data: CreatePostData, authorId: string) {
    if (data.categorie && CATEGORY_LABEL_TO_ENUM[data.categorie]) {
      data.categorie = CATEGORY_LABEL_TO_ENUM[data.categorie]
    }
 
    const result = await this.db.insert(posts).values({
      ...data,
      authorId,
      // If content is already a string (markdown), save it directly; if it's an object, stringify it
      content: typeof data.content === 'string' 
        ? data.content 
        : (data.content ? safeJsonStringify(data.content) : null),
      tags: safeJsonStringify(data.tags || [])
    } as any).returning()
 
    const post = result[0]
    if (!post) throw new Error('Failed to create post')
 
    return {
      ...post,
      content: this.parseContent(post.content),
      tags: safeJsonParse(post.tags, [])
    }
  }
 
  async updatePost(id: string, data: CreatePostData) {
    if (data.categorie && CATEGORY_LABEL_TO_ENUM[data.categorie]) {
      data.categorie = CATEGORY_LABEL_TO_ENUM[data.categorie]
    }
 
    const updateData: any = {
      ...data,
      updatedAt: new Date()
    }
 
    if (data.content !== undefined) {
      // If content is already a string (markdown), save it directly
      updateData.content = typeof data.content === 'string'
        ? data.content
        : (data.content ? safeJsonStringify(data.content) : null)
    }
    if (data.tags !== undefined) {
      updateData.tags = safeJsonStringify(data.tags)
    }
 
    const result = await this.db.update(posts).set(updateData).where(eq(posts.id, id)).returning()
 
    const post = result[0]
    if (!post) throw new Error('Failed to update post')
 
    return {
      ...post,
      content: this.parseContent(post.content),
      tags: safeJsonParse(post.tags, [])
    }
  }
 
  async deletePost(id: string) {
    await this.db.delete(posts).where(eq(posts.id, id))
  }
 
  async checkSlugExists(slug: string) {
    const result = await this.db.select().from(posts).where(eq(posts.slug, slug)).limit(1)
    return result[0] || null
  }
 
  async getStats() {
    const [totalResult, publishedResult, draftResult, viewsResult, categoryResult] = await Promise.all([
      this.db.select({ count: count() }).from(posts),
      this.db.select({ count: count() }).from(posts).where(eq(posts.status, 'PUBLISHED')),
      this.db.select({ count: count() }).from(posts).where(eq(posts.status, 'DRAFT')),
      this.db.select({ total: sql<number>`sum(${posts.views})` }).from(posts),
      this.db.select({ categorie: posts.categorie, count: count() }).from(posts).groupBy(posts.categorie)
    ])
 
    return {
      total: totalResult[0]?.count || 0,
      published: publishedResult[0]?.count || 0,
      drafts: draftResult[0]?.count || 0,
      totalViews: viewsResult[0]?.total || 0,
      byCategory: categoryResult.map(item => ({
        category: item.categorie,
        count: item.count
      }))
    }
  }
}