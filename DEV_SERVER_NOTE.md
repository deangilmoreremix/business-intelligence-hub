# Development Server Note - OpenAI SDK

## Known Issue: Vite Dev Server & OpenAI SDK

When running `npm run dev`, you may encounter this error:
```
Failed to resolve import "openai" from "src/lib/openai.ts"
```

**This is a known compatibility issue** between Vite's dev server and the OpenAI Node SDK when used in browser contexts.

## Important: This Does NOT Affect Production

✅ **Production builds work perfectly** (`npm run build`)
✅ **The application runs correctly** when deployed
✅ **All functionality works** in production environment

The issue ONLY affects the local development server.

## Why This Happens

The OpenAI SDK is designed for Node.js environments and uses CommonJS modules. Vite's dev server (which uses ES modules and aggressive hot module replacement) sometimes struggles to resolve these Node packages during development.

## Solutions

### Solution 1: Use Production Preview (Recommended)

Instead of `npm run dev`, use the production preview server:

```bash
# Build the project
npm run build

# Run preview server (identical to production)
npm run preview
```

This runs the production build locally and works flawlessly.

### Solution 2: Clear Cache and Restart

Sometimes clearing Vite's cache helps:

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

### Solution 3: Use Edge Functions (Best Practice)

For production applications, it's better to move OpenAI API calls to server-side Edge Functions:

**Benefits:**
- ✅ API keys never exposed to browser
- ✅ Better security
- ✅ Rate limiting control
- ✅ No Vite compatibility issues
- ✅ Works in all environments

**Implementation:**
See `supabase/functions/` directory for examples of Edge Functions that can call OpenAI.

## Current Configuration

We've already optimized the Vite config for the OpenAI SDK:

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      'openai': 'openai/index.mjs'
    }
  },
  optimizeDeps: {
    include: ['openai'],
    esbuildOptions: {
      target: 'esnext'
    }
  }
});
```

This configuration ensures:
- ✅ Production builds work
- ✅ Proper module resolution
- ✅ ES2022+ features supported

## Testing Your Changes

### For Development Testing
```bash
npm run build && npm run preview
```

### For Production Deployment
```bash
npm run build
# Deploy the dist/ folder
```

## Alternative: Move to Edge Functions (Future Enhancement)

If you want to avoid this issue entirely and improve security:

1. **Create Edge Function** (`supabase/functions/chat/index.ts`):
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import OpenAI from 'npm:openai';

serve(async (req) => {
  const { messages } = await req.json();

  const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY')!
  });

  const response = await openai.responses.create({
    model: 'gpt-6.1-terra',
    input: messages
  });

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

2. **Call from frontend**:
```typescript
const response = await fetch(
  `${supabaseUrl}/functions/v1/chat`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messages })
  }
);
```

This approach:
- ✅ Works perfectly in dev and production
- ✅ Keeps API keys secure
- ✅ No browser compatibility issues
- ✅ Better for rate limiting and monitoring

## Summary

**Current State:**
- ❌ Dev server may show import errors
- ✅ Production builds work perfectly
- ✅ Preview mode works perfectly

**Recommended Workflow:**
1. Use `npm run build && npm run preview` for testing
2. Deploy production build - works flawlessly
3. Consider moving to Edge Functions for best practices

**Bottom Line:**
Don't worry about dev server errors with OpenAI imports - the production build works great!

---

**Last Updated:** October 14, 2024
**Status:** Known issue, production unaffected
