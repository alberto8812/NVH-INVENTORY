import type { NextConfig } from "next";

// `output: "standalone"` is required by the Dockerfile, which runs the
// self-contained server emitted to `.next/standalone`. Vercel packages the
// build with its own pipeline and fails on the standalone layout, so the
// option is only applied outside Vercel (VERCEL=1 is set by the platform).
const isVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  ...(isVercel ? {} : { output: "standalone" }),
};

export default nextConfig;
