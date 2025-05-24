import type {NextConfig} from 'next';

const withPWA = require('next-pwa')({
  dest: 'public', // Destination directory for the PWA files
  register: true, // Register the Service Worker
  skipWaiting: true, // Skip the waiting phase and activate the new Service Worker immediately
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development to avoid caching issues
  // sw: 'sw.js', // Default name for the service worker file
  // customWorkerDir: 'src/worker', // if you have a custom worker
});

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
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA(nextConfig);
