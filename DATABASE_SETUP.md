# 🗄️ Database Setup Guide

Este documento contiene las queries SQL necesarias para generar las tablas de la base de datos del Blog API.

---

## 📋 Índice

- [PostgreSQL Schema (Prisma)](#postgresql-schema-prisma)
- [SQLite Schema (Drizzle/Turso)](#sqlite-schema-drizzleturso)
- [Descripción de Tablas](#descripción-de-tablas)

---

## PostgreSQL Schema (Prisma)

### Tabla: `posts`

```sql
-- Crear enum para el estado del post
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- Crear enum para las categorías
CREATE TYPE "PostCategory" AS ENUM (
  'ARTICULOS',
  'GUIAS_LEGALES',
  'JURISPRUDENCIA_COMENTADA',
  'NOTICIAS',
  'OPINION',
  'RESENAS'
);

-- Crear tabla de posts
CREATE TABLE "posts" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "excerpt" TEXT,
  "title" TEXT NOT NULL,
  "content" JSONB,
  "categorie" "PostCategory",
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
  "featuredImage" TEXT,
  "authorId" TEXT NOT NULL,
  "views" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Crear índice para búsquedas por slug
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");
```

### Tabla: `post_views`

```sql
-- Crear tabla de vistas de posts
CREATE TABLE "post_views" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "postId" TEXT NOT NULL,
  "ipAddress" TEXT NOT NULL,
  "userAgent" TEXT,
  "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "post_views_postId_fkey" 
    FOREIGN KEY ("postId") 
    REFERENCES "posts"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
);

-- Crear índice compuesto para optimizar consultas de tracking
CREATE INDEX "post_views_postId_ipAddress_viewedAt_idx" 
  ON "post_views"("postId", "ipAddress", "viewedAt");
```

---

## SQLite Schema (Drizzle/Turso)

### Tabla: `posts`

```sql
-- Crear tabla de posts
CREATE TABLE posts (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  title TEXT NOT NULL,
  content TEXT, -- JSON almacenado como TEXT
  categorie TEXT,
  tags TEXT NOT NULL DEFAULT '[]', -- Array JSON almacenado como TEXT
  status TEXT NOT NULL DEFAULT 'DRAFT',
  featuredImage TEXT,
  authorId TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Crear índice único para slug
CREATE UNIQUE INDEX posts_slug_unique ON posts(slug);
```

### Tabla: `post_views`

```sql
-- Crear tabla de vistas de posts
CREATE TABLE post_views (
  id TEXT PRIMARY KEY NOT NULL,
  postId TEXT NOT NULL,
  ipAddress TEXT NOT NULL,
  userAgent TEXT,
  viewedAt INTEGER NOT NULL DEFAULT (unixepoch()),
  
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
);

-- Crear índice compuesto para optimizar consultas de tracking
CREATE INDEX post_views_postId_ipAddress_viewedAt_idx 
  ON post_views(postId, ipAddress, viewedAt);
```

---

## 📊 Descripción de Tablas

### Tabla `posts`

Almacena todos los artículos del blog con su contenido y metadatos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | TEXT/STRING | Identificador único del post (CUID en PostgreSQL, UUID en SQLite) |
| `slug` | TEXT/STRING | URL-friendly identifier único para el post |
| `excerpt` | TEXT/STRING | Resumen corto del post (opcional) |
| `title` | TEXT/STRING | Título del post |
| `content` | JSON/JSONB | Contenido del post en formato JSON (Editor.js, Tiptap, etc.) |
| `categorie` | ENUM/TEXT | Categoría del post |
| `tags` | ARRAY/JSON | Lista de etiquetas asociadas al post |
| `status` | ENUM/TEXT | Estado del post: `DRAFT` o `PUBLISHED` |
| `featuredImage` | TEXT/STRING | URL de la imagen destacada (opcional) |
| `authorId` | TEXT/STRING | ID del autor (referencia a Clerk) |
| `views` | INTEGER | Contador de vistas del post |
| `createdAt` | TIMESTAMP/INTEGER | Fecha de creación |
| `updatedAt` | TIMESTAMP/INTEGER | Fecha de última actualización |

### Tabla `post_views`

Registra cada vista individual de un post para tracking y analytics.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | TEXT/STRING | Identificador único de la vista |
| `postId` | TEXT/STRING | ID del post visualizado (FK a `posts.id`) |
| `ipAddress` | TEXT/STRING | Dirección IP del visitante |
| `userAgent` | TEXT/STRING | User agent del navegador (opcional) |
| `viewedAt` | TIMESTAMP/INTEGER | Timestamp de cuando se visualizó |

---

## 🚀 Comandos de Setup

### Usando Prisma (PostgreSQL)

```bash
# Generar cliente de Prisma
npx prisma generate

# Aplicar migraciones
npx prisma migrate dev --name init

# Poblar base de datos
npm run seed
```

### Usando Drizzle (SQLite/Turso)

```bash
# Sincronizar esquema con la base de datos
npm run db:push

# Poblar base de datos
npm run seed
```

---

## 📝 Notas Importantes

> [!IMPORTANT]
> - **PostgreSQL** usa tipos nativos como `ENUM`, `JSONB`, y `ARRAY`
> - **SQLite** almacena JSON y arrays como `TEXT` serializado
> - Los timestamps en PostgreSQL son `TIMESTAMP`, en SQLite son `INTEGER` (Unix epoch)
> - Ambos esquemas mantienen la misma lógica de negocio y relaciones

> [!TIP]
> Para desarrollo local, se recomienda usar **Turso** (SQLite) por su simplicidad y velocidad. Para producción con alta concurrencia, considera **PostgreSQL**.

> [!CAUTION]
> Al eliminar un post, todas sus vistas asociadas se eliminarán automáticamente debido a la constraint `ON DELETE CASCADE`.

---

## 🔗 Categorías Disponibles

Las categorías predefinidas son:

- `ARTICULOS` - Artículos generales
- `GUIAS_LEGALES` - Guías y tutoriales legales
- `JURISPRUDENCIA_COMENTADA` - Análisis de jurisprudencia
- `NOTICIAS` - Noticias del sector
- `OPINION` - Artículos de opinión
- `RESENAS` - Reseñas y críticas

> [!NOTE]
> En la implementación actual con Drizzle (SQLite), las categorías son dinámicas y se almacenan como `TEXT`, permitiendo mayor flexibilidad.
