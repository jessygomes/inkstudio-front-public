import SalonSearchToolbar from "@/components/TrouverUnSalon/SalonSearchToolbar";
import ListeSalon from "@/components/TrouverUnSalon/ListeSalon";
import { ArrowUpRight, Search as SearchIcon, UsersRound, Sparkles } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";
import { Suspense } from "react";
import Script from "next/script";
import { Metadata } from "next";





export const dynamic = "force-dynamic";

type TrouverUnSalonPageProps = {
  searchParams?: Promise<{
        query?: string | string[];
        city?: string | string[];
        style?: string | string[];
      }>;
};

export const metadata: Metadata = {
  title: "Trouver un salon de tatouage - Inkera | Annuaire France",
  description:
    "Trouvez facilement un salon de tatouage près de chez vous. Consultez les portfolios, filtrez par ville, style ou artiste. Annuaire complet des salons de tatouage en France.",
  keywords: [
    "trouver salon tatouage",
    "annuaire tatoueur france",
    "salon tatouage près de moi",
    "recherche tatoueur",
    "studio tatouage par ville",
    "portfolio tatoueur france",
    "réservation salon tatouage",
    "tatouage professionnel",
  ],
  openGraph: {
    title: "Trouver un salon de tatouage - Inkera",
    description:
      "Trouvez facilement un salon de tatouage près de chez vous. Consultez les portfolios et filtrez par ville ou style.",
    type: "website",
    locale: "fr_FR",
    url: "https://theinkera.com/trouver-un-salon",
    siteName: "Inkera",
    images: [
      {
        url: "https://theinkera.com/images/og-search.jpg",
        width: 1200,
        height: 630,
        alt: "Recherche de salons de tatouage sur Inkera",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trouver un salon de tatouage - Inkera",
    description: "Trouvez facilement un salon de tatouage près de chez vous.",
    images: ["https://theinkera.com/images/og-search.jpg"],
  },
  alternates: {
    canonical: "https://theinkera.com/trouver-un-salon",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

// Create a client component for the search functionality
function SearchContent() {
  return <SalonSearchToolbar />;
}

// Create a client component for the salon list
function SalonListContent() {
  return <ListeSalon />;
}

function SearchFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-white/60">Chargement...</div>
    </div>
  );
}

function SalonListFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-white/60">Chargement des salons...</div>
    </div>
  );
}

export default async function TrouverUnSalonPage({
  searchParams,
}: TrouverUnSalonPageProps) {
const resolvedSearchParams = searchParams
    ? await Promise.resolve(searchParams)
    : undefined;

  const getSingleParam = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

  const hasActiveSearch = Boolean(
    getSingleParam(resolvedSearchParams?.query) ||
      getSingleParam(resolvedSearchParams?.city) ||
      getSingleParam(resolvedSearchParams?.style),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Annuaire des salons de tatouage",
    description:
      "Recherchez et trouvez des salons de tatouage professionnels partout en France",
    url: "https://theinkera.com/trouver-un-salon",
    mainEntity: {
      "@type": "ItemList",
      name: "Salons de tatouage en France",
      description:
        "Liste des salons de tatouage partenaires avec portfolios et informations complètes",
      numberOfItems: "Variable selon la recherche",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://theinkera.com/trouver-un-salon?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    provider: {
      "@type": "Organization",
      name: "Inkera",
    },
    audience: {
      "@type": "Audience",
      audienceType: "Personnes recherchant un salon de tatouage",
    },
    about: [
      {
        "@type": "Thing",
        name: "Salon de tatouage",
      },
      {
        "@type": "Thing",
        name: "Piercing",
      },
      {
        "@type": "Thing",
        name: "Art corporel",
      },
    ],
  };

  return (
    <>
      <Script id="search-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-noir-700 font-one">
        <div className="w-full space-y-6 px-4 py-5 sm:px-6 sm:py-7 lg:px-10 xl:px-16">
          <header className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-tertiary-400/15 bg-tertiary-400/8 text-tertiary-400"><SearchIcon size={17} /></span><div><p className="mb-1 text-[9px] uppercase tracking-[0.16em] text-white/35">Une rencontre, un projet</p><h1 className="text-xl font-medium leading-tight tracking-tight text-white sm:text-2xl">Trouvez votre prochain artiste</h1><p className="mt-1 text-xs leading-6 text-white/45">Explorez les profils des salons et tatoueurs déjà présents sur Inkera.</p></div></div><span className="rounded-full border border-white/8 bg-white/[0.025] px-2.5 py-1.5 text-[9px] text-white/40">Annuaire complet en préparation</span></header>
          <div className="rounded-2xl border border-white/10 bg-noir-700 p-3 sm:p-4"><Suspense fallback={<SearchFallback />}><SearchContent /></Suspense></div>
          {hasActiveSearch ? <Suspense fallback={<SalonListFallback />}><SalonListContent /></Suspense> : <div className="space-y-4">
            <div className="rounded-2xl border border-dashed border-white/10 px-5 py-8 text-center"><SearchIcon size={26} className="mx-auto mb-3 text-white/20" /><h2 className="text-base text-white/80">Un nom, une ville, un univers…</h2><p className="mx-auto mt-2 max-w-md text-xs leading-6 text-white/40">Lancez une recherche pour découvrir les profils déjà consultables. L’annuaire complet ouvrira lorsque suffisamment de salons seront inscrits.</p></div>
            <div className="grid gap-3 sm:grid-cols-2"><article className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.015] p-4"><UsersRound size={17} className="mt-0.5 shrink-0 text-tertiary-400/70" /><div><h3 className="text-xs font-medium text-white/80">Des artistes déjà à découvrir</h3><p className="mt-1 text-[11px] leading-5 text-white/40">Consultez leurs créations, leurs spécialités et les informations utiles pour votre projet.</p></div></article><article className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.015] p-4"><Sparkles size={17} className="mt-0.5 shrink-0 text-tertiary-400/70" /><div><h3 className="text-xs font-medium text-white/80">Une communauté qui grandit</h3><p className="mt-1 text-[11px] leading-5 text-white/40">De nouveaux professionnels rejoignent Inkera. Revenez découvrir leurs univers.</p></div></article></div>
          </div>}
          <aside className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-5"><p className="text-xs text-white/40">Vous êtes tatoueur ou tatoueuse ? Faites découvrir votre univers.</p><AppButton href="/en-savoir-plus" variant="secondary" className="px-3! py-2! text-xs! shadow-none!">Découvrir Inkera<ArrowUpRight size={13} /></AppButton></aside>
        </div>
      </div>
    </>
  );
}