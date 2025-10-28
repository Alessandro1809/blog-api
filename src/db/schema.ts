import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  title: text('title').notNull(),
  content: text('content', { mode: 'json' }),
  categorie: text('categorie'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  status: text('status').notNull().default('DRAFT'),
  featuredImage: text('featuredImage'),
  authorId: text('authorId').notNull(),
  views: integer('views').notNull().default(0),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
})

export const postViews = sqliteTable('post_views', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text('postId').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  ipAddress: text('ipAddress').notNull(),
  userAgent: text('userAgent'),
  viewedAt: integer('viewedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
}, (table) => ({
  postIdIpViewedIdx: index('post_views_postId_ipAddress_viewedAt_idx').on(table.postId, table.ipAddress, table.viewedAt)
}))

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
export type PostView = typeof postViews.$inferSelect
export type NewPostView = typeof postViews.$inferInsert
