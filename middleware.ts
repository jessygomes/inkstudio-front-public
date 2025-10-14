import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
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
  ];
  if (allowedPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  // Autoriser la page profil salon : /salon/:slug/:loc (avec ou sans trailing slash)
  const salonRegex = /^\/salon\/[^\/]+\/[^\/]+\/?$/;
  // Autoriser la page de réservation : /salon/:slug/:loc/reserver (avec ou sans trailing slash)
  const salonBookingRegex = /^\/salon\/[^\/]+\/[^\/]+\/reserver\/?$/;

  if (salonRegex.test(pathname) || salonBookingRegex.test(pathname)) {
    return NextResponse.next();
  }
  // Tout le reste → 404 (page "n'existe pas")
  return new Response("Not Found", { status: 404 });
}

// Optionnel : limiter le matcher si vous voulez éviter d'exécuter le middleware pour certains patterns
export const config = {
  matcher:
    "/((?!_next/static|_next/image|_next|favicon.ico|robots.txt|sitemap.xml).*)",
};
