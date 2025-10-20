# Architecture Overview

## Skew Protection Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ 1. Initial Request
                                │    (no __vdpl cookie)
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Vercel Edge Network                        │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Next.js Middleware                           │ │
│  │              (middleware.ts)                              │ │
│  │                                                           │ │
│  │  1. Check for __vdpl cookie                             │ │
│  │  2. If missing, set to VERCEL_DEPLOYMENT_ID             │ │
│  │  3. Cookie config: HttpOnly, Secure, SameSite=lax       │ │
│  │  4. Max age: 1 hour                                      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ 2. Route to Deployment
                                │    (deployment-abc123)
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Deployment: abc123                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │   Pages      │  │  API Routes  │  │   Static Assets     │  │
│  │  (SSR/SSG)   │  │              │  │   (JS, CSS, etc)    │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
│                                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ 3. Response + Set-Cookie header
                                │    Set-Cookie: __vdpl=abc123
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│                                                                 │
│  Cookie stored: __vdpl=abc123                                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ 4. Subsequent Requests
                                │    Cookie: __vdpl=abc123
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Vercel Edge Network                        │
│                                                                 │
│  Sees __vdpl=abc123 → Routes to deployment abc123             │
│                                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ All requests pinned to abc123
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Deployment: abc123                          │
│                     (Consistent version)                        │
└─────────────────────────────────────────────────────────────────┘
```

## GitHub Actions Deployment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Developer                               │
│                                                                 │
│  git push origin main                                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                       GitHub Actions                            │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 1. Checkout Code                                          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 2. Setup Node.js 20                                       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 3. Install Dependencies (npm ci)                          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 4. vercel pull --environment=production                   │ │
│  │    (Fetch project config)                                 │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 5. vercel build --prod                                    │ │
│  │    • Runs next build                                      │ │
│  │    • Generates .vercel/output                             │ │
│  │    • Creates production-optimized bundle                  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 6. vercel deploy --prebuilt --prod                        │ │
│  │    • Uploads .vercel/output                               │ │
│  │    • No rebuild on Vercel servers                         │ │
│  │    • Faster, consistent deployments                       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Vercel Platform                            │
│                                                                 │
│  • New deployment created: def456                              │
│  • Gradual rollout begins                                      │
│  • Existing sessions stay on abc123 (__vdpl cookie)           │
│  • New sessions get def456                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Cookie Lifecycle

```
Timeline:
────────────────────────────────────────────────────────────────

T0: User visits site (first time)
│
├─ No __vdpl cookie exists
├─ Middleware sets: __vdpl=abc123
├─ Max-Age: 3600 seconds (1 hour)
└─ User pinned to deployment abc123

T1: User navigates to /test
│
├─ Browser sends: Cookie: __vdpl=abc123
├─ Vercel routes to deployment abc123
└─ Consistent experience

T2: User calls API (/api/deployment-info)
│
├─ Browser sends: Cookie: __vdpl=abc123
├─ API served from deployment abc123
└─ No version skew

T3: User loads JS/CSS assets
│
├─ Browser sends: Cookie: __vdpl=abc123
├─ Assets from deployment abc123
└─ All resources match

T+3600s: Cookie expires (1 hour later)
│
├─ __vdpl cookie removed
├─ Next request gets new deployment
└─ May be abc123 or newer deployment

New Deployment (def456) released at T+1800s:
│
├─ Users with __vdpl=abc123 stay on abc123
├─ New users (no cookie) get def456
└─ Gradual rollout, no skew issues
```

## File Structure & Responsibilities

```
custom-skew-protection/
│
├── middleware.ts                    ← SKEW PROTECTION CORE
│   └── Sets __vdpl cookie on all requests
│
├── app/
│   ├── layout.tsx                   ← Root layout
│   ├── page.tsx                     ← Home (shows deployment info)
│   ├── test/page.tsx                ← Test page (verify consistency)
│   └── api/
│       └── deployment-info/
│           └── route.ts             ← API (verify API consistency)
│
├── .github/workflows/
│   └── deploy.yml                   ← CI/CD PIPELINE
│       ├── Builds with: vercel build --prod
│       └── Deploys with: vercel deploy --prebuilt
│
└── Configuration Files
    ├── next.config.js               ← Next.js config
    ├── package.json                 ← Dependencies
    ├── tsconfig.json                ← TypeScript config
    └── vercel.json                  ← Vercel config
```

## Key Concepts

### 1. Middleware Execution Order

```
Request → Middleware → Route Handler → Response
          ↑
          └─ Sets __vdpl cookie BEFORE any route executes
```

### 2. Cookie Attributes

```typescript
{
  name: '__vdpl',
  value: 'abc123',         // Deployment ID
  path: '/',               // All routes
  maxAge: 3600,            // 1 hour
  httpOnly: true,          // Not accessible via JS
  secure: true,            // HTTPS only (production)
  sameSite: 'lax',         // CSRF protection
}
```

### 3. Deployment Pinning

```
Deployment abc123 (10:00 AM)
└─ User A visits (10:05 AM)
   └─ Gets __vdpl=abc123

Deployment def456 (10:30 AM)  ← New version deployed
└─ User A still has __vdpl=abc123
   └─ Stays on abc123 (no disruption)

└─ User B visits (10:35 AM)
   └─ Gets __vdpl=def456 (new deployment)
```

## Benefits Visualization

### Without Skew Protection:
```
User Request Flow:
├─ HTML from deployment-v2
├─ JS from deployment-v3
├─ API call to deployment-v1
└─ Result: Version mismatch errors! ❌
```

### With Skew Protection:
```
User Request Flow:
├─ HTML from deployment-v2 (__vdpl=v2)
├─ JS from deployment-v2 (__vdpl=v2)
├─ API call to deployment-v2 (__vdpl=v2)
└─ Result: Consistent experience! ✅
```

## Monitoring & Debugging

### Check Cookie in DevTools:
```
Application → Cookies → __vdpl
└─ Should match deployment ID on page
```

### Check Headers:
```
Response Headers:
├─ Set-Cookie: __vdpl=abc123; ...
└─ X-Deployment-ID: abc123
```

### Verify in Code:
```typescript
// Server-side (pages/API)
const deploymentId = process.env.VERCEL_DEPLOYMENT_ID;
const cookie = cookies().get('__vdpl');

console.log('Match:', cookie?.value === deploymentId);
```
