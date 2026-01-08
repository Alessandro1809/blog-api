import { type Database } from '../db/index.js'
import { postViews } from '../db/schema.js'
import { lt, count } from 'drizzle-orm'

export const cleanupOldViews = async (db: Database, daysToKeep: number = 90) => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  // Count views to be deleted
  const countResult = await db.select({ count: count() })
    .from(postViews)
    .where(lt(postViews.viewedAt, cutoffDate))
  
  const deletedCount = countResult[0]?.count || 0

  // Delete old views
  await db.delete(postViews)
    .where(lt(postViews.viewedAt, cutoffDate))

  console.log(`✅ Limpieza completada: ${deletedCount} vistas antiguas eliminadas`)
  return deletedCount
}
