import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      { source: '/c', destination: '/' },
      { source: '/s', destination: '/' },
      { source: '/membership', destination: '/' },
      { source: '/status', destination: '/' },
      { source: '/admin_status', destination: '/' },
    ];
  },
};

export default nextConfig;
