/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Gzip/brotli the HTML and JSON payloads Next serves itself.
  compress: true,
  // Drops the `X-Powered-By: Next.js` header (one less byte-for-nothing on every response).
  poweredByHeader: false,
  images: {
    // AVIF/WebP are typically 30-60% smaller than the source PNG/JPEG.
    formats: ['image/avif', 'image/webp'],
    // Hold optimized derivatives for a year rather than re-optimizing repeatedly.
    minimumCacheTTL: 31536000,
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com', 'tedxkprit.in', 'firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  experimental: {
    // These ship huge barrel files: without this, `import { FaUser } from
    // 'react-icons/fa'` pulls in the entire icon set. Tree-shakes per-import,
    // which is the bulk of the "reduce unused JavaScript" finding.
    optimizePackageImports: [
      'react-icons',
      'react-icons/fa',
      'lucide-react',
      'framer-motion',
      'date-fns',
      'recharts',
    ],
  },
  async headers() {
    return [
      {
        // Files in /public are content-stable, so let browsers and the CDN keep
        // them instead of refetching on every visit ("use efficient cache lifetimes").
        source: '/:all*(png|jpg|jpeg|gif|svg|ico|webp|avif|woff|woff2|ttf|otf)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // ads.txt must stay fresh enough for Google's crawler to pick up changes.
        source: '/ads.txt',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/events/tedxkprit',
        destination: '/events/tedxkprit-2025-break-the-loop',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
