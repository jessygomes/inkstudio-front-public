import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io", pathname: "/**" },
      { protocol: "https", hostname: "*.ufs.sh", pathname: "/**" },
      { protocol: "https", hostname: "theinkera.com", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // SEO optimizations
  trailingSlash: false,

  // Compression et optimisations
  compress: true,

  // Headers SEO
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600",
          },
        ],
      },
    ];
  },

  // Redirections SEO
  async redirects() {
    return [
      {
        source: "/salon/:slug/:loc/booking",
        destination: "/salon/:slug/:loc/reserver",
        permanent: true,
      },
      {
        source: "/tattoo-shop/:path*",
        destination: "/salon/:path*",
        permanent: true,
      },
    ];
  },

  // Rewrites pour URLs propres
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap",
      },
    ];
  },
};

export default nextConfig;
