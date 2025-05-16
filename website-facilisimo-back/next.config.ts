import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  eslint: {
    // ❗️Esto evitará que ESLint falle el build
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
