/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mhp-local.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "healthyghar.com",
      },
    ],
    // domains: ["mhp-local.s3.ap-south-1.amazonaws.com", "healthyghar.com"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
      }
    }
    return config
  },
  env: {
    PUBLIC_APP_URL: process.env.PUBLIC_APP_URL,
  },
}

export default nextConfig
