/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@clinica/core"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
