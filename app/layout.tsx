import type { Metadata } from "next";
import localFont from "next/font/local";
import { Didact_Gothic, Exo_2, Montserrat_Alternates } from "next/font/google";
import { Toaster } from "@/components/Shared/Sonner";
import "./globals.css";
import { CookieConsentProvider } from "@/components/Analytics/CookieConsentContext";
import GoogleAnalytics from "@/components/Analytics/GoogleAnalytics";
import CookieBanner from "@/components/Analytics/CookieBanner";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${didact_gothic.variable} ${exo_2.variable} ${montserrat_alternates.variable} ${walkway.variable} antialiased relative`}
      >
        <CookieConsentProvider>
          <GoogleAnalytics measurementId="G-YG3WKCC1JL" />
          <Toaster />
          <CookieBanner />
          <main>{children}</main>
        </CookieConsentProvider>
      </body>
    </html>
  );
}
