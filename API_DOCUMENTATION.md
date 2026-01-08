# 🚀 Blog API Documentation - Technical & Architectural Reference

Esta es la documentación técnica definitiva de la **Blog API**. A diferencia de una referencia estándar, este documento profundiza en el **porqué** de cada decisión de diseño, proporcionando claridad absoluta para desarrolladores y arquitectos.

---

## 🏗️ Guía Arquitectónica: ¿Por qué estas tecnologías?

La elección del stack no es accidental. Se ha diseñado para maximizar el rendimiento en entornos *Edge* y la experiencia de desarrollo (DX).

- **Fastify**: Elegido sobre Express por su bajísimo *overhead* y su sistema de plugins basado en encapsulación, lo que permite una escalabilidad limpia y validación nativa ultra rápida.
- **SQLite (vía Turso)**: SQLite es la base de datos ideal para aplicaciones de lectura intensiva (como un blog). Turso permite distribuir estos datos globalmente (Edge-ready), reduciendo la latencia a milisegundos para usuarios de todo el mundo.
- **Drizzle ORM**: Se utiliza porque no tiene un motor de introspección pesado en tiempo de ejecución. Es "TypeScript-first", lo que garantiza que si el código compila, la consulta a la base de datos es estructuralmente correcta.

---

## 🔐 Seguridad y Autenticación: El Enfoque Desacoplado

### ¿Por qué Clerk?
En lugar de gestionar una tabla de usuarios local, la API delega la identidad a **Clerk**.
- **Ventaja**: No almacenamos contraseñas (mayor seguridad) y reducimos la complejidad del backend. 
- **Flujo**: El frontend obtiene un JWT. La API lo valida mediante la clave pública de Clerk. Esto permite que el backend sea apátrida (stateless).

### Validación de Propiedad (Ownership)
Para operaciones destructivas (`PUT`, `DELETE`), la API no solo verifica que estés autenticado, sino que el `authorId` del registro coincida con tu identidad de Clerk (`sub`).
- **El porqué**: Esto previene ataques de ID inseguro donde un usuario autenticado podría intentar borrar el post de otro usuario simplemente conociendo su ID.

---

## 📂 Referencia de Endpoints con Rationale

### `GET /api/v1/posts`
Lista publicaciones con un motor de búsqueda y filtrado dinámico.

**¿Por qué este diseño de búsqueda?**
Usamos un `SearchService` que ejecuta SQL directo con `LIKE` sobre campos JSON y texto. 
- **Razón**: Aunque existen motores como Meilisearch, mantenerlos para un blog pequeño añade complejidad innecesaria. El motor de SQLite es sorprendentemente rápido para miles de registros con este enfoque.

**Parámetros de Query:**
| Parámetro | Tipo | Descripción |
| :--- | :--- | :--- |
| `status` | `Enum` | Filtra por `DRAFT` (solo si estás autenticado) o `PUBLISHED`. |
| `search` | `String` | Busca en título, contenido (JSON) y etiquetas. |
| `categorie` | `String` | Valor enum de la categoría (ej: `GUIAS_LEGALES`). |

---

### `GET /api/v1/posts/:slug`
**Enriquecimiento en tiempo de ejecución:**
Cuando solicitas un post, la API consulta a Clerk para obtener los datos del autor (nombre, imagen).
- **Razón**: Evitamos la desincronización de datos. Si un autor cambia su foto en Clerk, el blog la actualiza instantáneamente sin necesidad de migraciones de base de datos.

---

### `GET /api/v1/posts/stats/views`
**Diseño de Tracking de Vistas:**
Las vistas se registran en una tabla separada `post_views` antes de actualizar el contador principal.
- **Razón**: Proporciona un registro de auditoría (IP, User-Agent) que permite detectar bots y evitar ataques de inflación de métricas de forma retroactiva.

---

## � Modelos de Datos y Validación

### Validación con Zod
Cada entrada de datos está protegida por esquemas de Zod (`src/types/index.ts`).
- **Razón**: Esto actúa como una "frontera de seguridad". Ningún dato sucio entra en la lógica de negocio o en la base de datos, eliminando riesgos de inyección y errores de tipo `null/undefined`.

```json
{
  "title": "Obligatorio (String)",
  "content": "Flexible (JSON - para editores tipo Block o Markdown)",
  "status": "DRAFT | PUBLISHED"
}
```

---

## 🚀 Integración con Astro Starlight

Este README está optimizado para actuar como la "Fuente de la Verdad". Para Starlight:
1. **Página de Arquitectura**: Usa la sección inicial para explicar el stack a otros contribuidores.
2. **Página de Referencia**: Usa las tablas de endpoints.
3. **Página de Seguridad**: Explica el flujo de Clerk usando diagramas Mermaid (compatibles con Starlight).

> [!IMPORTANT]
> Nunca expongas la `CLERK_SECRET_KEY` en el frontend de documentación. Úsala solo en variables de entorno del servidor.
