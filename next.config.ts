import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=2070&auto=format&fit=crop')],
    /* config options here */
  }
};

  export default nextConfig;
