import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const deploymentCookie = cookieStore.get('__vdpl');

  const deploymentInfo = {
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'development',
    environment: process.env.VERCEL_ENV || 'development',
    region: process.env.VERCEL_REGION || 'local',
    cookieValue: deploymentCookie?.value || null,
    timestamp: new Date().toISOString(),
    message: deploymentCookie?.value
      ? '✓ Skew protection active - pinned to deployment'
      : '⚠ Cookie not set yet',
  };

  return NextResponse.json(deploymentInfo, {
    headers: {
      'Content-Type': 'application/json',
      'X-Deployment-ID': deploymentInfo.deploymentId,
    },
  });
}
