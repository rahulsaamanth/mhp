/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    unoptimized: true,
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
        crypto: require.resolve("crypto-browserify"),
      }
    }
    return config
  },
  env: {
    PUBLIC_APP_URL: process.env.PUBLIC_APP_URL,
  },
}

export default nextConfig
