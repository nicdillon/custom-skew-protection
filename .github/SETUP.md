# GitHub Actions Setup Guide

This guide explains how to configure GitHub Actions for automated Vercel deployments.

## Overview

This repository includes two workflows:

1. **Production Deployment** (`.github/workflows/deploy.yml`)
   - Triggers on pushes to `main` branch
   - Deploys to production environment

2. **Preview Deployment** (`.github/workflows/preview.yml`)
   - Triggers on pushes to all other branches
   - Creates preview deployments

## Required Secrets

You need to configure **three secrets** in your GitHub repository:

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `VERCEL_TOKEN` | Vercel API access token | [Account Settings → Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Your organization/team ID | `.vercel/project.json` after running `vercel link` |
| `VERCEL_PROJECT_ID` | Your project ID | `.vercel/project.json` after running `vercel link` |

## Step-by-Step Setup

### 1. Link Your Project Locally

First, link your local project to Vercel:

```bash
# Login to Vercel (if not already)
vercel login

# Link to your project
vercel link
```

Follow the prompts to:
- Select your scope (personal account or team)
- Choose "Link to existing project" or "Create new project"
- Confirm the project settings

This creates a `.vercel` directory with a `project.json` file.

### 2. Get Organization and Project IDs

View your `.vercel/project.json` file:

```bash
cat .vercel/project.json
```

You'll see something like:

```json
{
  "orgId": "team_xxxxxxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxxxxxx"
}
```

**Note:** Keep these values handy for the next step.

**Important:** Don't commit `.vercel/project.json` to Git (it's already in `.gitignore`). These values should be stored as GitHub Secrets.

### 3. Get Vercel API Token

1. Go to [Vercel Account Settings → Tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Give it a name (e.g., "GitHub Actions")
4. Select an expiration (or choose "No Expiration")
5. Click "Create"
6. **Copy the token immediately** (you won't be able to see it again)

### 4. Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add each of the three secrets:

#### Secret 1: VERCEL_TOKEN
- **Name:** `VERCEL_TOKEN`
- **Value:** Paste the token from step 3
- Click "Add secret"

#### Secret 2: VERCEL_ORG_ID
- **Name:** `VERCEL_ORG_ID`
- **Value:** Paste the `orgId` from `.vercel/project.json`
- Click "Add secret"

#### Secret 3: VERCEL_PROJECT_ID
- **Name:** `VERCEL_PROJECT_ID`
- **Value:** Paste the `projectId` from `.vercel/project.json`
- Click "Add secret"

### 5. Verify Configuration

After adding all three secrets, you should see them listed in:
**Settings** → **Secrets and variables** → **Actions** → **Repository secrets**

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### 6. Test the Workflows

#### Test Production Deployment

Push to the `main` branch:

```bash
git add .
git commit -m "Test production deployment"
git push origin main
```

- Go to your repo's **Actions** tab
- You should see "Vercel Production Deployment" running
- Once complete, check your Vercel dashboard for the production deployment

#### Test Preview Deployment

Create and push to a feature branch:

```bash
git checkout -b feature/test
git push origin feature/test
```

- Go to your repo's **Actions** tab
- You should see "Vercel Preview Deployment" running
- Once complete, check your Vercel dashboard for the preview deployment

## Workflow Details

### Production Workflow

```yaml
name: Vercel Production Deployment
env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
on:
  push:
    branches:
      - main
```

**Steps:**
1. Checkout code
2. Install Vercel CLI
3. Pull Vercel environment information (production)
4. Build project artifacts with `vercel build --prod`
5. Deploy with `vercel deploy --prebuilt --prod`

### Preview Workflow

```yaml
name: Vercel Preview Deployment
env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
on:
  push:
    branches-ignore:
      - main
```

**Steps:**
1. Checkout code
2. Install Vercel CLI
3. Pull Vercel environment information (preview)
4. Build project artifacts with `vercel build`
5. Deploy with `vercel deploy --prebuilt`

## Troubleshooting

### Workflow Fails with "Forbidden" Error

**Cause:** Invalid or missing `VERCEL_TOKEN`

**Solution:**
- Regenerate token in Vercel dashboard
- Update the `VERCEL_TOKEN` secret in GitHub

### Workflow Fails with "Project Not Found"

**Cause:** Incorrect `VERCEL_PROJECT_ID` or `VERCEL_ORG_ID`

**Solution:**
- Run `vercel link` locally again
- Verify IDs in `.vercel/project.json`
- Update the secrets in GitHub

### Workflow Doesn't Trigger

**Cause:** Pushing to wrong branch or workflow file syntax error

**Solution:**
- Check you're pushing to `main` (for production) or another branch (for preview)
- Validate YAML syntax in workflow files
- Check the **Actions** tab for any errors

### Build Fails During Deployment

**Cause:** Build error in the code

**Solution:**
- Test build locally: `npm run build`
- Fix any TypeScript or ESLint errors
- Push the fixes

## Security Best Practices

1. **Never commit secrets** - `.vercel/project.json` is in `.gitignore`
2. **Rotate tokens regularly** - Update `VERCEL_TOKEN` periodically
3. **Use scoped tokens** - If possible, create tokens with minimal permissions
4. **Limit access** - Only trusted collaborators should have access to secrets

## Additional Resources

- [Vercel GitHub Actions Guide](https://vercel.com/guides/how-can-i-use-github-actions-with-vercel)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

## Support

If you encounter issues:

1. Check workflow logs in GitHub Actions tab
2. Review Vercel deployment logs in dashboard
3. Verify all three secrets are correctly configured
4. Ensure you've run `vercel link` locally

For more help, see the main [README.md](../README.md) or [QUICKSTART.md](../QUICKSTART.md).
