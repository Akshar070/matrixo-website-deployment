/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    // Serve modern formats; AVIF/WebP are 30-60% smaller than the source PNGs.
    formats: ['image/avif', 'image/webp'],
    // Cache optimized derivatives for a year instead of re-optimizing constantly.
    minimumCacheTTL: 31536000,
    domains: [
      'images.unsplash.com',
      'avatars.githubusercontent.com',
      'tedxkprit.in',
      'firebasestorage.googleapis.com',  // Firebase Storage (profile photos, team photos, etc.)
      'lh3.googleusercontent.com',       // Google profile photos (Google sign-in)
    ],
  },
  experimental: {
    // These packages ship huge barrel files; without this every `import { FaUser }
    // from 'react-icons/fa'` drags in the whole icon set. Tree-shakes them per-import.
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
        // Static assets in /public are content-stable; let browsers and the CDN
        // hold on to them instead of re-fetching on every visit.
        source: '/:all*(png|jpg|jpeg|gif|svg|ico|webp|avif|woff|woff2|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
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
