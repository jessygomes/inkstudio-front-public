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
import StartInkeraConversationButton from "@/components/Contact/StartInkeraConversationButton";
import { useUser } from "@/components/Context/UserContext";
import { toSlug } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Hash, MapPin, Palette, Ruler, RotateCcw, SlidersHorizontal, Tags, ArrowUpRight, Images, X } from "lucide-react";
import { createPortal } from "react-dom";
import { FaInstagram } from "react-icons/fa";
import { FaArrowLeft, FaArrowRight, FaChevronDown, FaXmark } from "react-icons/fa6";
import {
  EMPTY_INSPIRATION_SELECTION,
  PIECE_SIZE_OPTIONS,
  buildInspirationQuery,
  hasActiveInspirationFilters,
  parseHashtagInput,
  type InspirationSelection,
} from "./inspirationFilters";

type PortfolioFeedItem = {
  key: string;
  imageUrl: string;
  title: string;
  description: string;
  salonName: string;
  salonUserId: string;
  canMessageSalon: boolean;
  isTatoueurAccount: boolean;
  authorAvatar?: string;
  parentSalonName?: string;
  parentSalonCity?: string;
  parentSalonUserId?: string;
  canMessageParentSalon: boolean;
  parentSalonAvatar?: string;
  parentSalonHref?: string;
  artistAvatar?: string;
  city: string;
  href: string;
  styles: string[];
  pieceSize?: string;
  categories: string[];
  hashtags: string[];
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
  initialSelection: InspirationSelection;
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
  salonUserId: photo.user.id,
  canMessageSalon: Boolean(photo.user.saasPlan) && photo.user.saasPlan !== "FREE",
  isTatoueurAccount: photo.user.role === "user_tatoueur",
  authorAvatar: photo.user.profileImage || undefined,
  parentSalonName: photo.user.salon?.salonName || undefined,
  parentSalonUserId: photo.user.salon?.id,
  parentSalonCity: photo.user.salon?.city?.toUpperCase() || undefined,
  canMessageParentSalon:
    Boolean(photo.user.salon) &&
    photo.user.saasPlan === "FREE" &&
    Boolean(photo.user.salon?.saasPlan) &&
    photo.user.salon?.saasPlan !== "FREE",
  parentSalonAvatar: photo.user.salon?.profileImage || undefined,
  parentSalonHref: photo.user.salon?.salonName
    ? buildSalonHref(
        photo.user.salon.salonName,
        photo.user.salon.city || "",
        photo.user.salon.postalCode || undefined,
      )
    : undefined,
  artistAvatar: photo.tatoueur?.img || undefined,
  city: (photo.user.city || "France").toUpperCase(),
  href: buildSalonHref(
    photo.user.salonName || "salon",
    photo.user.city || "",
    photo.user.postalCode || undefined,
  ),
  styles: photo.style,
  pieceSize: photo.pieceSize || undefined,
  categories: (photo.categories ?? []).map((category) => category.name),
  hashtags: photo.hashtags ?? [],
  artistName: photo.tatoueur?.name || undefined,
  artistInstagram: photo.tatoueur?.instagram || undefined,
  salonInstagram: photo.user.instagram || undefined,
});

function Avatar({ src, name, size }: { src?: string; name: string; size: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/10"
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt={name} fill sizes={`${size}px`} className="object-cover" unoptimized />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase text-white/70 font-one">
          {name.charAt(0)}
        </span>
      )}
    </div>
  );
}

