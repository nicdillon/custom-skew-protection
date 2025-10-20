import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware for Vercel deployment skew protection.
 *
 * This middleware sets the __vdpl (Vercel Deployment Lock) cookie to pin
 * the user's session to a specific deployment. This prevents issues where
 * users might hit different deployments during a rollout.
 *
 * How it works:
 * 1. Checks if __vdpl cookie exists in the request
 * 2. If not, sets it to the current deployment ID from VERCEL_DEPLOYMENT_ID
 * 3. If it exists, the cookie will be sent with all requests (HTML, assets, API)
 * 4. Vercel routes all requests with the same __vdpl to the same deployment
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Check if the __vdpl cookie is already set
  const deploymentCookie = request.cookies.get('__vdpl');

  // Get the current deployment ID from Vercel environment variable
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID;

  // If no cookie exists and we have a deployment ID, set the cookie
  if (!deploymentCookie && deploymentId) {
    // Set the __vdpl cookie to pin this session to the current deployment
    response.cookies.set({
      name: '__vdpl',
      value: deploymentId,
      path: '/',
      // Cookie will last for 5 minutes
      maxAge: 300,
      // Secure in production (HTTPS only)
      secure: process.env.NODE_ENV === 'production',
      // HttpOnly for security
      httpOnly: true,
      // SameSite to prevent CSRF
      sameSite: 'lax',
    });

    console.log(`[Skew Protection] Set __vdpl cookie to deployment: ${deploymentId}`);
  } else if (deploymentCookie) {
    console.log(`[Skew Protection] Using existing __vdpl: ${deploymentCookie.value}`);
  }

  // Add deployment info to response headers for debugging
  if (deploymentId) {
    response.headers.set('X-Deployment-ID', deploymentId);
  }

  // Cache pages for the same duration as the cookie (5 minutes)
  // This ensures users don't get new HTML while their cookie is still valid
  const maxAge = 300; // 5 minutes (matches cookie maxAge)

  // Set cache headers that respect the deployment cookie
  // Using 'private' because cache is specific to each user's deployment
  response.headers.set(
    'Cache-Control',
    `private, max-age=${maxAge}, must-revalidate`
  );

  // Add Vary header to ensure cache varies by Cookie
  response.headers.set('Vary', 'Cookie');

  return response;
}

// Apply middleware to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Note: We still want middleware to run on API routes and pages
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
