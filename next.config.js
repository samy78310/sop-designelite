/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "app.claap.io",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["pg"],
  },
};

module.exports = nextConfig;
