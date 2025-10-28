# Testing Clerk Authentication

## Environment Variables Required

Make sure these are set in your `.env` file:

```env
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
```

You can find these in your Clerk Dashboard → Settings → API Keys

## Testing the Authentication

### 1. Frontend - Verify Token is Sent

In your frontend code, add logging to verify the token:

```typescript
console.log('Token:', token.substring(0, 20) + '...')
```

### 2. Backend - Add Request Logging

Add this hook to your Fastify server to see incoming auth headers:

```typescript
fastify.addHook('onRequest', async (request, reply) => {
  console.log('Auth header:', request.headers.authorization?.substring(0, 30))
})
```

### 3. Test with cURL

```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{"title":"Test","slug":"test","content":{},"status":"DRAFT"}'
```

## How It Works

The new authentication plugin:

1. **Extracts the token** from the `Authorization: Bearer <token>` header
2. **Verifies the token** using Clerk's `verifyToken()` function with your secret key
3. **Validates the user** exists in Clerk's database
4. **Attaches user info** to `request.user` for use in your route handlers

## Common Issues

### "Unauthorized" Error
- Check that `CLERK_SECRET_KEY` is correctly set
- Verify the token is not expired
- Ensure the token is from the correct Clerk instance

### "No token provided" Error
- Make sure the frontend is sending the `Authorization` header
- Verify the header format is `Bearer <token>` (with a space)

### "User not found" Error
- The token is valid but the user doesn't exist in Clerk
- This usually means the user was deleted from Clerk
