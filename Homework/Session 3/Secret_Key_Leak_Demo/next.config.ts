import path from "node:path";
import type { NextConfig } from "next";

// Intentionally minimal. Do NOT add an `env: { DEMO_MOCK_API_KEY: ... }` block here:
// next.config `env` inlines values into the client bundle, exactly like NEXT_PUBLIC_.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: { root: path.resolve(process.cwd()) }, // pin the project root (a stray lockfile higher up would confuse detection)
};

export default nextConfig;
