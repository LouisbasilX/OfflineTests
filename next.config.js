/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
  // Disable image optimization for static export if needed
  images: {
    unoptimized: true,
  },
  // Vercel serverless functions configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://offlinetests-api.vercel.app/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig