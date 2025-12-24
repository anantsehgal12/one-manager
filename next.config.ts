import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL('https://uqimlvscgkepnsqxlugq.supabase.co/**'),
    ],
  },
};

export default nextConfig;
