/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
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
}

export default nextConfig
