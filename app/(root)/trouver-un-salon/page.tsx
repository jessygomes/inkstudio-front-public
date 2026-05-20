/* eslint-disable react/no-unescaped-entities */
import { Search } from "@/components/Shared/Search/Search";
import ListeSalon from "@/components/TrouverUnSalon/ListeSalon";
import { IoBusinessOutline } from "react-icons/io5";
import { Suspense } from "react";
import Script from "next/script";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MdNotificationsActive } from "react-icons/md";
import { HiMiniRocketLaunch } from "react-icons/hi2";

export const dynamic = "force-dynamic";

type TrouverUnSalonPageProps = {
  searchParams?:
    | {
        query?: string | string[];
        city?: string | string[];
        style?: string | string[];
      }
    | Promise<{
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
  return <Search />;
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
  const headerBackgroundPhotos = [
    "/photos/womensit.jpg",
    "/photos/tatas.jpg",
    "/photos/conf.jpg",
  ];

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
    // <>
    //   {/* JSON-LD Script */}
    //   <Script
    //     id="search-jsonld"
    //     type="application/ld+json"
    //     dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    //   />

    //   <div className="min-h-screen">
    //     <section className="px-4 sm:px-8 lg:px-20 pt-23 bg-noir-700">
    //       {/* Header */}
    //       <div className="mb-6 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
    //         <div className="flex items-center gap-4">
    //           <div className="w-12 h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center ">
    //             <IoBusinessOutline
    //               size={28}
    //               className="text-tertiary-400 animate-pulse"
    //             />
    //           </div>
    //           <div>
    //             <h1 className="text-xl font-bold text-white font-var(--font-one) tracking-wide uppercase mb-1">
    //               Trouver mon salon
    //             </h1>
    //             <p className="text-white/60 text-xs font-var(--font-one)">
    //               Trouvez facilement un salon de tatouage près de chez vous.
    //               Filtrez par ville, style ou artiste.
    //             </p>
    //           </div>
    //         </div>
    //       </div>

    //       <Suspense fallback={<SearchFallback />}>
    //         <SearchContent />
    //       </Suspense>

    //       <div className="py-6">
    //         <Suspense fallback={<SalonListFallback />}>
    //           <SalonListContent />
    //         </Suspense>
    //       </div>
    //     </section>
    //   </div>
    // </>

    <>
      {/* JSON-LD Script */}
      <Script
        id="search-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-linear-to-t from-noir-700 via-noir-700 to-noir-700">
        <div className="mx-auto px-4 py-6 sm:px-8 sm:py-8 lg:py-10">
          {/* Coming Soon Card */}
          <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] sm:min-h-[calc(100vh-11rem)]">
            <div className="text-center space-y-8 w-full sm:mx-10">
              {/* Icon */}
              {/* <div className="flex justify-center">
                <div className="w-24 h-24 bg-linear-to-br from-tertiary-400/30 to-cuatro-500/30 rounded-full flex items-center justify-center border-2 border-tertiary-400/50 animate-pulse">
                  <HiMiniRocketLaunch className="w-12 h-12 text-tertiary-400" />
                </div>
              </div> */}

              {/* Heading */}
              <div className="relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 grid grid-cols-3 w-full h-full p-4">
                  {headerBackgroundPhotos.map((photo, index) => (
                    <div key={`${photo}-${index}`} className="relative h-full w-full">
                      <Image
                        src={photo}
                        alt={`Fond header ${index + 1}`}
                        fill
                        className="object-cover rounded-2xl"
                        sizes="(max-width: 768px) 33vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 bg-noir-700/70 backdrop-blur-[10px]" />

                <div className="relative z-10 space-y-3 px-6 py-10 sm:px-8 sm:py-12">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-one tracking-wide">
                    Bientôt disponible
                  </h1>
                  <p className="text-sm leading-relaxed text-white/70 font-one sm:text-sm px-4 rounded-2xl">
                    L'annuaire sera disponible quand il y aura suffisamment de salons inscrits pour offrir une expérience riche et pertinente.
                  </p>
                </div>
              </div>

              {/* Recherche déjà disponible */}
              <div className="backdrop-blur-lg text-left shadow-lg shadow-noir-700/40 ">
                <div className="flex items-start gap-3 mb-4">
                  <IoBusinessOutline className="w-6 h-6 text-tertiary-400 shrink-0 mt-0.5" />
                  <div>
                    <h2 className="text-white font-one font-semibold text-md">
                      Recherche active
                    </h2>
                    <p className="text-white/80 font-one text-xs mt-1">
                      Vous pouvez déjà rechercher un salon ou un artiste inscrit via la barre de recherche ci-dessous.
                    </p>
                  </div>
                </div>
                <Suspense fallback={<SearchFallback />}>
                  <SearchContent />
                </Suspense>
              </div>

              {hasActiveSearch && (
                <div className="bg-linear-to-br from-white/3 to-noir-500/2 backdrop-blur-lg border border-white/10 rounded-3xl p-6 sm:p-8 text-left">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-tertiary-500/20 border border-tertiary-400/35 text-tertiary-300 text-xs font-one">
                      Live
                    </span>
                    <h2 className="text-white font-one text-base">
                      Résultats de recherche
                    </h2>
                  </div>

                  <Suspense fallback={<SalonListFallback />}>
                    <SalonListContent />
                  </Suspense>
                </div>
              )}

              {/* Description */}
              {!hasActiveSearch && (
                <div className="rounded-3xl  text-left shadow-xl shadow-noir-700/35">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <article className="overflow-hidden rounded-3xl border border-white/10 bg-noir-700/45 transition-all duration-300 hover:border-white/20 hover:bg-noir-700/55">
                      <div className="relative h-70 w-full">
                        <Image
                          src="/photos/fbb.jpg"
                          alt="Salons/Tatoueurs déjà présents sur Inkera"
                          fill
                          className="object-cover object-[center_37%]"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-noir-700/90 via-noir-700/30 to-transparent" />
                        <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-noir-500/60 px-3 py-1 text-xs text-white/90 font-one">
                          <MdNotificationsActive className="h-4 w-4 text-tertiary-400" />
                          Déjà présents
                        </span>
                      </div>
                      <div className="p-5">
                        <h2 className="text-white font-one font-semibold text-lg">
                          Des salons sont déjà consultables
                        </h2>
                        <p className="mt-2 text-white/75 font-one text-sm leading-relaxed">
                          Utilisez la barre de recherche pour trouver des salons ou des artistes déjà inscrits sur la plateforme.
                        </p>
                      </div>
                    </article>

                    <article className="overflow-hidden rounded-3xl border border-tertiary-400/20 bg-linear-to-br from-tertiary-500/12 to-noir-700/35 transition-all duration-300 hover:border-tertiary-400/35 hover:from-tertiary-500/18">
                      <div className="relative h-70 w-full">
                        <Image
                          src="/photos/grd.jpg"
                          alt="La communauté Inkera grandit"
                          fill
                          className="object-cover object-[center_40%]"
                          sizes="(min-width: 1024px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-noir-700/90 via-noir-700/35 to-transparent" />
                        <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-tertiary-400/35 bg-noir-500/60 px-3 py-1 text-xs text-tertiary-300 font-one">
                          <HiMiniRocketLaunch className="h-4 w-4" />
                          Communauté
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="text-white font-one font-semibold text-lg">
                          La communauté grandit chaque semaine
                        </h3>
                        <p className="mt-2 text-white/75 font-one text-sm leading-relaxed">
                          De nouveaux artistes rejoignent Inkera régulièrement. Revenez souvent pour découvrir les derniers profils.
                        </p>
                      </div>
                    </article>
                  </div>
                </div>
              )}

              {/* Newsletter signup or CTA */}
              <div className="space-y-4 pt-4">
                <p className="text-white/70 font-one">
                  Vous êtes tatoueur/tatoueuse ?
                </p>
                <Link
                  href="/en-savoir-plus"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-400 text-white rounded-2xl transition-all duration-300 font-one text-sm shadow-lg shadow-tertiary-500/25 hover:shadow-tertiary-500/40 transform hover:scale-105"
                >
                  En savoir plus sur notre plateforme
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
