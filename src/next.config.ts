
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Update headers to be compatible with Next.js 15
  async headers() {
    return [
        {
            source: '/api/:path*',
            headers: [
                { key: 'Access-Control-Allow-Origin', value: '*' },
                { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
                { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
            ]
        }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: 'https://scholarsage-ue2av.firebaseapp.com/__/auth/:path*',
      },
    ];
  },
};

export default nextConfig;
