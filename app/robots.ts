import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theinkera.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/salon/",
          "/en-savoir-plus",
          "/trouver-un-salon",
          "/contactez-nous",
        ],
        disallow: [
          "/api/",
          "/auth/",
          "/private/",
          "/_next/",
          "/static/",
          "/*.json",
          "/salon/*/*/reserver*", // Limiter le crawl des pages de réservation
          "/salon/*/test*", // Exclure les profils de test
          "/salon/*/demo*", // Exclure les profils de démo
        ],
        crawlDelay: 1,
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/salon/",
          "/en-savoir-plus",
          "/trouver-un-salon",
          "/contactez-nous",
          "/salon/*/reserver", // Permettre à Google d'indexer les réservations
        ],
        disallow: ["/api/", "/admin/", "/dashboard/", "/auth/", "/private/"],
      },
      {
        userAgent: "Bingbot",
        allow: [
          "/",
          "/salon/",
          "/en-savoir-plus",
          "/trouver-un-salon",
          "/contactez-nous",
        ],
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/auth/",
          "/private/",
          "/salon/*/reserver",
        ],
        crawlDelay: 2,
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-salons.xml`, // Si vous implémentez les sitemaps séparés
    ],
    host: baseUrl,
  };
}
