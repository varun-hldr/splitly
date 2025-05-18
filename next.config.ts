
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
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      { // For Cloudinary images
        protocol: 'https',
        hostname: 'res.cloudinary.com', 
        port: '',
        pathname: '/**',
      },
      { // For Auth0 user pictures
        protocol: 'https',
        hostname: 's.gravatar.com',
        port: '',
        pathname: '/**',
      },
      { // For Auth0 user pictures (Google, etc.)
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // env: { // Removed NEXT_PUBLIC_ADMIN_SECRET_KEY_SET
  //   NEXT_PUBLIC_ADMIN_SECRET_KEY_SET: process.env.ADMIN_SECRET_KEY ? 'true' : 'false',
  // }
};

export default nextConfig;
