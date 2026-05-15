import { MetadataRoute } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.theinkera.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/dashboard/",
        "/auth/",
        "/private/",
        "/_next/",
        "/static/",
        "/*.json",
        "/salon/*/reserver",
        "/salon/*/reserver/",
        "/salon/*/reserver*",
        "/salon/*/test*",
        "/salon/*/demo*",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}