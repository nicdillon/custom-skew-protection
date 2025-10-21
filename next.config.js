/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // HTML only: exclude Next assets & common static files
        source: '/((?!_next/|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|map)).*)',
        headers: [
          { key: 'Vercel-CDN-Cache-Control', value: 'no-store' },      // no CDN cache
          { key: 'Cache-Control', value: 'public, max-age=300' }       // 5 min browser
        ]
      }
    ];
  }
}

module.exports = nextConfig
