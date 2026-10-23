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
import { Hash, MapPin, Palette, Ruler, RotateCcw, SlidersHorizontal, Tags } from "lucide-react";
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
    <div ref={containerRef} className="relative flex flex-col gap-2 font-one">
      <span className="flex items-center gap-2 text-sm text-white/75">
        {icon} {label}
      </span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex min-h-12 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-lg border border-white/15 bg-noir-500 px-3 py-3 text-left text-base text-white transition-colors hover:border-white/30 focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20 sm:text-sm"
      >
        <span className="truncate">{summary}</span>
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
          className="absolute left-0 top-full z-30 mt-1 max-h-64 min-w-full overflow-y-auto rounded-lg border border-white/15 bg-noir-500 py-1 shadow-xl"
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
    <section className="space-y-6 font-one">
      <header className="pb-2 pt-3 sm:pb-4 sm:pt-5">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-tertiary-400">
          Inspiration
        </p>
        <div className="mb-4">
          <h1 className="text-balance font-two text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Mosaïque de tatouages
          </h1>
        </div>
        <p className="max-w-2xl text-base leading-7 text-white/60">Explorez les univers des artistes et trouvez l’inspiration pour votre prochain projet.</p>
        {isUsingMockData && <p className="mt-3 max-w-2xl text-xs leading-6 text-white/50">Ces images sont présentées à titre d’exemple. Les noms et informations des artistes et salons sont fictifs.</p>}
      </header>

      <div className="flex flex-col gap-4 border-y border-white/10 py-5 xl:flex-row xl:items-end">
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-2 font-one">
            <label className="flex items-center gap-2 text-sm text-white/75" htmlFor="inspiration-city-select">
              <MapPin size={15} aria-hidden="true" className="text-tertiary-400" /> Ville
            </label>
            <select
              id="inspiration-city-select"
              className="min-h-12 w-full min-w-0 cursor-pointer rounded-lg border border-white/15 bg-noir-500 px-3 py-3 text-base uppercase text-white transition-colors [color-scheme:dark] hover:border-white/30 focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20 sm:text-sm"
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

          <div className="flex flex-col gap-2 font-one">
            <label className="flex items-center gap-2 text-sm text-white/75" htmlFor="inspiration-hashtag-input">
              <Hash size={15} aria-hidden="true" className="text-tertiary-400" /> Hashtags
            </label>
            <input
              id="inspiration-hashtag-input"
              type="text"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              placeholder="#fleur #minimaliste"
              className="min-h-12 w-full min-w-0 rounded-lg border border-white/15 bg-noir-500 px-3 py-3 text-base text-white transition-colors placeholder:text-white/35 hover:border-white/30 focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20 sm:text-sm"
            />
          </div>
        </div>

        <AppButton type="button" variant="secondary" onClick={clearAllFilters} disabled={!hasActiveFilters && !hashtagInput} icon={<RotateCcw size={15} aria-hidden="true" />} className="min-h-12 cursor-pointer xl:self-end focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400">
          Réinitialiser
        </AppButton>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p role="status" className="text-sm text-white/60">{filteredIntroText}</p>
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
            <span key={label} className="max-w-full wrap-anywhere rounded-md bg-tertiary-400/10 px-2.5 py-1.5 text-tertiary-400">{label}</span>
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
                <div className="flex min-w-0 flex-1 items-start gap-3">
                <Avatar src={activeItem.authorAvatar} name={activeItem.salonName} size={40} />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-sm font-semibold text-white font-one">{activeItem.salonName}</p>
                  {activeItem.parentSalonName && (
                    <p className="truncate text-[11px] text-white/60 font-one">Membre du salon {activeItem.parentSalonName}</p>
                  )}
                  <p className="text-xs text-white/60 font-one">
                    {activeItem.city}
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
                        {activeItem.isTatoueurAccount ? "Tatoueur.se" : "Salon"} {salonInstagramProfile.label}
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
              {activeItem.canMessageSalon && (
                <div className="mt-3 lg:hidden">
                  <StartInkeraConversationButton
                    key={`mobile-${activeItem.key}`}
                    variant="compact"
                    tone="violet"
                    targetUserId={activeItem.salonUserId}
                    recipientName={activeItem.salonName}
                  />
                </div>
              )}

              {activeItem.canMessageParentSalon && activeItem.parentSalonUserId && (
                <div className="mt-3 lg:hidden">
                  <StartInkeraConversationButton
                    key={`mobile-parent-${activeItem.key}`}
                    variant="compact"
                    tone="violet"
                    targetUserId={activeItem.parentSalonUserId}
                    recipientName={activeItem.parentSalonName || "le salon"}
                  />
                </div>
              )}

              {/* Desktop : layout vertical complet */}
              <div className="hidden lg:flex lg:flex-col lg:h-full lg:justify-between">
                <div className="space-y-5">
                  <div className="space-y-1">
                    {activeItem.description && (
                      <p className="text-sm text-white/65 font-one">{activeItem.description}</p>
                    )}
                  </div>

                  {(activeItem.pieceSize || activeItem.categories.length > 0 || activeItem.styles.length > 0 || activeItem.hashtags.length > 0) && (
                    <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                      {activeItem.pieceSize && (
                        <p className="text-sm text-white/70 font-one">
                          Taille : {PIECE_SIZE_OPTIONS.find((option) => option.value === activeItem.pieceSize)?.label ?? activeItem.pieceSize}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {[...activeItem.categories, ...activeItem.styles].map((label) => (
                          <span key={label} className="rounded-full bg-tertiary-400/10 px-2 py-0.5 text-[11px] text-tertiary-400 font-one">{label}</span>
                        ))}
                        {activeItem.hashtags.map((tag) => (
                          <span key={`#${tag}`} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70 font-one">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/45 font-one">{activeItem.isTatoueurAccount ? "Tatoueur.se" : "Salon"}</p>
                    <div className="flex items-center gap-3">
                      <Avatar src={activeItem.authorAvatar} name={activeItem.salonName} size={44} />
                      <div className="min-w-0">
                        <p className="truncate text-base tracking-widest font-semibold text-white font-one">{activeItem.salonName}</p>
                        <p className="text-sm text-white/60 font-one">{activeItem.city}</p>
                      </div>
                    </div>
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

                  {activeItem.parentSalonName && (
                    <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/45 font-one">Membre du salon</p>
                      <Link
                        href={activeItem.parentSalonHref || activeItem.href}
                        onClick={closeLightbox}
                        className="flex cursor-pointer items-center gap-3 transition hover:opacity-80"
                      >
                        <Avatar src={activeItem.parentSalonAvatar} name={activeItem.parentSalonName} size={44} />
                        <div className="min-w-0">
                          <p className="truncate text-base tracking-widest font-semibold text-white font-one">{activeItem.parentSalonName}</p>
                          {activeItem.parentSalonCity && (
                            <p className="text-sm text-white/60 font-one">{activeItem.parentSalonCity}</p>
                          )}
                        </div>
                      </Link>
                      {activeItem.canMessageParentSalon && activeItem.parentSalonUserId && (
                        <StartInkeraConversationButton
                          key={`parent-${activeItem.key}`}
                          variant="compact"
                          tone="violet"
                          targetUserId={activeItem.parentSalonUserId}
                          recipientName={activeItem.parentSalonName}
                        />
                      )}
                    </div>
                  )}

                  {activeItem.artistName && (
                    <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/45 font-one">Artiste</p>
                      <div className="flex items-center gap-3">
                        <Avatar src={activeItem.artistAvatar} name={activeItem.artistName} size={36} />
                        <p className="text-sm font-semibold text-white font-one">{activeItem.artistName}</p>
                      </div>
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
                  {activeItem.canMessageSalon && (
                    <StartInkeraConversationButton
                      key={`desktop-${activeItem.key}`}
                      variant="compact"
                      tone="violet"
                      targetUserId={activeItem.salonUserId}
                      recipientName={activeItem.salonName}
                    />
                  )}
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
