# Sistema de Tracking de Vistas

## Descripción

Sistema de conteo de vistas con rate limiting basado en IP para evitar duplicados y spam.

## Características

✅ **Rate limiting por IP**: Cada IP solo puede incrementar las vistas de un post una vez cada 30 minutos  
✅ **Persistencia**: Las vistas se almacenan en Turso (SQLite)  
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
import { db } from './db/index.js'

// Eliminar vistas de más de 90 días
await cleanupOldViews(db, 90)
```

### Recomendaciones

1. **Ejecutar limpieza cada 24 horas** usando un cron job
2. **Mantener vistas de los últimos 90 días** para análisis
3. **Monitorear el tamaño de la tabla** si tienes mucho tráfico

## Consultas útiles

### Ver vistas recientes de un post

```typescript
import { db } from './db/index.js'
import { postViews } from './db/schema.js'
import { eq, desc } from 'drizzle-orm'

const recentViews = await db.select()
  .from(postViews)
  .where(eq(postViews.postId, 'post-id'))
  .orderBy(desc(postViews.viewedAt))
  .limit(10)
```

### Contar vistas únicas por IP

```typescript
import { sql } from 'drizzle-orm'

const uniqueViews = await db.select({
  ipAddress: postViews.ipAddress,
  count: sql<number>`count(*)`
})
  .from(postViews)
  .where(eq(postViews.postId, 'post-id'))
  .groupBy(postViews.ipAddress)
```

### Posts más vistos en las últimas 24 horas

```typescript
import { gte } from 'drizzle-orm'

const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

const topPosts = await db.select({
  postId: postViews.postId,
  count: sql<number>`count(*)`
})
  .from(postViews)
  .where(gte(postViews.viewedAt, yesterday))
  .groupBy(postViews.postId)
  .orderBy(desc(sql`count(*)`)) 
  .limit(10)
```

## Ventajas vs otras soluciones

| Solución | Pros | Contras |
|----------|------|---------|
| **Tabla en BD (Turso)** ✅ | Persistente, edge-ready, auditable, sin infra extra | Ligeramente más lento que Redis |
| Map en memoria | Rápido, simple | Se pierde al reiniciar, no escala |
| Redis | Muy rápido, TTL automático | Infra adicional, costo extra |

## Setup de la base de datos

```bash
npm run db:push      # Sincroniza el schema con Turso
npm run seed         # Pobla la base de datos
```
