/** @type {import('next').NextConfig} */
const nextConfig = {
  // This repo also contains a separate Vite app (src/) with its own
  // eslint.config.js that isn't set up for Next.js's linting rules.
  // Linting is run separately via `npm run lint`.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
