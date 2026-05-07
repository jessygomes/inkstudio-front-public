"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaInstagram } from "react-icons/fa";
import { FaArrowLeft, FaArrowRight, FaXmark } from "react-icons/fa6";

type PortfolioFeedItem = {
  key: string;
  imageUrl: string;
  title: string;
  description: string;
  salonName: string;
  city: string;
  href: string;
  artistName?: string;
  instagram?: string;
};

const PAGE_SIZE = 8;

// Ratios hauteur/largeur pour donner un aspect mosaïque varié
const CARD_ASPECT_RATIOS = [
  "aspect-[3/4]",
  "aspect-[2/3]",
  "aspect-square",
  "aspect-[3/5]",
  "aspect-[4/5]",
  "aspect-[2/3]",
  "aspect-[3/4]",
  "aspect-square",
] as const;

const MOCK_ITEMS: PortfolioFeedItem[] = [
  {
    key: "mock-1",
    imageUrl: "/photos/AI%20Art.jpg",
    title: "Blackwork organique",
    description: "Lignes fluides et ombrages profonds.",
    salonName: "Ligne Noire",
    city: "Paris",
    href: "/trouver-un-salon",
    artistName: "Nora",
    instagram: "@lignenoire.tattoo",
  },
  {
    key: "mock-2",
    imageUrl: "/photos/Gorgeous.jpg",
    title: "Fine line floral",
    description: "Composition florale en tracé fin.",
    salonName: "Atelier Eden",
    city: "Lyon",
    href: "/trouver-un-salon",
    artistName: "Mila",
    instagram: "@ateliereden.ink",
  },
  {
    key: "mock-3",
    imageUrl: "/photos/complete.jpg",
    title: "Pièce japonaise",
    description: "Contraste fort et mouvement.",
    salonName: "Kuro Studio",
    city: "Marseille",
    href: "/trouver-un-salon",
    artistName: "Kenji",
    instagram: "@kurostudio_tattoo",
  },
  {
    key: "mock-4",
    imageUrl: "/photos/assis.jpg",
    title: "Motif graphique",
    description: "Approche géométrique moderne.",
    salonName: "Obsidian Ink",
    city: "Bordeaux",
    href: "/trouver-un-salon",
    instagram: "@obsidianink_bdx",
  },
  {
    key: "mock-5",
    imageUrl: "/photos/drink.jpg",
    title: "Old school color",
    description: "Palette vive et contour marqué.",
    salonName: "Rouge 13",
    city: "Lille",
    href: "/trouver-un-salon",
    artistName: "Sam",
    instagram: "@rouge13.tattoo",
  },
  {
    key: "mock-6",
    imageUrl: "/photos/goth.jpg",
    title: "Dark ornamental",
    description: "Textures denses et finesse des détails.",
    salonName: "Nocturne",
    city: "Nantes",
    href: "/trouver-un-salon",
    instagram: "@nocturne.ink",
  },
  {
    key: "mock-7",
    imageUrl: "/photos/metro.jpg",
    title: "Minimal symbol",
    description: "Micro-tatouage à haute précision.",
    salonName: "Mono Ink",
    city: "Toulouse",
    href: "/trouver-un-salon",
    artistName: "Elsa",
    instagram: "@monoink.tls",
  },
  {
    key: "mock-8",
    imageUrl: "/photos/recherche.jpg",
    title: "Polynesian pattern",
    description: "Trame inspirée des traditions insulaires.",
    salonName: "Mana Atelier",
    city: "Montpellier",
    href: "/trouver-un-salon",
    instagram: "@manaatelier.tattoo",
  },
  {
    key: "mock-9",
    imageUrl: "/photos/red.jpg",
    title: "Rouge contrast",
    description: "Encrage contrasté sur fond neutre.",
    salonName: "Velvet Needle",
    city: "Nice",
    href: "/trouver-un-salon",
    instagram: "@velvetneedle.nice",
  },
  {
    key: "mock-10",
    imageUrl: "/photos/sit.jpg",
    title: "Neo tribal",
    description: "Volumétrie maîtrisée et rythme graphique.",
    salonName: "Ancre Atelier",
    city: "Rennes",
    href: "/trouver-un-salon",
    instagram: "@ancre.atelier",
  },
  {
    key: "mock-11",
    imageUrl: "/photos/X.jpg",
    title: "Typo serif",
    description: "Lettrage subtil et équilibré.",
    salonName: "Serif Ink",
    city: "Strasbourg",
    href: "/trouver-un-salon",
    instagram: "@serifink.stras",
  },
  {
    key: "mock-12",
    imageUrl: "/photos/blk.jpg",
    title: "Heavy black",
    description: "Aplats noirs nets et puissants.",
    salonName: "Bloc Noir",
    city: "Grenoble",
    href: "/trouver-un-salon",
    artistName: "Iris",
    instagram: "@blocnoir.grenoble",
  },
];

