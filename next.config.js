/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'avatars.githubusercontent.com',
      'tedxkprit.in',
      'firebasestorage.googleapis.com',  // Firebase Storage (profile photos, team photos, etc.)
      'lh3.googleusercontent.com',       // Google profile photos (Google sign-in)
    ],
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
