import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // WardAir uses native global CSS; the starter Tailwind loader required a
  // subprocess port that is unavailable in this build environment.

};

export default nextConfig;
