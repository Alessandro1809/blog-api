# Blog API - Recruiter-Ready Backend

Purpose-built backend for a blog platform with a focus on speed, correctness, and a clean developer story. This service is intentionally small, highly typed, and safe to extend. It is optimized to show good engineering judgment, not unnecessary complexity.

## Why this API runs the way it does
- Performance first: Fastify keeps the request path lean and predictable.
- Safety by design: Clerk handles identity so the API never stores passwords.
- Contract stability: Zod schemas validate input and serialize output consistently.
- Clear bootstrap: plugins are registered explicitly and in a fixed order.
- Edge-friendly data: Turso (libSQL) provides low-latency SQLite at scale.

## How it runs (the runtime path)
1. `src/server.ts` loads env config and builds a Fastify instance with Zod type providers.
2. `registerPlugins()` wires CORS, database, auth, and routes under `/api/v1`.
3. Requests flow: route -> controller -> service -> Drizzle ORM -> Turso.
4. The server listens on `0.0.0.0:${PORT}` (default `51214`).
5. In tests (`NODE_ENV=test`), the server does not auto-start.

Runtime flow:
```
Client -> /api/v1 -> routes -> controllers -> services -> db (Drizzle -> Turso)
```

## API surface (high level)
- `GET /api/v1/posts` list posts (supports query via Zod schema)
- `GET /api/v1/posts/id/:id` get a post by id
- `GET /api/v1/posts/:slug` get a post by slug
- `POST /api/v1/posts` create a post (auth required)
- `PUT /api/v1/posts/:id` update a post (auth required)
- `DELETE /api/v1/posts/:id` delete a post (auth required)
- `GET /api/v1/categories` list categories
- `GET /api/v1/posts/stats/views` view stats
- `GET /health` health check

## Example requests and responses
List posts:
```bash
curl "http://localhost:51214/api/v1/posts?page=1&limit=10"
```
Example response:
```json
{
  "data": [
    {
      "id": "1",
      "title": "Why Fastify",
      "slug": "why-fastify",
      "excerpt": "A short case for low-latency APIs.",
      "authorId": "user_123",
      "createdAt": "2024-01-12T10:05:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 42 }
}
```

Create post (auth required):
```bash
curl -X POST "http://localhost:51214/api/v1/posts" \
  -H "Authorization: Bearer <CLERK_JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Typed APIs that scale",
    "slug": "typed-apis",
    "content": "Full post body...",
    "excerpt": "Why type-safe contracts matter.",
    "category": "engineering"
  }'
```
Example response:
```json
{
  "id": "2",
  "title": "Typed APIs that scale",
  "slug": "typed-apis",
  "authorId": "user_123",
  "createdAt": "2024-01-12T12:30:00.000Z"
}
```

## Environment variables
Required:
- `TURSO_DATABASE_URL` Turso database URL
- `TURSO_AUTH_TOKEN` Turso auth token
- `CLERK_SECRET_KEY` Clerk secret key for token verification

Optional:
- `PORT` server port (default `51214`)
- `NODE_ENV` `development` | `production` | `test`

## Local development
```bash
npm install
npm run dev
```

Database tasks:
```bash
npm run db:push
npm run seed
```

Tests:
```bash
npm test
npm run test:coverage
```

## Deployment options
- Docker is supported via `Dockerfile` (builds TypeScript and runs `dist/server.js`).
- `fly.toml` and `render.yaml` exist for platform deploys.

## Codex handoff: Astro Starlight template edits
If you are another Codex instance customizing an Astro Starlight template to present this API to recruiters, use this brief as your source of truth:

Goals:
- Present a fast, credible engineering story without marketing fluff.
- Show how the API runs, why the architecture is deliberate, and how to integrate it.
- Keep the UI intentional and distinct; avoid generic templates.

Content to include in the Astro site:
- A hero section that explains the problem this API solves in 1-2 sentences.
- A "How it works" section that mirrors the runtime path above.
- An "API surface" page with the high-level endpoints list.
- A "Trust" section that highlights typed validation, auth boundaries, and testing.
- A "Run it locally" page with the exact scripts and env vars above.

Implementation notes:
- Use a non-default typeface and a deliberate color system.
- Add a subtle background texture or gradient; no flat white.
- Include one lightweight animation for section reveal.
- Keep it mobile-friendly and readable in 60 seconds.

Non-goals:
- Do not add features that are not in this repo.
- Do not invent endpoints or auth flows beyond what is listed here.

If any repo details are missing, re-open `src/server.ts`, `src/plugins/auth.ts`, and `src/db/index.ts` for verification before editing the Astro template.

## Astro Starlight page outline (copy draft)
Homepage:
- Hero headline: "A fast, typed blog API built for real-world delivery."
- Subhead: "Fastify + Turso + Zod + Clerk, assembled for performance, correctness, and safe iteration."
- Primary CTA: "See the runtime path"
- Secondary CTA: "Run it locally"

Page: How It Works
- Section: Runtime path (use the 5-step flow above)
- Section: Why these choices (Fastify, Turso, Clerk, Zod)
- Section: Auth boundaries (public reads, protected writes)

Page: API Surface
- Endpoint list with 1-line descriptions
- Include the two example requests from this README

Page: Trust & Quality
- Typed validation with Zod
- Clear plugin boundaries
- Tests with Vitest + Supertest
- Health endpoint for uptime checks

Page: Run It Locally
- Requirements (Node 20+, Turso, Clerk)
- Env vars
- `npm install`, `npm run dev`, `npm run db:push`, `npm run seed`

Footer:
- Link to GitHub repo
- Short line: "Built to be audited in minutes."
