// src/utils/cleanup-views.ts
import { PrismaClient } from '../generated/prisma/index.js'

/**
 * Limpia las vistas antiguas de la base de datos
 * Se recomienda ejecutar esto periódicamente (ej: cada 24 horas)
 * para mantener la tabla optimizada
 */
export const cleanupOldViews = async (prisma: PrismaClient, daysToKeep: number = 90) => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  const result = await prisma.postView.deleteMany({
    where: {
      viewedAt: {
        lt: cutoffDate
      }
    }
  })

  console.log(`✅ Limpieza completada: ${result.count} vistas antiguas eliminadas`)
  return result.count
}
