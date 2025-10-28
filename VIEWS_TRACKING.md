# Sistema de Tracking de Vistas

## Descripción

Sistema de conteo de vistas con rate limiting basado en IP para evitar duplicados y spam.

## Características

✅ **Rate limiting por IP**: Cada IP solo puede incrementar las vistas de un post una vez cada 30 minutos  
✅ **Persistencia**: Las vistas se almacenan en PostgreSQL  
✅ **Auditoría**: Se registra IP, User-Agent y timestamp de cada vista  
✅ **Índices optimizados**: Búsquedas rápidas por postId, IP y fecha  
✅ **Cascade delete**: Las vistas se eliminan automáticamente al borrar un post  

## Estructura de la tabla

```sql
CREATE TABLE "post_views" (
    "id" TEXT PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "viewedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE
);

CREATE INDEX ON "post_views"("postId", "ipAddress", "viewedAt");
```

## Configuración

### Tiempo de cooldown

El tiempo mínimo entre vistas se configura en `src/controllers/posts.controller.ts`:

```typescript
const VIEW_COOLDOWN_MS = 30 * 60 * 1000 // 30 minutos
```

### Endpoints afectados

- `GET /posts/id/:id` - Incrementa vistas al obtener post por ID
- `GET /posts/:slug` - Incrementa vistas al obtener post por slug

### Query parameter opcional

Puedes omitir el incremento de vistas agregando `?skipViewIncrement=true`:

```bash
GET /posts/mi-post?skipViewIncrement=true
```

## Mantenimiento

### Limpieza de vistas antiguas

Para mantener la tabla optimizada, puedes ejecutar periódicamente:

```typescript
import { cleanupOldViews } from './utils/cleanup-views.js'

// Eliminar vistas de más de 90 días
await cleanupOldViews(prisma, 90)
```

### Recomendaciones

1. **Ejecutar limpieza cada 24 horas** usando un cron job
2. **Mantener vistas de los últimos 90 días** para análisis
3. **Monitorear el tamaño de la tabla** si tienes mucho tráfico

## Consultas útiles

### Ver vistas recientes de un post

```typescript
const recentViews = await prisma.postView.findMany({
  where: { postId: 'post-id' },
  orderBy: { viewedAt: 'desc' },
  take: 10
})
```

### Contar vistas únicas por IP

```typescript
const uniqueViews = await prisma.postView.groupBy({
  by: ['ipAddress'],
  where: { postId: 'post-id' },
  _count: true
})
```

### Posts más vistos en las últimas 24 horas

```typescript
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

const topPosts = await prisma.postView.groupBy({
  by: ['postId'],
  where: { viewedAt: { gte: yesterday } },
  _count: true,
  orderBy: { _count: { postId: 'desc' } },
  take: 10
})
```

## Ventajas vs otras soluciones

| Solución | Pros | Contras |
|----------|------|---------|
| **Tabla en BD** ✅ | Persistente, sin infra extra, auditable | Ligeramente más lento que Redis |
| Map en memoria | Rápido, simple | Se pierde al reiniciar, no escala |
| Redis | Muy rápido, TTL automático | Infra adicional, costo extra |

## Migración aplicada

```bash
npm run db:generate  # Genera el cliente de Prisma
npm run db:migrate   # Aplica la migración a la BD
```

Migración: `20251028053037_memory_of_views`