export default function InspirationMosaicFeed() {
  const [items, setItems] = useState<PortfolioFeedItem[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Bloquer le scroll quand lightbox ouvert
  useEffect(() => {
    if (!isMounted) return;
    const prev = document.body.style.overflow;
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = prev;
    }
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMounted, lightboxIndex]);

  const loadNextPage = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;
    const start = (nextPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const chunk = MOCK_ITEMS.slice(start, end);

    setItems((prev) => [...prev, ...chunk]);
    setPage(nextPage);
    setHasMore(end < MOCK_ITEMS.length);
    setIsLoading(false);
  }, [hasMore, isLoading, page]);

  useEffect(() => {
    loadNextPage();
  }, [loadNextPage]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting || isLoading || !hasMore) return;
        loadNextPage();
      },
      { rootMargin: "600px 0px" },
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasMore, isLoading, loadNextPage]);

  // Navigation lightbox
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length)),
    [items.length],
  );
  const nextImage = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i + 1) % items.length)),
    [items.length],
  );

  // Clavier lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, closeLightbox, prevImage, nextImage]);

  const introText = useMemo(() => {
    if (items.length === 0) return "Découvre les portfolios des salons partenaires.";
    return `${items.length} photo${items.length > 1 ? "s" : ""} de tatouage chargée${items.length > 1 ? "s" : ""}.`;
  }, [items.length]);

  const activeItem = lightboxIndex !== null ? items[lightboxIndex] : null;

  return (
    <section className="space-y-6 font-one">
      <header className="space-y-2">
        <p className="inline-flex items-center rounded-2xl border border-tertiary-400/30 bg-tertiary-500/15 px-3 py-1 text-[11px] tracking-[0.14em] text-tertiary-100 uppercase">
          Inspiration
        </p>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <h1 className="text-2xl font-semibold text-white sm:text-3xl lg:text-4xl tracking-wide">
            Mosaïque de tatouages
          </h1>
          <p className="shrink-0 text-sm text-white/70 sm:text-base">{introText}</p>
        </div>
        <p className="text-xs text-white/70">Ces images sont présentées en guise d'exemple. Les noms et informations des artistes et salons sont fictifs.</p>
      </header>

      <div className="columns-2 gap-3 sm:columns-3 sm:gap-3 xl:columns-4 2xl:columns-5">
        {items.map((item, index) => (
          <article
            key={item.key}
            className="group mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-noir-700 shadow-xl"
          >
            <button
              type="button"
              className="block w-full cursor-zoom-in text-left"
              onClick={() => setLightboxIndex(index)}
              aria-label={`Agrandir : ${item.title}`}
            >
              <div className={`relative w-full ${CARD_ASPECT_RATIOS[index % CARD_ASPECT_RATIOS.length]} overflow-hidden`}>
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:640px) 50vw, (max-width:1280px) 33vw, 20vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 translate-y-1 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="line-clamp-1 text-sm font-semibold text-white drop-shadow">{item.title}</p>
                  <p className="text-[11px] text-white/80 drop-shadow">
                    {item.artistName ? `${item.artistName} · ` : ""}
                    {item.salonName} · {item.city}
                  </p>
                </div>
              </div>
            </button>
          </article>
        ))}
      </div>

      {isLoading && (
        <div className="py-3 text-center text-sm text-white/60">Chargement des prochaines photos...</div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="rounded-2xl border border-white/12 bg-white/5 py-10 text-center text-sm text-white/65">
          Aucune photo de portfolio disponible pour le moment.
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <div className="py-2 text-center text-xs text-white/45">Tu as atteint la fin de la mosaïque.</div>
      )}

      <div ref={sentinelRef} className="h-3 w-full" />

      {/* LIGHTBOX */}
      {isMounted &&
        lightboxIndex !== null &&
        activeItem &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-99999 flex flex-col lg:flex-row bg-black/90 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            {/* Colonne image */}
            <div
              className="relative flex flex-1 items-center justify-center p-4 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                key={activeItem.key}
                src={activeItem.imageUrl}
                alt={activeItem.title}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />

              {/* Fermer */}
              <button
                onClick={closeLightbox}
                aria-label="Fermer"
                className="absolute top-4 right-4 z-10 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
              >
                <FaXmark className="h-4 w-4" />
              </button>

              {/* Précédent */}
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                aria-label="Image précédente"
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
              >
                <FaArrowLeft className="h-4 w-4" />
              </button>

              {/* Suivant */}
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                aria-label="Image suivante"
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
              >
                <FaArrowRight className="h-4 w-4" />
              </button>

              {/* Compteur */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-2xl bg-black/40 px-3 py-1 text-[11px] text-white/70 font-one">
                {lightboxIndex + 1} / {items.length}
              </div>
            </div>

            {/* Panneau infos — bas sur mobile/tablette, droite sur desktop */}
            <aside
              className="shrink-0 border-t border-white/10 bg-noir-700/95 p-4 lg:flex lg:w-72 lg:flex-col lg:justify-between lg:border-t-0 lg:border-l lg:p-6 xl:w-80"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile/tablette : layout horizontal compact */}
              <div className="flex items-start justify-between gap-4 lg:hidden">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-sm font-semibold text-white font-one">{activeItem.title}</p>
                  <p className="text-xs text-white/60 font-one">
                    {activeItem.salonName} · {activeItem.city}
                    {activeItem.artistName ? ` · ${activeItem.artistName}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {activeItem.instagram && (
                    <a
                      href={`https://instagram.com/${activeItem.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-tertiary-300 hover:text-tertiary-100 transition"
                    >
                      <FaInstagram size={20} />
                      <span className="hidden sm:inline">{activeItem.instagram}</span>
                    </a>
                  )}
                  <Link
                    href={activeItem.href}
                    onClick={closeLightbox}
                    className="inline-flex items-center justify-center rounded-xl bg-tertiary-500/80 px-3 py-1.5 text-sm font-one text-white transition hover:bg-tertiary-500"
                  >
                    Voir →
                  </Link>
                </div>
              </div>

              {/* Desktop : layout vertical complet */}
              <div className="hidden lg:flex lg:flex-col lg:h-full lg:justify-between">
                <div className="space-y-5">
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/45 font-one">Tatouage</p>
                    <h2 className="text-lg font-semibold text-white font-one">{activeItem.title}</h2>
                    {activeItem.description && (
                      <p className="text-sm text-white/65 font-one">{activeItem.description}</p>
                    )}
                  </div>

                  <div className="space-y-1 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/45 font-one">Salon</p>
                    <p className="text-sm font-semibold text-white font-one">{activeItem.salonName}</p>
                    <p className="text-xs text-white/60 font-one">{activeItem.city}</p>
                    {activeItem.instagram && (
                      <a
                        href={`https://instagram.com/${activeItem.instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 text-xs text-tertiary-300 hover:text-tertiary-100 transition"
                      >
                        <FaInstagram className="h-3 w-3" />
                        {activeItem.instagram}
                      </a>
                    )}
                  </div>

                  {activeItem.artistName && (
                    <div className="space-y-1 rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/45 font-one">Tatoueur</p>
                      <p className="text-sm font-semibold text-white font-one">{activeItem.artistName}</p>
                    </div>
                  )}
                </div>

                <Link
                  href={activeItem.href}
                  onClick={closeLightbox}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-tertiary-400 to-tertiary-500 px-4 py-2.5 text-sm font-one text-white transition hover:from-tertiary-500 hover:to-tertiary-600"
                >
                  Voir le salon →
                </Link>
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </section>
  );
}
