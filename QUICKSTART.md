# Quick Start Guide

Get up and running with custom skew protection in 5 minutes.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app running.

Note: In local development, you'll see "development" as the deployment ID since `VERCEL_DEPLOYMENT_ID` is only set on Vercel.

## Step 3: Deploy to Vercel

### Option A: Vercel CLI (Fastest)

```bash
# Install Vercel CLI if you haven't
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow the prompts to link/create your project
```

### Option B: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Click Deploy

## Step 4: Set Up GitHub Actions (Optional but Recommended)

1. **Get Vercel Token**
   - Visit [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Create a token and copy it

2. **Add to GitHub Secrets**
   - Go to your repo > Settings > Secrets and variables > Actions
   - Create new secret: `VERCEL_TOKEN`
   - Paste your token

3. **Link your project locally**
   ```bash
   vercel link
   ```

4. **Push to trigger deployment**
   ```bash
   git add .
   git commit -m "Setup complete"
   git push
   ```

## Step 5: Verify Skew Protection

1. Open your deployed app
2. Check the home page - you should see a deployment ID
3. Open DevTools > Application > Cookies
4. Look for the `__vdpl` cookie - it should match your deployment ID
5. Navigate to `/test` - the deployment ID should be the same
6. Call the API at `/api/deployment-info` - should return the same deployment ID

## What You Should See

- Home page displays deployment ID and cookie status
- `__vdpl` cookie set in browser
- All pages and API routes show the same deployment ID
- Cookie persists across navigation

## Testing During a Rollout

1. Make a change to your app (e.g., update text on the home page)
2. Deploy the change
3. While deployment is in progress:
   - Existing browser sessions stay on the old deployment
   - New incognito windows get the new deployment
4. This demonstrates skew protection working!

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Customize the cookie duration in `middleware.ts`
- Add your own pages and API routes
- Monitor deployments in the Vercel dashboard

## Need Help?

- Check [Vercel Skew Protection Docs](https://vercel.com/docs/deployments/skew-protection)
- Review [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- Open an issue in your repository
