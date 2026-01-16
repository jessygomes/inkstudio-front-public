/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Didact_Gothic, Exo_2, Montserrat_Alternates } from "next/font/google";
import { Toaster } from "@/components/Shared/Sonner";
import "./globals.css";
import { CookieConsentProvider } from "@/components/Analytics/CookieConsentContext";
import GoogleAnalytics from "@/components/Analytics/GoogleAnalytics";
import CookieBanner from "@/components/Analytics/CookieBanner";
import { UserProvider } from "@/components/Context/UserContext";
import { AuthProvider } from "@/components/Auth/AuthProvider";
import { MessagingProvider } from "@/components/Context/MessageProvider";
import { auth } from "@/auth";

const didact_gothic = Didact_Gothic({
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-one",
});

const exo_2 = Exo_2({
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-two",
});

const montserrat_alternates = Montserrat_Alternates({
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-three",
});

const walkway = localFont({
  src: [
    {
      path: "./../public/fonts/Walkway_Bold.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./../public/fonts/Walkway_Black.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-cuatro", // optionnel : te permet d’utiliser la font comme variable CSS
  display: "swap", // bon pour les performances
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://theinkera.com"
  ),
  title: {
    default: "Inkera - Trouvez votre salon de tatouage idéal",
    template: "%s | Inkera",
  },
  description:
    "Découvrez les meilleurs salons de tatouage près de chez vous. Réservez en ligne, consultez les portfolios et trouvez l'artiste tatoueur parfait pour votre projet.",
  keywords: [
    "tatouage",
    "salon tatouage",
    "tatoueur",
    "réservation tatouage",
    "art corporel",
    "ink",
    "tattoo",
    "piercing",
    "studio tatouage",
  ],
  authors: [{ name: "Inkera" }],
  creator: "Inkera",
  publisher: "Inkera",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "Inkera",
    title: "Inkera - Trouvez votre salon de tatouage idéal",
    description:
      "Découvrez les meilleurs salons de tatouage près de chez vous. Réservez en ligne, consultez les portfolios et trouvez l'artiste tatoueur parfait.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Inkera - Plateforme de salons de tatouage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@inkstudio",
    creator: "@inkstudio",
    title: "Inkera - Trouvez votre salon de tatouage idéal",
    description:
      "Découvrez les meilleurs salons de tatouage près de chez vous.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL,
  },
  verification: {
    google: "votre-code-google-verification",
    yandex: "votre-code-yandex",
  },
  category: "Business",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  // Layout : seulement les données essentielles pour l'auth
  let user = {
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    image: "",
    birthDate: "",
    role: "",
    isAuthenticated: false,
    clientProfile: null,
  };

  if (session?.user) {
    user = {
      id: session.user.id || "",
      firstName: session.user.firstName || "",
      lastName: session.user.lastName || "",
      email: session.user.email || "",
      phone: session.user.phone || "",
      image: session.user.image || "",
      birthDate: "",
      role: session.user.role || "client",
      isAuthenticated: true,
      clientProfile: (session.user as any).clientProfile || null,
    };
  }

  return (
    <html lang="fr">
      <body
        className={`${didact_gothic.variable} ${exo_2.variable} ${montserrat_alternates.variable} ${walkway.variable} antialiased relative`}
      >
        <AuthProvider>
          <MessagingProvider>
            <CookieConsentProvider>
              <GoogleAnalytics measurementId="G-YG3WKCC1JL" />
              <Toaster />
              <CookieBanner />
              <main>
                <UserProvider user={user}>{children}</UserProvider>
              </main>
            </CookieConsentProvider>
          </MessagingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
