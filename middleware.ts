import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Routes qui nécessitent une authentification
  const protectedRoutes = [
    "/mon-profil",
    "/mon-profil/modifier",
    "/mes-reservations",
    "/favoris",
  ];

  // Vérifier si la route nécessite une authentification
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const session = await auth();

    if (!session?.user) {
      // Rediriger vers la page de connexion
      const loginUrl = new URL("/se-connecter", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Autoriser les ressources internes / statiques / API
  const allowedPrefixes = [
    "/_next/",
    "/static/",
    "/favicon.ico",
    "/api/",
    "/_next/static/",
    "/robots.txt",
    "/sitemap.xml",
    "/salon",
    "/en-savoir-plus",
    "/rdv-request",
    "/contactez-nous",
    "/mentions-legales",
    "/politique-de-confidentialite",
    "/images/",
    "/creer-un-compte",
    "/se-connecter",
    "/mot-de-passe-oublie",
    "/verifier-email",
    "/trouver-un-salon",
    "/mon-profil",
    "/",
  ];

  if (allowedPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Autoriser spécifiquement les chunks Next.js avec des segments dynamiques
  if (
    pathname.includes("/_next/static/chunks/app/(root)/") &&
    (pathname.includes("%5B") || pathname.includes("[")) &&
    pathname.endsWith(".js")
  ) {
    return NextResponse.next();
  }

  // Autoriser la page profil salon : /salon/:slug/:loc (avec ou sans trailing slash)
  const salonRegex = /^\/salon\/[^\/]+\/[^\/]+\/?$/;
  // Autoriser la page de réservation : /salon/:slug/:loc/reserver (avec ou sans trailing slash)
  const salonBookingRegex = /^\/salon\/[^\/]+\/[^\/]+\/reserver\/?$/;

  if (salonRegex.test(pathname) || salonBookingRegex.test(pathname)) {
    return NextResponse.next();
  }

  // Autoriser les images par extension
  const imageExtensions = /\.(jpg|jpeg|png|gif|svg|webp|ico)$/i;
  if (imageExtensions.test(pathname)) {
    return NextResponse.next();
  }

  // Tout le reste → 404 (page "n'existe pas")
  return new Response("Not Found", { status: 404 });
}

// Limiter le matcher pour optimiser les performances
export const config = {
  matcher:
    "/((?!_next/static|_next/image|_next|favicon.ico|robots.txt|sitemap.xml).*)",
};
