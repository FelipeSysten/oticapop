import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export estático: `npm run build` gera a pasta out/ (Vercel, Netlify ou qualquer host estático)
  output: "export",
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
