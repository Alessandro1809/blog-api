import { type PrismaClient } from '../generated/prisma/index.js'

const VIEW_COOLDOWN_MS = 30 * 60 * 1000 // 30 minutos

export class ViewTrackingService {
  constructor(private prisma: PrismaClient) {}

  async canIncrementView(postId: string, ipAddress: string): Promise<boolean> {
    const cooldownTime = new Date(Date.now() - VIEW_COOLDOWN_MS)
    
    const recentView = await this.prisma.postView.findFirst({
      where: {
        postId,
        ipAddress,
        viewedAt: {
          gte: cooldownTime
        }
      }
    })
    
    return !recentView
  }

  async trackView(
    postId: string,
    ipAddress: string,
    userAgent: string | null
  ): Promise<void> {
    const canIncrement = await this.canIncrementView(postId, ipAddress)
    
    if (canIncrement) {
      await this.prisma.postView.create({
        data: {
          postId,
          ipAddress,
          userAgent
        }
      })
      
      await this.prisma.post.update({
        where: { id: postId },
        data: { views: { increment: 1 } }
      })
    }
  }
}
