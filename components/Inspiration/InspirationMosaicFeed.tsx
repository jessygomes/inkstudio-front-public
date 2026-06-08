"use client";

import {
  type InspirationFilterOptions,
  getInspirationPortfolioPhotosAction,
  type InspirationPhoto,
  type InspirationPhotosResponse,
} from "@/lib/actions/inspiration.action";
import { getFavoritePortfolioImages } from "@/lib/actions/user.action";
import AppButton from "@/components/Shared/AppButton";
import FavoritePortfolioBtn from "@/components/Shared/FavoritePortfolioBtn";
import { useUser } from "@/components/Context/UserContext";
import { toSlug } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  styles: string[];
  artistName?: string;
  artistInstagram?: string;
  salonInstagram?: string;
};

type InstagramProfile = {
  href: string;
  label: string;
};

type InspirationMosaicFeedProps = {
  initialData: InspirationPhotosResponse;
  initialFilters: InspirationFilterOptions;
};

const PAGE_SIZE = 12;

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

const buildSalonHref = (salonName: string, city: string, postalCode?: string) => {
  const nameSlug = toSlug(salonName || "salon");
  const locSource = [city, postalCode]
    .filter((value) => typeof value === "string" && value.trim() !== "")
    .join("-");
  const locSlug = toSlug(locSource) || "localisation";

  return `/salon/${nameSlug}/${locSlug}`;
};

const getUniqueSortedValues = (values: Array<string | undefined>) => {
  const uniqueValues = Array.from(
    new Set(
      values
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean),
    ),
  );

  return uniqueValues.sort((first, second) => first.localeCompare(second, "fr"));
};

const createSlugLabelMaps = (values: string[]) => {
  const entries = values
    .map((label) => {
      const cleaned = label.trim();
      return { slug: toSlug(cleaned), label: cleaned };
    })
    .filter((entry) => entry.slug && entry.label);

  return {
    slugToLabel: new Map(entries.map((entry) => [entry.slug, entry.label])),
    labelToSlug: new Map(entries.map((entry) => [entry.label, entry.slug])),
  };
};