function FilterChipGroup({
  label,
  icon,
  options,
  selected,
  onToggle,
}: {
  label: string;
  icon: React.ReactNode;
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const summary =
    selected.length === 0
      ? "Tous"
      : selected.length === 1
        ? (options.find((option) => option.value === selected[0])?.label ?? selected[0])
        : `${selected.length} sélectionnés`;

  return (
    <div ref={containerRef} className="relative min-w-0 font-one">
      <span className="sr-only">
        {icon} {label}
      </span>
      <button
        type="button"
        aria-label={label + ": " + summary}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 w-full min-w-0 cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-noir-700 px-3 text-left text-xs text-white/70 transition-colors hover:border-white/25 focus:outline-none focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10"
      >
        <span className="shrink-0 text-tertiary-400/70" aria-hidden="true">{icon}</span><span className="flex-1 truncate">{selected.length ? summary : label}</span>
        <FaChevronDown
          aria-hidden="true"
          className={`h-3 w-3 shrink-0 text-white/60 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <ul
          role="listbox"
          aria-multiselectable="true"
          aria-label={label}
          className="absolute left-0 top-full z-30 mt-1 max-h-64 min-w-full overflow-y-auto rounded-xl border border-white/10 bg-noir-700 py-1 shadow-xl"
        >
          {options.length === 0 && (
            <li className="px-3 py-2 text-sm text-white/50">Aucune option</li>
          )}
          {options.map((option) => {
            const isActive = selected.includes(option.value);
            return (
              <li key={option.value} role="option" aria-selected={isActive}>
                <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap px-3 py-2 text-sm text-white/85 hover:bg-white/10">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => onToggle(option.value)}
                    className="h-4 w-4 cursor-pointer accent-tertiary-400"
                  />
                  {option.label}
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function InspirationMosaicFeed({
  initialData,
  initialFilters,
  initialSelection,
}: InspirationMosaicFeedProps) {
  const { isAuthenticated, isClient } = useUser();
  const [items, setItems] = useState<PortfolioFeedItem[]>(() =>
    initialData.photos.map(mapPhotoToFeedItem),
  );
  const [page, setPage] = useState(initialData.pagination.page);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [hasMore, setHasMore] = useState(initialData.pagination.hasNextPage);
  const [total, setTotal] = useState(initialData.pagination.total);
  const [isMounted, setIsMounted] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(
    initialData.source === "mock",
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selection, setSelection] =
    useState<InspirationSelection>(initialSelection);
  const [hashtagInput, setHashtagInput] = useState(
    initialSelection.hashtag.map((tag) => `#${tag}`).join(" "),
  );
  const [favoritePortfolioIds, setFavoritePortfolioIds] = useState<Set<string>>(
    () => new Set(),
  );

  const dialogRef = useRef<HTMLDivElement>(null);
  const lightboxOpen = lightboxIndex !== null;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);
  const selectionRef = useRef(selection);
  selectionRef.current = selection;

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

    const requestId = requestIdRef.current;
    setIsLoading(true);
    setLoadError(null);

    try {
      const nextPage = page + 1;
      const response = await getInspirationPortfolioPhotosAction({
        page: nextPage,
        limit: PAGE_SIZE,
        ...selectionRef.current,
      });
      if (requestId !== requestIdRef.current) return;

      setItems((prev) => [
        ...prev,
        ...response.photos.map(mapPhotoToFeedItem),
      ]);
      setPage(response.pagination.page);
      setHasMore(response.pagination.hasNextPage);
      setTotal(response.pagination.total);
      setIsUsingMockData((prev) => prev || response.source === "mock");
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      const message =
        error instanceof Error
          ? error.message
          : "Impossible de charger plus d'images pour le moment.";
      setLoadError(message);
      setHasMore(false);
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [hasMore, isLoading, page]);

  // Applique de nouveaux filtres : recharge la page 1 et synchronise l'URL
  const applySelection = useCallback(async (next: InspirationSelection) => {
    const requestId = ++requestIdRef.current;
    setSelection(next);
    setLightboxIndex(null);
    setIsLoading(true);
    setIsFiltering(true);
    setLoadError(null);

    const query = buildInspirationQuery(next);
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    );

    try {
      const response = await getInspirationPortfolioPhotosAction({
        page: 1,
        limit: PAGE_SIZE,
        ...next,
      });
      if (requestId !== requestIdRef.current) return;

      setItems(response.photos.map(mapPhotoToFeedItem));
      setPage(response.pagination.page);
      setHasMore(response.pagination.hasNextPage);
      setTotal(response.pagination.total);
      setIsUsingMockData(response.source === "mock");
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setItems([]);
      setHasMore(false);
      setTotal(0);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Impossible de charger les images pour le moment.",
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        setIsFiltering(false);
      }
    }
  }, []);

  // Le hashtag est appliqué après une courte pause de saisie
  useEffect(() => {
    const parsed = parseHashtagInput(hashtagInput);
    if (parsed.join(",") === selectionRef.current.hashtag.join(",")) return;

    const timer = window.setTimeout(() => {
      void applySelection({ ...selectionRef.current, hashtag: parsed });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [hashtagInput, applySelection]);

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

  const hasActiveFilters = hasActiveInspirationFilters(selection);

  const availableCities = useMemo(
    () =>
      Array.from(
        new Set(
          [...initialFilters.cities, ...(selection.city ? [selection.city] : [])]
            .map((city) => city.trim().toUpperCase())
            .filter(Boolean),
        ),
      ).sort((first, second) => first.localeCompare(second, "fr")),
    [initialFilters.cities, selection.city],
  );

  const availableStyles = useMemo(
    () => getUniqueSortedValues(initialFilters.styles),
    [initialFilters.styles],
  );

  const availableCategories = initialFilters.categories;

  const categoryLabelBySlug = useMemo(
    () =>
      new Map(availableCategories.map((category) => [category.slug, category.name])),
    [availableCategories],
  );

  // Les photos sont déjà filtrées par l'API
  const filteredItems = items;

  const toggleInList = useCallback(
    (key: "pieceSize" | "category" | "style", value: string) => {
      const current = selectionRef.current[key];
      const next = current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value];
      void applySelection({ ...selectionRef.current, [key]: next });
    },
    [applySelection],
  );

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

  useEffect(() => {
    if (!lightboxOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => dialogRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(frame);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [lightboxOpen]);

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
    if (isLoading && items.length === 0) return "Chargement des inspirations...";

    if (total === 0) {
      return hasActiveFilters
        ? "Aucune inspiration ne correspond aux filtres sélectionnés pour l'instant."
        : "Découvre les portfolios des salons partenaires.";
    }

    return `${total} inspiration${total > 1 ? "s" : ""}${hasActiveFilters ? " avec les filtres actifs" : ""}.`;
  }, [hasActiveFilters, isLoading, items.length, total]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    if (lightboxIndex >= filteredItems.length) {
      setLightboxIndex(null);
    }
  }, [filteredItems.length, lightboxIndex]);

  const clearAllFilters = useCallback(() => {
    setHashtagInput("");
    void applySelection(EMPTY_INSPIRATION_SELECTION);
  }, [applySelection]);

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
    <section className="space-y-4 font-one">
      <header className="flex items-start gap-3 py-1 sm:py-2">
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-tertiary-400/15 bg-tertiary-400/8 text-tertiary-400"><Images size={17} aria-hidden="true" /></span>
        <div><p className="mb-1 text-[9px] uppercase tracking-[0.16em] text-white/35">Vos prochaines idées</p><h1 className="text-xl font-medium leading-tight tracking-tight text-white sm:text-2xl">Inspirations tatouage</h1><p className="mt-1 text-xs leading-5 text-white/45">Explorez les créations et trouvez l’artiste de votre prochain projet.</p>{isUsingMockData && <p className="mt-2 text-[10px] leading-5 text-white/35">Images d’exemple : les noms et informations des artistes et salons sont fictifs.</p>}</div>
      </header>

      <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-noir-700 p-2.5 lg:flex-row lg:items-center">
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <div className="min-w-0 font-one">
            <label className="sr-only" htmlFor="inspiration-city-select">
              <MapPin size={15} aria-hidden="true" className="text-tertiary-400" /> Ville
            </label>
            <select
              id="inspiration-city-select"
              className="h-10 w-full min-w-0 cursor-pointer rounded-xl border border-white/10 bg-noir-700 px-3 font-one text-xs uppercase text-white/70 transition-colors [color-scheme:dark] hover:border-white/25 focus:outline-none focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10"
              value={selection.city}
              onChange={(e) =>
                void applySelection({ ...selection, city: e.target.value })
              }
            >
              <option value="" className="bg-noir-500">
                TOUTES LES VILLES
              </option>
              {availableCities.map((city) => (
                <option key={city} value={city} className="bg-noir-500">
                  {city}
                </option>
              ))}
            </select>
          </div>

          <FilterChipGroup
            label="Taille de la pièce"
            icon={<Ruler size={15} aria-hidden="true" className="text-tertiary-400" />}
            options={PIECE_SIZE_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            selected={selection.pieceSize}
            onToggle={(value) => toggleInList("pieceSize", value)}
          />

          <FilterChipGroup
            label="Catégories"
            icon={<Tags size={15} aria-hidden="true" className="text-tertiary-400" />}
            options={availableCategories.map((category) => ({
              value: category.slug,
              label: category.name,
            }))}
            selected={selection.category}
            onToggle={(value) => toggleInList("category", value)}
          />

          <FilterChipGroup
            label="Styles"
            icon={<Palette size={15} aria-hidden="true" className="text-tertiary-400" />}
            options={availableStyles.map((style) => ({ value: style, label: style }))}
            selected={selection.style}
            onToggle={(value) => toggleInList("style", value)}
          />

          <div className="min-w-0 font-one">
            <label className="sr-only" htmlFor="inspiration-hashtag-input">
              <Hash size={15} aria-hidden="true" className="text-tertiary-400" /> Hashtags
            </label>
            <input
              id="inspiration-hashtag-input"
              type="text"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              placeholder="#fleur #minimaliste"
              className="h-10 w-full min-w-0 rounded-xl border border-white/10 bg-noir-700 px-3 font-one text-xs text-white transition-colors placeholder:text-white/30 hover:border-white/25 focus:outline-none focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10"
            />
          </div>
        </div>

        <AppButton type="button" variant="secondary" onClick={clearAllFilters} disabled={!hasActiveFilters && !hashtagInput} icon={<RotateCcw size={15} aria-hidden="true" />} className="h-10! px-3! py-2! text-xs! rounded-xl! shadow-none! cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400">
          Réinitialiser
        </AppButton>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p role="status" className="text-[11px] text-white/40">{filteredIntroText}</p>
        {hasActiveFilters && <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
          <SlidersHorizontal size={14} aria-hidden="true" className="text-tertiary-400" />
          <span>Filtres actifs :</span>
          {[
            ...(selection.city ? [selection.city] : []),
            ...selection.pieceSize.map(
              (size) => PIECE_SIZE_OPTIONS.find((option) => option.value === size)?.label ?? size,
            ),
            ...selection.category.map((slug) => categoryLabelBySlug.get(slug) ?? slug),
            ...selection.style,
            ...selection.hashtag.map((tag) => `#${tag}`),
          ].map((label) => (
            <span key={label} className="max-w-full wrap-anywhere rounded-lg border border-tertiary-400/10 bg-tertiary-400/5 px-2 py-1 text-tertiary-400">{label}</span>
          ))}
        </div>}
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
                <div className="absolute bottom-0 left-0 right-0 flex translate-y-1 items-center gap-2 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <Avatar src={item.authorAvatar} name={item.salonName} size={32} />
                  <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-semibold text-white drop-shadow">{item.salonName}</p>
                  <p className="text-[11px] text-white/80 drop-shadow">
                    {item.artistName ? `${item.artistName} · ` : ""}
                    {item.city}
                  </p>
                  </div>
                </div>
              </div>
            </button>
          </article>
        ))}
      </div>

      {(isFiltering || (isLoading && hasMore)) && (
        <div className="py-3 text-center text-sm text-white/60">
          {isFiltering ? "Chargement..." : "Chargement des prochaines photos..."}
        </div>
      )}

      {!isLoading && filteredItems.length === 0 && (
        <div className="rounded-2xl border border-white/12 bg-white/5 py-10 text-center text-sm text-white/65">
          {hasActiveFilters
            ? "Aucune photo ne correspond aux filtres sélectionnés pour le moment."
            : "Aucune photo de portfolio disponible pour le moment."}
        </div>
      )}

      {loadError && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-center text-sm text-red-100">
          {loadError}
        </div>
      )}

      {!hasMore && !isFiltering && !loadError && filteredItems.length > 0 && (
        <div className="py-2 text-center text-xs text-white/45">Tu as atteint la fin de la mosaïque.</div>
      )}

      <div ref={sentinelRef} className="h-3 w-full" />

      {/* LIGHTBOX */}
      {isMounted &&
        lightboxIndex !== null &&
        activeItem &&
        createPortal(
          <div
            ref={dialogRef}
            tabIndex={-1}
            onKeyDown={event => {
              if (event.key !== "Tab") return;
              const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]')).filter(element => element.getClientRects().length > 0);
              const first = controls[0];
              const last = controls[controls.length - 1];
              if (!first) { event.preventDefault(); return; }
              if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) { event.preventDefault(); last.focus(); }
              else if (!event.shiftKey && (document.activeElement === last || document.activeElement === event.currentTarget)) { event.preventDefault(); first.focus(); }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="inspiration-photo-title"
            className="fixed inset-0 z-99999 flex flex-col bg-black/95 font-one backdrop-blur-md lg:flex-row"
            onClick={closeLightbox}
          >
            {/* Colonne image */}
            <div
              className="relative flex min-h-[38dvh] min-w-0 flex-1 items-center justify-center p-4 sm:p-8 lg:min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                key={activeItem.key}
                src={activeItem.imageUrl}
                alt={activeItem.title}
                fill
                className="object-contain"
                sizes="(min-width: 1024px) calc(100vw - 390px), 100vw"
                priority
              />

              {/* Fermer */}
              <button
                onClick={closeLightbox}
                aria-label="Fermer"
                className="absolute top-4 right-4 z-10 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
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
            <aside className="flex max-h-[55dvh] shrink-0 flex-col overflow-hidden border-t border-white/10 bg-noir-700 font-one lg:max-h-none lg:w-[360px] lg:border-l lg:border-t-0 xl:w-[390px]" onClick={event => event.stopPropagation()}>
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/8 px-4 py-3.5 sm:px-5"><p className="text-[10px] uppercase tracking-[0.14em] text-white/35">La réalisation & son artiste</p><button type="button" onClick={closeLightbox} aria-label="Fermer la photo" className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 text-white/45 transition hover:bg-white/5 hover:text-white"><X size={15} /></button></div>
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-5">
                <div><h2 id="inspiration-photo-title" className="break-words text-xl font-medium leading-snug tracking-tight text-white">{activeItem.title}</h2>{activeItem.description && <p className="mt-2 whitespace-pre-line break-words text-xs leading-6 text-white/50">{activeItem.description}</p>}</div>
                <div className="rounded-xl border border-white/8 bg-white/[0.015] p-3.5"><p className="mb-3 text-[9px] uppercase tracking-[0.14em] text-white/35">{activeItem.isTatoueurAccount ? "L’artiste" : "Le salon"}</p><Link href={activeItem.href} onClick={closeLightbox} className="group flex items-center gap-3"><Avatar src={activeItem.authorAvatar} name={activeItem.salonName} size={42} /><div className="min-w-0 flex-1"><p className="break-words text-sm font-medium text-white/90">{activeItem.salonName}</p>{activeItem.city && <p className="mt-1 flex items-center gap-1 text-[10px] text-white/40"><MapPin size={11} className="shrink-0" />{activeItem.city.toLocaleUpperCase("fr-FR")}</p>}</div><ArrowUpRight size={14} className="shrink-0 text-white/30 transition group-hover:text-tertiary-400" /></Link>{salonInstagramProfile && <a href={salonInstagramProfile.href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-white/45 hover:text-tertiary-400"><FaInstagram size={13} />{salonInstagramProfile.label}</a>}</div>
                {(activeItem.pieceSize || activeItem.categories.length > 0 || activeItem.styles.length > 0 || activeItem.hashtags.length > 0) && <div className="space-y-3"><p className="text-[9px] uppercase tracking-[0.14em] text-white/35">Les détails</p>{activeItem.pieceSize && <div className="flex items-center justify-between gap-3 rounded-lg border border-white/8 px-3 py-2.5 text-[11px]"><span className="inline-flex items-center gap-2 text-white/40"><Ruler size={13} />Taille de la pièce</span><span className="text-white/75">{PIECE_SIZE_OPTIONS.find(option => option.value === activeItem.pieceSize)?.label ?? activeItem.pieceSize}</span></div>}<div className="flex flex-wrap gap-1.5">{Array.from(new Set([...activeItem.categories, ...activeItem.styles])).map(label => <span key={label} className="max-w-full break-words rounded-lg border border-tertiary-400/15 bg-tertiary-400/5 px-2.5 py-1.5 text-[10px] text-tertiary-400/85">{label}</span>)}{activeItem.hashtags.map(tag => <span key={tag} className="max-w-full break-words rounded-lg border border-white/8 bg-white/[0.025] px-2 py-1.5 text-[10px] text-white/40">#{tag}</span>)}</div></div>}
                {activeItem.artistName && activeItem.artistName !== activeItem.salonName && <div className="rounded-xl border border-white/8 p-3.5"><p className="mb-3 text-[9px] uppercase tracking-[0.14em] text-white/35">Réalisé par</p><div className="flex items-center gap-2.5"><Avatar src={activeItem.artistAvatar} name={activeItem.artistName} size={32} /><p className="min-w-0 break-words text-xs text-white/80">{activeItem.artistName}</p></div>{artistInstagramProfile && <a href={artistInstagramProfile.href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-white/45 hover:text-tertiary-400"><FaInstagram size={13} />{artistInstagramProfile.label}</a>}</div>}
                {activeItem.parentSalonName && <div className="rounded-xl border border-white/8 p-3.5"><p className="mb-3 text-[9px] uppercase tracking-[0.14em] text-white/35">Membre du salon</p><Link href={activeItem.parentSalonHref || activeItem.href} onClick={closeLightbox} className="group flex items-center gap-2.5"><Avatar src={activeItem.parentSalonAvatar} name={activeItem.parentSalonName} size={34} /><div className="min-w-0 flex-1"><p className="break-words text-xs text-white/80">{activeItem.parentSalonName}</p>{activeItem.parentSalonCity && <p className="mt-1 text-[10px] text-white/35">{activeItem.parentSalonCity.toLocaleUpperCase("fr-FR")}</p>}</div><ArrowUpRight size={13} className="shrink-0 text-white/30 group-hover:text-tertiary-400" /></Link>{activeItem.canMessageParentSalon && activeItem.parentSalonUserId && <div className="mt-3"><StartInkeraConversationButton key={`parent-${activeItem.key}`} variant="compact" targetUserId={activeItem.parentSalonUserId} recipientName={activeItem.parentSalonName} className="min-h-9! px-3! py-2! text-[11px]! shadow-none!" /></div>}</div>}
              </div>
              <div className="shrink-0 space-y-2 border-t border-white/10 bg-noir-700 p-3 sm:p-4">
                {activeItem.canMessageSalon && <StartInkeraConversationButton key={`message-${activeItem.key}`} variant="compact" targetUserId={activeItem.salonUserId} recipientName={activeItem.salonName} className="min-h-10! px-3! py-2! text-xs! rounded-xl! shadow-none!" />}
                <div className="flex items-center gap-2"><FavoritePortfolioBtn portfolioId={activeItem.key} initialFavorite={favoritePortfolioIds.has(activeItem.key)} variant="icon-only" className="size-10! shrink-0 rounded-xl!" onToggle={isFavorite => handleFavoriteToggle(activeItem.key, isFavorite)} /><AppButton href={activeItem.href} onClick={closeLightbox} fullWidth className="min-h-10! px-3! py-2! text-xs! shadow-none! hover:translate-y-0!">Voir le profil<ArrowUpRight size={14} /></AppButton></div>
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </section>
  );
}
