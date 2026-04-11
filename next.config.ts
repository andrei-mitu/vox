import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,
    // Produces a self-contained server in .next/standalone — required for Docker.
    // Vercel ignores this setting and uses its own build pipeline.
    output: 'standalone',
};

export default nextConfig;
