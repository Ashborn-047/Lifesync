/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable static export for GitHub Pages
  output: 'export',
  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },
  // Optional: Set base path if deploying to a subdirectory
  // basePath: process.env.NODE_ENV === 'production' ? '/Lifesync' : '',
  // trailingSlash: true,
};

export default nextConfig;
