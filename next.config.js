/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...existing config...

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

module.exports = nextConfig;