const normalizeInstagramProfile = (
  input?: string | null,
): InstagramProfile | null => {
  const raw = (input || "").trim();
  if (!raw) return null;

  // Certaines APIs renvoient des URLs échappées (https:\/\/instagram.com\/compte)
  const unescapedRaw = raw.replace(/\\\//g, "/").trim();
  const withoutAt = unescapedRaw.replace(/^@+/, "").trim();
  let handle = withoutAt;

  const looksLikeUrl = /^https?:\/\//i.test(withoutAt) || /^www\./i.test(withoutAt);
  const urlCandidate = /^https?:\/\//i.test(withoutAt)
    ? withoutAt
    : looksLikeUrl
      ? `https://${withoutAt}`
      : null;

  if (urlCandidate) {
    try {
      const parsed = new URL(urlCandidate);
      const firstPathSegment = parsed.pathname
        .split("/")
        .find((segment) => segment.trim().length > 0);

      if (firstPathSegment) {
        handle = firstPathSegment.replace(/^@+/, "").trim();
      }
    } catch {
      return { href: urlCandidate, label: unescapedRaw };
    }
  } else {
    const instagramMatch = withoutAt.match(/instagram\.com\/?@?([^/?#]+)/i);
    if (instagramMatch?.[1]) {
      handle = instagramMatch[1].trim();
    }
  }

  handle = handle.replace(/^@+/, "").trim();
  if (!handle) {
    if (/instagram\.com/i.test(unescapedRaw)) {
      const fallbackHref = /^https?:\/\//i.test(unescapedRaw)
        ? unescapedRaw
        : `https://${unescapedRaw}`;
      return { href: fallbackHref, label: unescapedRaw };
    }
    return null;
  }

  return {
    href: `https://instagram.com/${handle}`,
    label: `@${handle}`,
  };
};

const mapPhotoToFeedItem = (photo: InspirationPhoto): PortfolioFeedItem => ({
  key: photo.id,
  imageUrl: photo.imageUrl,
  title: photo.title,
  description: photo.description,
  salonName: photo.user.salonName || "Salon Inkera",
  city: photo.user.city || "France",
  href: buildSalonHref(
    photo.user.salonName || "salon",
    photo.user.city || "",
    photo.user.postalCode || undefined,
  ),
  styles: photo.style,
  artistName: photo.tatoueur?.name || undefined,
  artistInstagram: photo.tatoueur?.instagram || undefined,
  salonInstagram: photo.user.instagram || undefined,
});

export default function InspirationMosaicFeed({
  initialData,
  initialFilters,
}: InspirationMosaicFeedProps) {
  const { isAuthenticated, isClient } = useUser();
  const [items, setItems] = useState<PortfolioFeedItem[]>(() =>
    initialData.photos.map(mapPhotoToFeedItem),
  );
  const [page, setPage] = useState(initialData.pagination.page);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialData.pagination.hasNextPage);
  const [isMounted, setIsMounted] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(
    initialData.source === "mock",
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [favoritePortfolioIds, setFavoritePortfolioIds] = useState<Set<string>>(
    () => new Set(),
  );

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    if (!isAuthenticated || !isClient) {
      setFavoritePortfolioIds(new Set());
      return;
    }

    const loadFavoritePortfolioIds = async () => {
      try {
        const result = await getFavoritePortfolioImages();
        if (!result.ok || !result.data) {
          if (!isCancelled) {
            setFavoritePortfolioIds(new Set());
          }
          return;
        }

        const rawFavorites = (result.data as { favoritePortfolioImages?: unknown })
          .favoritePortfolioImages;
        const favoriteImages = Array.isArray(rawFavorites) ? rawFavorites : [];

        const ids = favoriteImages
          .map((image) => {
            if (typeof image !== "object" || image === null) return "";
            const maybeId = (image as { id?: unknown }).id;
            return typeof maybeId === "string" ? maybeId : "";
          })
          .filter(Boolean);

        if (!isCancelled) {
          setFavoritePortfolioIds(new Set(ids));
        }
      } catch {
        if (!isCancelled) {
          setFavoritePortfolioIds(new Set());
        }
      }
    };

    void loadFavoritePortfolioIds();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, isClient]);

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

  const loadNextPage = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setLoadError(null);

    try {
      const nextPage = page + 1;
      const response = await getInspirationPortfolioPhotosAction({
        page: nextPage,
        limit: PAGE_SIZE,
      });

      setItems((prev) => [
        ...prev,
        ...response.photos.map(mapPhotoToFeedItem),
      ]);
      setPage(response.pagination.page);
      setHasMore(response.pagination.hasNextPage);
      setIsUsingMockData((prev) => prev || response.source === "mock");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible de charger plus d'images pour le moment.";
      setLoadError(message);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, page]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting || isLoading || !hasMore) return;
        void loadNextPage();
      },
      { rootMargin: "600px 0px" },
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasMore, isLoading, loadNextPage]);

  const introText = useMemo(() => {
    if (items.length === 0) return "Découvre les portfolios des salons partenaires.";
    return `${items.length} photo${items.length > 1 ? "s" : ""} de tatouage chargée${items.length > 1 ? "s" : ""}.`;
  }, [items.length]);

  const availableCities = useMemo(
    () =>
      getUniqueSortedValues([
        ...initialFilters.cities,
        ...items.map((item) => item.city),
      ]),
    [initialFilters.cities, items],
  );

  const availableStyles = useMemo(
    () => getUniqueSortedValues(initialFilters.styles),
    [initialFilters.styles],
  );

  const cityMaps = useMemo(
    () => createSlugLabelMaps(availableCities),
    [availableCities],
  );
  const styleMaps = useMemo(
    () => createSlugLabelMaps(availableStyles),
    [availableStyles],
  );

  useEffect(() => {
    const cityParam = (searchParams.get("city") || "").trim();
    const styleParam = (searchParams.get("style") || "").trim();

    const resolvedCity =
      cityMaps.slugToLabel.get(toSlug(cityParam)) ||
      availableCities.find((city) => city === cityParam) ||
      "";
    const resolvedStyle =
      styleMaps.slugToLabel.get(toSlug(styleParam)) ||
      availableStyles.find((style) => style === styleParam) ||
      "";

    setSelectedCity(resolvedCity);
    setSelectedStyle(resolvedStyle);
  }, [searchParams, cityMaps.slugToLabel, styleMaps.slugToLabel, availableCities, availableStyles]);

  const updateFilterInUrl = useCallback(
    (key: "city" | "style", value: string, slugMap: Map<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set(key, slugMap.get(value) || toSlug(value));
      } else {
        params.delete(key);
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCity = !selectedCity || item.city === selectedCity;
      const normalizedStyle = selectedStyle.trim().toLowerCase();
      const matchesStyle =
        !normalizedStyle ||
        item.styles.some((style) => style.toLowerCase() === normalizedStyle) ||
        item.title.toLowerCase().includes(normalizedStyle) ||
        item.description.toLowerCase().includes(normalizedStyle);

      return matchesCity && matchesStyle;
    });
  }, [items, selectedCity, selectedStyle]);

  // Navigation lightbox
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null || filteredItems.length === 0
          ? null
          : (i - 1 + filteredItems.length) % filteredItems.length,
      ),
    [filteredItems.length],
  );
  const nextImage = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null || filteredItems.length === 0
          ? null
          : (i + 1) % filteredItems.length,
      ),
    [filteredItems.length],
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

  const filteredIntroText = useMemo(() => {
    if (!selectedCity && !selectedStyle) {
      return introText;
    }

    if (filteredItems.length === 0) {
      return "Aucune inspiration ne correspond aux filtres sélectionnés pour l'instant.";
    }

    return `${filteredItems.length} inspiration${filteredItems.length > 1 ? "s" : ""} visible${filteredItems.length > 1 ? "s" : ""} avec les filtres actifs.`;
  }, [filteredItems.length, introText, selectedCity, selectedStyle]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    if (lightboxIndex >= filteredItems.length) {
      setLightboxIndex(null);
    }
  }, [filteredItems.length, lightboxIndex]);

  const handleCityChange = useCallback(
    (city: string) => {
      setSelectedCity(city);
      updateFilterInUrl("city", city, cityMaps.labelToSlug);
    },
    [cityMaps.labelToSlug, updateFilterInUrl],
  );

  const handleStyleChange = useCallback(
    (style: string) => {
      setSelectedStyle(style);
      updateFilterInUrl("style", style, styleMaps.labelToSlug);
    },
    [styleMaps.labelToSlug, updateFilterInUrl],
  );

  const clearAllFilters = useCallback(() => {
    setSelectedCity("");
    setSelectedStyle("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("city");
    params.delete("style");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  const handleFavoriteToggle = useCallback(
    (portfolioId: string, isFavorite: boolean) => {
      setFavoritePortfolioIds((prev) => {
        const next = new Set(prev);
        if (isFavorite) {
          next.add(portfolioId);
        } else {
          next.delete(portfolioId);
        }
        return next;
      });
    },
    [],
  );

  const activeItem =
    lightboxIndex !== null ? filteredItems[lightboxIndex] : null;
  const artistInstagramProfile = normalizeInstagramProfile(
    activeItem?.artistInstagram,
  );
  const salonInstagramProfile = normalizeInstagramProfile(
    activeItem?.salonInstagram,
  );

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
          <p className="shrink-0 text-sm text-white/70 sm:text-base">{filteredIntroText}</p>
        </div>
        {isUsingMockData ? (
          <p className="text-xs text-white/70">
            Ces images sont présentées en guise d'exemple. Les noms et informations des artistes et salons sont fictifs.
          </p>
        ) : (
          <p className="text-xs text-white/70">
            Explore les portfolios des salons partenaires et laisse défiler pour charger davantage d'inspirations.
          </p>
        )}
      </header>

      <div className="flex flex-col gap-4 rounded-3xl sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-2 font-one">
            <label className="text-xs text-white/80" htmlFor="inspiration-city-select">
              Par ville
            </label>
            <select
              id="inspiration-city-select"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white transition focus:outline-none focus:ring-2 focus:ring-tertiary-500 sm:w-64"
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
            >
              <option value="" className="bg-noir-500">
                Toutes les villes
              </option>
              {availableCities.map((city) => (
                <option key={city} value={city} className="bg-noir-500">
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 font-one">
            <label className="text-xs text-white/80" htmlFor="inspiration-style-select">
              Par style
            </label>
            <select
              id="inspiration-style-select"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white transition focus:outline-none focus:ring-2 focus:ring-tertiary-500 sm:w-64"
              value={selectedStyle}
              onChange={(e) => handleStyleChange(e.target.value)}
            >
              <option value="" className="bg-noir-500">
                Tous les styles
              </option>
              {availableStyles.map((style) => (
                <option key={style} value={style} className="bg-noir-500">
                  {style}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(selectedCity || selectedStyle) && (
          <div className="flex flex-wrap items-center gap-2">
            {selectedCity && (
              <span className="inline-flex items-center rounded-full border border-cyan-300/30 bg-cyan-400/15 px-3 py-1 text-xs text-cyan-100">
                ville: {selectedCity}
              </span>
            )}
            {selectedStyle && (
              <span className="inline-flex items-center rounded-full border border-tertiary-300/30 bg-tertiary-400/15 px-3 py-1 text-xs text-tertiary-100">
                style: {selectedStyle}
              </span>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="cursor-pointer rounded-2xl border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      <div className="columns-2 gap-3 sm:columns-3 sm:gap-3 xl:columns-4 2xl:columns-5">
        {filteredItems.map((item, index) => (
          <article
            key={item.key}
            className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-noir-700 shadow-xl"
          >
            <div className="absolute top-3 right-3 z-20">
              <FavoritePortfolioBtn
                portfolioId={item.key}
                initialFavorite={favoritePortfolioIds.has(item.key)}
                variant="icon-only"
                onToggle={(isFavorite) => handleFavoriteToggle(item.key, isFavorite)}
              />
            </div>

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

      {!isLoading && filteredItems.length === 0 && (
        <div className="rounded-2xl border border-white/12 bg-white/5 py-10 text-center text-sm text-white/65">
          {selectedCity || selectedStyle
            ? "Aucune photo ne correspond aux filtres sélectionnés pour le moment."
            : "Aucune photo de portfolio disponible pour le moment."}
        </div>
      )}

      {loadError && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-center text-sm text-red-100">
          {loadError}
        </div>
      )}

      {!hasMore && filteredItems.length > 0 && (
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
                {lightboxIndex + 1} / {filteredItems.length}
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
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {salonInstagramProfile && (
                      <a
                        href={salonInstagramProfile.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-tertiary-300 hover:text-tertiary-100 transition"
                      >
                        <FaInstagram size={14} />
                        Salon {salonInstagramProfile.label}
                      </a>
                    )}
                    {artistInstagramProfile && (
                      <a
                        href={artistInstagramProfile.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-tertiary-300 hover:text-tertiary-100 transition"
                      >
                        <FaInstagram size={14} />
                        Artiste {artistInstagramProfile.label}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {artistInstagramProfile && (
                    <a
                      href={artistInstagramProfile.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-tertiary-300 hover:text-tertiary-100 transition"
                    >
                      <FaInstagram size={20} />
                      <span className="hidden sm:inline">{artistInstagramProfile.label}</span>
                    </a>
                  )}
                  <FavoritePortfolioBtn
                    portfolioId={activeItem.key}
                    initialFavorite={favoritePortfolioIds.has(activeItem.key)}
                    variant="icon-only"
                    onToggle={(isFavorite) =>
                      handleFavoriteToggle(activeItem.key, isFavorite)
                    }
                  />
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
                    <p className="text-base tracking-widest font-semibold text-white font-one">{activeItem.salonName}</p>
                    <p className="text-sm text-white/60 font-one">{activeItem.city}</p>
                    {salonInstagramProfile && (
                      <a
                        href={salonInstagramProfile.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 text-xs text-tertiary-300 hover:text-tertiary-100 transition"
                      >
                        <FaInstagram className="h-5 w-5" />
                        {salonInstagramProfile.label}
                      </a>
                    )}
                  </div>

                  {activeItem.artistName && (
                    <div className="space-y-1 rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/45 font-one">Artiste</p>
                      <p className="text-sm font-semibold text-white font-one">{activeItem.artistName}</p>
                      {artistInstagramProfile && (
                        <a
                          href={artistInstagramProfile.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1.5 text-xs text-tertiary-300 hover:text-tertiary-100 transition"
                        >
                          <FaInstagram className="h-4 w-4" />
                          {artistInstagramProfile.label}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <FavoritePortfolioBtn
                    portfolioId={activeItem.key}
                    initialFavorite={favoritePortfolioIds.has(activeItem.key)}
                    variant="default"
                    className="w-full"
                    onToggle={(isFavorite) =>
                      handleFavoriteToggle(activeItem.key, isFavorite)
                    }
                  />
                  <AppButton
                    href={activeItem.href}
                    onClick={closeLightbox}
                    variant="primary"
                    fullWidth
                  >
                    Voir le profil →
                  </AppButton>
                </div>
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </section>
  );
}
