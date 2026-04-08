import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      { source: '/c', destination: '/' },
      { source: '/s', destination: '/' },
      { source: '/stay', destination: '/' },
      { source: '/membership', destination: '/' },
      { source: '/status', destination: '/' },
      { source: '/lucy', destination: '/' },
      { source: '/admin_status', destination: '/' },
      { source: '/chat', destination: '/' },
    ];
  },
};

export default nextConfig;
