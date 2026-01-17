# Stats Endpoints Integration (Astro)

This guide explains how to integrate the stats endpoints from this API into an Astro project. It assumes your post page looks like the sample you shared and that you fetch post content directly from Turso. In that setup, the API never sees the page view unless you call it explicitly.

## Endpoints and behavior

Base path: `/api/v1`

### View tracking (automatic on GET)
`GET /api/v1/posts/:slug`

- Increments the view count only for `PUBLISHED` posts.
- Uses a 30 minute cooldown per `postId + IP` to avoid rapid re-counting.
- Optional query: `?skipViewIncrement=true` to disable tracking.

`GET /api/v1/posts/id/:id` has the same behavior.

### Aggregate stats
`GET /api/v1/posts/stats/views`

Response shape:
```json
{
  "total": 0,
  "published": 0,
  "drafts": 0,
  "totalViews": 0,
  "byCategory": [
    { "category": "Engineering", "count": 3 }
  ]
}
```

No auth is required for this endpoint.

## Integrating with your Astro slug page

Because your Astro page reads from Turso directly, no view is tracked unless you call the API. The simplest approach is a client-side request after page load that hits the `GET /posts/:slug` endpoint and ignores the response.

### Example: lightweight view tracker component (React)

`src/components/ViewTracker.tsx`
```tsx
import { useEffect } from "react";

type Props = {
  slug: string;
  apiBaseUrl?: string;
};

export function ViewTracker({ slug, apiBaseUrl }: Props) {
  useEffect(() => {
    const baseUrl =
      apiBaseUrl ??
      import.meta.env.PUBLIC_BLOG_API_URL ??
      "http://localhost:51214/api/v1";

    void fetch(`${baseUrl}/posts/${slug}`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    }).catch(() => {
      // Best-effort tracking: ignore failures.
    });
  }, [slug, apiBaseUrl]);

  return null;
}
```

Usage in your Astro page:
```astro
<ViewTracker slug={slug} client:load />
```

Notes:
- Run this client-side so the API can see the real IP + user agent.
- The 30 minute cooldown avoids rapid duplicate counts.

## Avoiding double counts

If you later switch to fetching the post content from the API server-side, use:

`GET /api/v1/posts/:slug?skipViewIncrement=true`

Then keep the client-side tracker as shown above to count a single real view.

## Fetching aggregate stats for a dashboard

Example:
```ts
const baseUrl =
  import.meta.env.PUBLIC_BLOG_API_URL ?? "http://localhost:51214/api/v1";

const response = await fetch(`${baseUrl}/posts/stats/views`);
const stats = await response.json();
```

## Common pitfalls

- `skipViewIncrement=true` is a string. Any other value still counts the view.
- Views only increment for `PUBLISHED` posts.
- If your Astro site runs on a new domain, add it to CORS in `src/server.ts`.
