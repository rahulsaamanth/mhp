/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    domains: ["mhp-local.s3.ap-south-1.amazonaws.com", "healthyghar.com"],
  },
}

export default nextConfig
