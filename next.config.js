/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // optional, allows building even if TS has type errors
  },
  images: {
    unoptimized: true, // disables image optimization (useful if you don’t need Next.js Image optimization)
  },
}

module.exports = nextConfig;
