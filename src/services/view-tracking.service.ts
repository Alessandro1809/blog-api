import { eq, and, gte, sql } from 'drizzle-orm'
import { type Database } from '../db/index.js'
import { postViews, posts } from '../db/schema.js'

const VIEW_COOLDOWN_MS = 30 * 60 * 1000

export class ViewTrackingService {
  constructor(private db: Database) {}

  async canIncrementView(postId: string, ipAddress: string): Promise<boolean> {
    const cooldownTime = new Date(Date.now() - VIEW_COOLDOWN_MS)
    
    const recentView = await this.db.select()
      .from(postViews)
      .where(
        and(
          eq(postViews.postId, postId),
          eq(postViews.ipAddress, ipAddress),
          gte(postViews.viewedAt, cooldownTime)
        )
      )
      .limit(1)
    
    return recentView.length === 0
  }

  async trackView(
    postId: string,
    ipAddress: string,
    userAgent: string | null
  ): Promise<void> {
    const canIncrement = await this.canIncrementView(postId, ipAddress)
    
    if (canIncrement) {
      await this.db.insert(postViews).values({
        postId,
        ipAddress,
        userAgent
      })
      
      await this.db.update(posts)
        .set({ views: sql`${posts.views} + 1` })
        .where(eq(posts.id, postId))
    }
  }
}
