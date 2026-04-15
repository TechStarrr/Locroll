import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    // Bake the public Privy app ID at build time so prerendering works
    // when NEXT_PUBLIC_PRIVY_APP_ID isn't in the build environment
    NEXT_PUBLIC_PRIVY_APP_ID:
      process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "cmnyp5ijx00vb0cjx4n8wwcmy",
  },
};

export default nextConfig;
