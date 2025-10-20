# Contributing Guide

Thank you for your interest in improving this custom skew protection implementation!

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone <your-fork-url>
   cd custom-skew-protection
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Run Linter**
   ```bash
   npm run lint
   ```

## Project Structure

- `middleware.ts` - Core skew protection logic
- `app/` - Next.js App Router pages and API routes
- `.github/workflows/` - CI/CD configuration
- Documentation files (README, QUICKSTART, ARCHITECTURE)

## Making Changes

### Adding New Pages

1. Create a new directory under `app/`
2. Add a `page.tsx` file
3. Use server-side cookie access to show deployment info:

```typescript
import { cookies } from 'next/headers';

export default async function NewPage() {
  const cookieStore = await cookies();
  const deploymentCookie = cookieStore.get('__vdpl');

  // Your page content
}
```

### Adding New API Routes

1. Create a directory under `app/api/`
2. Add a `route.ts` file
3. Return deployment info in responses:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
    // Your data
  });
}
```

### Modifying Middleware

The middleware in `middleware.ts` is the core of skew protection. When modifying:

1. **Test thoroughly** - Changes affect all requests
2. **Preserve cookie attributes** - HttpOnly, Secure, SameSite are important
3. **Consider performance** - Middleware runs on every request
4. **Update documentation** - If behavior changes, update README

Example modification - changing cookie duration:

```typescript
response.cookies.set({
  name: '__vdpl',
  value: deploymentId,
  path: '/',
  maxAge: 60 * 60 * 2, // Changed to 2 hours
  // ... other attributes
});
```

### Testing Locally

Since `VERCEL_DEPLOYMENT_ID` isn't set locally, you can:

1. **Mock it** for testing:
   ```bash
   VERCEL_DEPLOYMENT_ID=local-test npm run dev
   ```

2. **Check DevTools** - Application → Cookies to verify cookie is set

3. **Test navigation** - Ensure cookie persists across pages

### Testing on Vercel

1. **Deploy to preview**:
   ```bash
   vercel
   ```

2. **Check deployment** - Open the preview URL

3. **Verify cookie** - Check DevTools for `__vdpl` cookie

4. **Test during rollout**:
   - Deploy a new version
   - Keep old session open
   - Open new incognito window
   - Verify different deployments serve different sessions

## Code Style

- Follow Next.js conventions
- Use TypeScript for type safety
- Add comments for complex logic
- Keep files focused and modular

## Documentation

When adding features, update:

- `README.md` - Main documentation
- `ARCHITECTURE.md` - If changing structure
- `QUICKSTART.md` - If changing setup process
- Code comments - For complex logic

## Pull Request Process

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Test locally and on Vercel preview

3. **Commit with clear messages**
   ```bash
   git commit -m "Add: Brief description of changes"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **PR should include**:
   - Clear description of changes
   - Why the change is needed
   - How to test it
   - Screenshots if UI changes

## Common Enhancements

### 1. Add Cookie Refresh Logic

Refresh the cookie before expiration:

```typescript
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const deploymentCookie = request.cookies.get('__vdpl');
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID;

  // Refresh cookie if it exists and is close to expiring
  if (deploymentCookie && deploymentId) {
    response.cookies.set({
      name: '__vdpl',
      value: deploymentCookie.value, // Keep same deployment
      path: '/',
      maxAge: 60 * 60, // Reset to 1 hour
      // ... other attributes
    });
  }

  return response;
}
```

### 2. Add Deployment Info Endpoint

Create a dedicated status endpoint:

```typescript
// app/api/status/route.ts
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    deployment: process.env.VERCEL_DEPLOYMENT_ID,
    timestamp: new Date().toISOString(),
  });
}
```

### 3. Add Client-Side Verification

Show deployment info in the UI:

```typescript
'use client';

import { useEffect, useState } from 'react';

export function DeploymentBadge() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    fetch('/api/deployment-info')
      .then(res => res.json())
      .then(setInfo);
  }, []);

  return info ? (
    <div>Deployment: {info.deploymentId}</div>
  ) : null;
}
```

### 4. Add Monitoring/Analytics

Track cookie performance:

```typescript
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const hadCookie = request.cookies.has('__vdpl');

  // Log to your analytics service
  if (!hadCookie) {
    console.log('[Analytics] New session - cookie set');
  }

  return response;
}
```

## Troubleshooting Development Issues

### TypeScript Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Middleware Not Running

- Check `middleware.ts` is at the root
- Verify the `matcher` config
- Check for syntax errors

### Cookie Not Setting

- Ensure `VERCEL_DEPLOYMENT_ID` is available (or mocked)
- Check cookie attributes (Secure requires HTTPS)
- Verify browser DevTools → Application → Cookies

## Questions or Issues?

- Open an issue in the repository
- Check existing issues for similar problems
- Review Vercel and Next.js documentation

## Resources

- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Vercel Deployment Docs](https://vercel.com/docs/deployments)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

Thank you for contributing!
