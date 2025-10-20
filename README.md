# Custom Skew Protection for Next.js on Vercel

A Next.js application demonstrating manual skew protection using the `__vdpl` cookie in middleware to pin users to specific deployments during rollouts.

## What is Skew Protection?

During a deployment rollout, users can hit different versions of your app:
- HTML from deployment A
- JavaScript from deployment B
- API calls to deployment C

This causes errors and broken functionality. **Skew protection** ensures users stay on one deployment version by setting a `__vdpl` cookie that Vercel uses to route all requests consistently.

## How This Works

1. **Middleware intercepts requests** - `middleware.ts` runs on every request
2. **Cookie is set** - Sets `__vdpl` cookie to current `VERCEL_DEPLOYMENT_ID`
3. **User is pinned** - All subsequent requests (HTML, JS, API) include this cookie
4. **Vercel routes consistently** - Routes all requests with same cookie to same deployment

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID;

  if (!request.cookies.has('__vdpl') && deploymentId) {
    response.cookies.set({
      name: '__vdpl',
      value: deploymentId,
      path: '/',
      maxAge: 3600,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
  }

  return response;
}
```

## Project Structure

```
custom-skew-protection/
├── middleware.ts              # Sets __vdpl cookie
├── app/
│   ├── page.tsx              # Home page (shows deployment info)
│   ├── test/page.tsx         # Test page (verifies consistency)
│   └── api/deployment-info/  # API endpoint (returns deployment data)
├── .github/workflows/
│   ├── deploy.yml            # Production deployment (main branch)
│   └── preview.yml           # Preview deployment (other branches)
└── package.json
```

## Setup

### 1. Install and Run Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` (deployment ID will show as "development" locally).

### 2. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### 3. GitHub Actions (Optional)

For automated deployments:

1. **Link project locally:**
   ```bash
   vercel link
   ```

2. **Get credentials:**
   - Token: [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - IDs: `cat .vercel/project.json` (orgId and projectId)

3. **Add GitHub Secrets** (Settings → Secrets → Actions):
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

4. **Push to deploy:**
   ```bash
   git push origin main        # Production
   git push origin feature/*   # Preview
   ```

## Testing

1. **Check deployment info** - Home page displays current deployment ID and cookie value
2. **Verify cookie** - DevTools → Application → Cookies → Look for `__vdpl`
3. **Test navigation** - Visit `/test` page, should show same deployment ID
4. **Test API** - Visit `/api/deployment-info`, returns same deployment ID
5. **Test rollout** - Deploy new version, existing sessions stay on old deployment

## How Skew Protection Works in Practice

```
User A visits (10:00 AM)
└─ Gets cookie: __vdpl=deployment-v1
   └─ Stays on v1 for 1 hour

New deployment v2 released (10:30 AM)

User A still has __vdpl=deployment-v1
└─ Continues using v1 (no disruption)

User B visits (10:35 AM)
└─ Gets cookie: __vdpl=deployment-v2
   └─ Uses new v2 deployment
```

## Key Files

- **`middleware.ts`** - Core skew protection logic (26.5 kB)
- **`.github/workflows/deploy.yml`** - Production deployment workflow
- **`.github/workflows/preview.yml`** - Preview deployment workflow
- **`.github/SETUP.md`** - Detailed GitHub Actions setup guide

## Configuration

Cookie settings in `middleware.ts`:

```typescript
{
  maxAge: 3600,        // 1 hour (adjust as needed)
  httpOnly: true,      // Not accessible via JavaScript
  secure: true,        // HTTPS only in production
  sameSite: 'lax',     // CSRF protection
}
```

## Environment Variables

Auto-set by Vercel, no manual configuration needed:

- `VERCEL_DEPLOYMENT_ID` - Unique deployment identifier
- `VERCEL_ENV` - Environment (production/preview/development)
- `VERCEL_REGION` - Deployment region

## Troubleshooting

**Cookie not setting?**
- Check `VERCEL_DEPLOYMENT_ID` exists (only set on Vercel, not locally)
- Verify middleware is running (check console logs)

**Different deployment IDs on different requests?**
- Cookie expired (default 1 hour)
- User cleared cookies
- New deployment rolled out and user got new session

**GitHub Actions failing?**
- Verify all 3 secrets are set correctly
- Ensure `vercel link` was run locally
- Check Actions tab logs for specific errors

## Resources

- [Vercel Skew Protection Docs](https://vercel.com/docs/deployments/skew-protection)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [GitHub Actions Setup](.github/SETUP.md)

## License

MIT
