
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove "output: export" for development to enable dynamic features
  // output: "export", // Only use this for production static builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;