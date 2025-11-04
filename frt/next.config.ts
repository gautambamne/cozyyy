import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname
  },
  images: {
    domains: ['res.cloudinary.com']
  }
};

export default nextConfig;
