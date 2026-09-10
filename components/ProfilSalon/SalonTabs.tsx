"use client";

import { Images, ImageIcon, Palette, Zap, ShoppingBag, Expand, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import type { FlashProps, PortfolioProps, ProductSalonProps } from "@/lib/type";
import { getPortfolioPhotosAction } from "@/lib/actions/portfolio.action";

type Tatoueur = {
  id: string;
  name: string;
};

type Props = {
  portfolio: PortfolioProps[];
  products: ProductSalonProps[];
  photos: string[];
  flashes?: FlashProps[];
  salonName?: string;
  salonUserId?: string;
  bookingPath?: string;
  canBookFlashes?: boolean;
  tatoueurs?: Tatoueur[];
};

type FlashSort = "default" | "price-asc" | "price-desc" | "name-asc";

const PER_PAGE = 6;

function formatPrice(val: number) {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    }).format(val);
  } catch {
    return `${val} €`;
  }
}

function toCmDimensionLabel(
  width: number,
  height: number,
  unit: string = "cm",
): string {
  const normalizedUnit = unit.toLowerCase();
  let w = width;
  let h = height;

  if (normalizedUnit === "mm") {
    w = w / 10;
    h = h / 10;
  } else if (normalizedUnit === "m") {
    w = w * 100;
    h = h * 100;
  }

  const format = (n: number) =>
    Number.isInteger(n) ? String(n) : String(Number(n.toFixed(1)));

  return `${format(w)}x${format(h)}cm`;
}

function getFlashDimensions(flash: FlashProps): string | null {
  const raw = flash.dimension || flash.dimensions || flash.size;
  if (typeof raw === "string" && raw.trim()) {
    const compact = raw
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/×/g, "x")
      .replace(/\*/g, "x")
      .replace(/,/g, ".");

    const parsed = compact.match(/^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)(cm|mm|m)?$/);
    if (parsed) {
      return toCmDimensionLabel(
        Number(parsed[1]),
        Number(parsed[2]),
        parsed[3] || "cm",
      );
    }

    return raw.trim();
  }

  if (typeof flash.width === "number" && typeof flash.height === "number") {
    return toCmDimensionLabel(flash.width, flash.height, flash.unit || "cm");
  }

  return null;
}

  const Empty = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-xl border border-dashed border-white/10 bg-noir-700/30 px-4 py-6 text-center text-sm text-white/50">
      <Images size={22} className="mx-auto mb-2 text-white/30" aria-hidden="true" />
      {children}
    </div>
  );

  const Pagination = ({
    current,
    total,
    onChange,
    scrollToTop,
  }: {
    current: number;
    total: number;
    onChange: (p: number) => void;
    scrollToTop: () => void;
  }) =>
    total > 1 ? (
      <div className="flex flex-col xl:flex-row xl:flex-wrap xl:items-center xl:justify-between gap-3 pt-4">
        <span className="text-white/60 text-xs font-one">
          Page {current} / {total}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (current > 1) {
                onChange(current - 1);
                scrollToTop();
              }
            }}
            disabled={current === 1}
            className="cursor-pointer min-h-11 px-3 py-1.5 rounded-lg text-xs font-one bg-noir-700/80  hover:bg-noir-700/20  disabled:opacity-50 disabled:cursor-not-allowed text-white border border-white/15 transition"
          >
            Précédent
          </button>
          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: Math.min(total, 5) }, (_, i) => {
              let p;
              if (total <= 5) p = i + 1;
              else if (current <= 3) p = i + 1;
              else if (current >= total - 2) p = total - 4 + i;
              else p = current - 2 + i;
              return (
                <button
                  key={p}
                  aria-current={current === p ? "page" : undefined}
                  aria-label={`Page ${p}`}
                  onClick={() => {
                    onChange(p);
                    scrollToTop();
                  }}
                  className={`cursor-pointer w-11 h-11 rounded-lg text-xs font-one transition-all ${
                    current === p
                      ? "bg-linear-to-r from-tertiary-400 to-tertiary-500 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => {
              if (current < total) {
                onChange(current + 1);
                scrollToTop();
              }
            }}
            disabled={current === total}
            className="cursor-pointer min-h-11 px-3 py-1.5 rounded-lg text-xs font-one bg-noir-700/80  hover:bg-noir-700/20 disabled:opacity-50 disabled:cursor-not-allowed text-white border border-white/15 transition"
          >
            Suivant
          </button>
        </div>
      </div>
    ) : null;


export default function SalonTabs({
  portfolio,
  products,
  photos,
  flashes = [],
  salonName,
  salonUserId,
  bookingPath,
  canBookFlashes = true,
  tatoueurs = [],
}: Props) {
  const [flashSort, setFlashSort] = useState<FlashSort>("default");
  const [portfolioTatoueurFilter, setPortfolioTatoueurFilter] = useState<string | null>(null);
  const [portfolioApiItems, setPortfolioApiItems] = useState<PortfolioProps[] | null>(null);
  const [portfolioApiMeta, setPortfolioApiMeta] = useState<{
    total: number;
    totalPages: number;
  } | null>(null);

  const availableFlashes = useMemo(
    () =>
      (flashes ?? []).filter(
        (f) => f && (f.available === undefined || f.available || f.isAvailable),
      ),
    [flashes],
  );

  const sortedFlashes = useMemo(() => {
    const list = [...availableFlashes];
    if (flashSort === "default") return list;

    if (flashSort === "price-asc") {
      return list.sort((a, b) => {
        const aPrice =
          typeof a.price === "number" ? a.price : Number.POSITIVE_INFINITY;
        const bPrice =
          typeof b.price === "number" ? b.price : Number.POSITIVE_INFINITY;
        return aPrice - bPrice;
      });
    }

    if (flashSort === "price-desc") {
      return list.sort((a, b) => {
        const aPrice =
          typeof a.price === "number" ? a.price : Number.NEGATIVE_INFINITY;
        const bPrice =
          typeof b.price === "number" ? b.price : Number.NEGATIVE_INFINITY;
        return bPrice - aPrice;
      });
    }

    return list.sort((a, b) => {
      const aName = (a.title || a.name || "").toLocaleLowerCase("fr");
      const bName = (b.title || b.name || "").toLocaleLowerCase("fr");
      return aName.localeCompare(bName, "fr");
    });
  }, [availableFlashes, flashSort]);

  const fallbackFilteredPortfolio = useMemo(() => {
    const base = portfolio?.filter((p) => !!p.imageUrl) ?? [];
    if (!portfolioTatoueurFilter) return base;
    return base.filter((p) => p.tatoueurId === portfolioTatoueurFilter);
  }, [portfolio, portfolioTatoueurFilter]);

  const hasPortfolioApiData = portfolioApiItems !== null;

  const filteredPortfolio = useMemo(
    () => portfolioApiItems ?? fallbackFilteredPortfolio,
    [portfolioApiItems, fallbackFilteredPortfolio],
  );

  const counts = useMemo(
    () => ({
      photos: photos?.filter(Boolean).length ?? 0,
      portfolio: portfolioApiMeta?.total ?? fallbackFilteredPortfolio.length,
      flashes: sortedFlashes.length,
      products: products?.length ?? 0,
    }),
    [fallbackFilteredPortfolio.length, photos, portfolioApiMeta?.total, products, sortedFlashes.length],
  );

  // Priorité d’onglet: photos > portfolio > flash > produits
  const [active, setActive] = useState<
    "portfolio" | "photos" | "flashes" | "products"
  >(() => {
    if (counts.portfolio > 0) return "portfolio";
    if (counts.photos > 0) return "photos";
    if (counts.flashes > 0) return "flashes";
    if (counts.products > 0) return "products";
    return "photos";
  });

  // Pagination (6/page) pour portfolio & produits
  const [portfolioPage, setPortfolioPage] = useState(1);
  const [flashesPage, setFlashesPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);

  const portfolioTotalPages = Math.max(
    1,
    hasPortfolioApiData
      ? (portfolioApiMeta?.totalPages ?? 1)
      : (Math.ceil(fallbackFilteredPortfolio.length / PER_PAGE) || 1),
  );
  const productsTotalPages = Math.max(
    1,
    Math.ceil(counts.products / PER_PAGE) || 1,
  );
  const flashesTotalPages = Math.max(
    1,
    Math.ceil(counts.flashes / PER_PAGE) || 1,
  );

  const portfolioStart = (portfolioPage - 1) * PER_PAGE;
  const portfolioPageItems = hasPortfolioApiData
    ? filteredPortfolio
    : fallbackFilteredPortfolio.slice(portfolioStart, portfolioStart + PER_PAGE);

  const productsStart = (productsPage - 1) * PER_PAGE;
  const productsPageItems = products.slice(
    productsStart,
    productsStart + PER_PAGE,
  );

  const flashesStart = (flashesPage - 1) * PER_PAGE;
  const flashesPageItems = sortedFlashes.slice(
    flashesStart,
    flashesStart + PER_PAGE,
  );

  const flashLightboxIndexById = useMemo(() => {
    const map = new Map<string, number>();
    let imageIndex = 0;

    for (const flash of sortedFlashes) {
      if (flash.imageUrl) {
        map.set(flash.id, imageIndex);
        imageIndex += 1;
      }
    }

    return map;
  }, [sortedFlashes]);

  const selectArtist = (artistId: string | null) => {
    setPortfolioTatoueurFilter(artistId);
    setPortfolioPage(1);
  };

  useEffect(() => {
    let isCancelled = false;

    const loadPortfolioPhotos = async () => {
      if (!salonUserId) {
        setPortfolioApiItems(null);
        setPortfolioApiMeta(null);
        return;
      }

      try {
        const result = await getPortfolioPhotosAction(salonUserId, {
          tatoueurId: portfolioTatoueurFilter,
          page: portfolioPage,
        });

        if (isCancelled) return;

        if (!result.ok || !result.data) {
          setPortfolioApiItems(null);
          setPortfolioApiMeta(null);
          return;
        }

        setPortfolioApiItems(result.data.photos ?? []);
        setPortfolioApiMeta({
          total: result.data.pagination?.total ?? 0,
          totalPages: result.data.pagination?.totalPages ?? 1,
        });
      } catch {
        if (isCancelled) return;
        setPortfolioApiItems(null);
        setPortfolioApiMeta(null);
      }
    };

    loadPortfolioPhotos();

    return () => {
      isCancelled = true;
    };
  }, [salonUserId, portfolioTatoueurFilter, portfolioPage]);

  const sectionRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (!sectionRef.current) return;
    const top = sectionRef.current.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  const setTab = (tab: "portfolio" | "photos" | "flashes" | "products") => {
    setActive(tab);
    setPortfolioPage(1);
    setFlashesPage(1);
    setProductsPage(1);
  };

  // LIGHTBOX (Photos & Portfolio)
  const activeImages = useMemo<string[]>(() => {
    if (active === "photos") return (photos ?? []).filter(Boolean);
    if (active === "portfolio")
      return portfolioPageItems.map((p) => p.imageUrl).filter(Boolean);
    if (active === "flashes")
      return (sortedFlashes ?? [])
        .map((f) => f.imageUrl)
        .filter(Boolean) as string[];
    return [];
  }, [active, photos, portfolioPageItems, sortedFlashes]);

  const showSortControl = active === "flashes" && counts.flashes > 0;
  const showExpandControl =
    (active === "photos" || active === "portfolio" || active === "flashes") &&
    activeImages.length > 0;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const lightboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    lightboxRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [lightboxOpen]);

  const openLightbox = useCallback(
    (startIndex = 0) => {
      if (activeImages.length === 0) return;
      setLightboxIndex(
        Math.max(0, Math.min(startIndex, activeImages.length - 1)),
      );
      setLightboxOpen(true);
    },
    [activeImages.length],
  );

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const prev = useCallback(
    () =>
      setLightboxIndex(
        (i) => (i - 1 + activeImages.length) % activeImages.length,
      ),
    [activeImages.length],
  );
  const next = useCallback(
    () => setLightboxIndex((i) => (i + 1) % activeImages.length),
    [activeImages.length],
  );

  const onLightboxKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!lightboxOpen) return;
    if (e.key === "Tab") {
      const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === e.currentTarget)) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  return (
    <section id="creations" className="scroll-mt-28" ref={sectionRef}>
      <div className="bg-noir-500 rounded-2xl border border-white/10 p-4 font-one sm:p-5">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-tertiary-400/10 text-tertiary-400"><Images size={18} aria-hidden="true" /></span>
          <div><h2 className="text-lg text-white sm:text-xl">L’univers du salon</h2><p className="mt-1 text-xs text-white/50">Un lieu, des artistes, des idées à explorer.</p></div>
        </div>
        <div role="tablist" aria-label="Contenus du salon" className="mb-4 grid grid-cols-2 gap-1.5 rounded-xl bg-noir-700/70 p-1.5 sm:grid-cols-4">
          {([
            { key: "photos", label: "Le salon", count: counts.photos, Icon: ImageIcon },
            { key: "portfolio", label: "Portfolio", count: counts.portfolio, Icon: Palette },
            { key: "flashes", label: "Flashs", count: counts.flashes, Icon: Zap },
            { key: "products", label: "Produits", count: counts.products, Icon: ShoppingBag },
          ] as const).map(({ key, label, count, Icon }) => (
            <button key={key} type="button" role="tab" id={`gallery-tab-${key}`} aria-controls="gallery-panel" aria-selected={active === key} tabIndex={active === key ? 0 : -1}
              onClick={() => setTab(key)}
              onKeyDown={(event) => {
                const tabs = ["photos", "portfolio", "flashes", "products"] as const;
                const index = tabs.indexOf(key);
                const nextIndex = event.key === "ArrowRight" ? (index + 1) % 4 : event.key === "ArrowLeft" ? (index + 3) % 4 : event.key === "Home" ? 0 : event.key === "End" ? 3 : -1;
                if (nextIndex < 0) return;
                event.preventDefault();
                setTab(tabs[nextIndex]);
                document.getElementById(`gallery-tab-${tabs[nextIndex]}`)?.focus();
              }}
              className={`flex min-h-11 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs transition focus-visible:outline-2 focus-visible:outline-tertiary-400 sm:text-sm ${active === key ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:bg-white/5 hover:text-white"}`}>
              <Icon size={16} className={`shrink-0 ${active === key ? "text-tertiary-400" : ""}`} aria-hidden="true" /><span>{label}</span>
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] tabular-nums ${active === key ? "bg-tertiary-400/15 text-tertiary-400" : "bg-white/5 text-white/40"}`}>{count}</span>
            </button>
          ))}
        </div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs leading-5 text-white/50">{{ photos: "Découvrez le lieu et son ambiance.", portfolio: "Les réalisations des artistes du salon.", flashes: "Des dessins disponibles pour votre prochain tatouage.", products: "Les produits proposés par le salon." }[active]}</p>
          <div className="flex flex-wrap items-center gap-2">
            {showSortControl && <select value={flashSort} onChange={(event) => { setFlashSort(event.target.value as FlashSort); setFlashesPage(1); }} aria-label="Trier les flashs" className="min-h-11 rounded-lg border border-white/10 bg-noir-700 px-3 text-xs text-white/75"><option value="default">Ordre par défaut</option><option value="price-asc">Prix croissant</option><option value="price-desc">Prix décroissant</option><option value="name-asc">Nom A → Z</option></select>}
            {showExpandControl && <button type="button" onClick={() => openLightbox(0)} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 text-xs text-white/70 transition hover:bg-white/5 hover:text-white"><Expand size={14} aria-hidden="true" />Ouvrir la galerie</button>}
          </div>
        </div>

        <div id="gallery-panel" role="tabpanel" aria-labelledby={`gallery-tab-${active}`} tabIndex={0} className="focus-visible:outline-2 focus-visible:outline-tertiary-400">
        {/* PHOTOS */}
        {active === "photos" &&
          (counts.photos === 0 ? (
            <Empty>Aucune photo du lieu.</Empty>
          ) : (
            <ul className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {photos.map((src, i) => (
                <li
                  key={`${src}-${i}`}
                  className="relative aspect-4/3 rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition group cursor-zoom-in"

                >
                  <button type="button" className="absolute inset-0 h-full w-full cursor-zoom-in" aria-label={`Agrandir la photo du salon ${i + 1}`} onClick={() => openLightbox(i)}>
                  <Image
                    src={src}
                    alt={`${salonName ?? "Salon"} - photo ${i + 1}`}
                    fill
                    sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                    className="object-cover"
                  />
                  <span className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-lg bg-black/50 text-white backdrop-blur-sm"><Expand size={14} aria-hidden="true" /></span>
                  </button>
                </li>
              ))}
            </ul>
          ))}

        {/* PORTFOLIO */}
        {active === "portfolio" && (
          <>
            {tatoueurs.length > 1 && (
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  aria-pressed={portfolioTatoueurFilter === null}
                  onClick={() => selectArtist(null)}
                  className={`cursor-pointer min-h-11 px-3 py-1.5 rounded-lg text-xs font-one transition-all duration-200 border ${
                    portfolioTatoueurFilter === null
                      ? "bg-tertiary-400/20 border-tertiary-400/40 text-white"
                      : "border-white/15 text-white/65 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  Tous
                </button>
                {tatoueurs.map((t) => (
                  <button
                    key={t.id}
                    aria-pressed={portfolioTatoueurFilter === t.id}
                    onClick={() =>
                      selectArtist(
                        portfolioTatoueurFilter === t.id ? null : t.id,
                      )
                    }
                    className={`cursor-pointer min-h-11 px-3 py-1.5 rounded-lg text-xs font-one transition-all duration-200 border ${
                      portfolioTatoueurFilter === t.id
                        ? "bg-tertiary-400/20 border-tertiary-400/40 text-white"
                        : "border-white/15 text-white/65 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        {active === "portfolio" &&
          (counts.portfolio === 0 ? (
            <Empty>Aucune pièce dans le portfolio.</Empty>
          ) : (
            <>
              <ul className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                {portfolioPageItems.map((item, idx) => {
                  const imageIndex = idx;
                  return (
                    <li
                      key={item.id}
                      className="group flex min-w-0 flex-col rounded-xl border border-white/10 bg-noir-700/50 overflow-hidden transition hover:border-tertiary-400/30"
                    >
                      <button
                        className="relative block aspect-square w-full shrink-0 cursor-zoom-in overflow-hidden"
                        onClick={() => openLightbox(imageIndex)}
                        aria-label={`Agrandir ${item.title}`}
                      >
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 50vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition" />
                      </button>
                      <div className="p-3">
                        <p className="break-words text-white/95 font-one text-sm">
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-white/60 text-xs mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <Pagination
                scrollToTop={scrollToTop}
                current={portfolioPage}
                total={portfolioTotalPages}
                onChange={setPortfolioPage}
              />
            </>
          ))}

        {/* FLASH */}
        {active === "flashes" &&
          (counts.flashes === 0 ? (
            <Empty>Aucun flash disponible pour le moment.</Empty>
          ) : (
            <>
              <ul className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                {flashesPageItems.map((f) => {
                  const label = f.title || f.name || "Flash";
                  const dimensions = getFlashDimensions(f);
                  const imageIndex = flashLightboxIndexById.get(f.id);
                  return (
                    <li
                      key={f.id}
                      className="group flex min-w-0 flex-col rounded-xl border border-white/10 bg-noir-700/50 overflow-hidden transition hover:border-tertiary-400/30"
                    >
                      <button
                        type="button"
                        className="relative block aspect-square w-full shrink-0 cursor-zoom-in bg-noir-700 text-left disabled:cursor-default"
                        onClick={() => {
                          if (typeof imageIndex === "number") {
                            openLightbox(imageIndex);
                          }
                        }}
                        disabled={typeof imageIndex !== "number"}
                        aria-label={
                          typeof imageIndex === "number"
                            ? `Agrandir ${label}`
                            : `${label} sans image`
                        }
                      >
                        {f.imageUrl ? (
                          <Image
                            src={f.imageUrl}
                            alt={label}
                            fill
                            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 50vw"
                            className="object-contain p-2"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-white/40 text-xs font-one">
                            Sans image
                          </div>
                        )}
                        {f.imageUrl && (
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition" />
                        )}
                      </button>
                      <div className="flex flex-1 flex-col gap-2 p-3">
                        <p className="break-words text-white/95 font-one text-sm">
                          {label}
                        </p>
                        {f.description && (
                          <p className="text-white/60 text-xs line-clamp-2">
                            {f.description}
                          </p>
                        )}
                        {dimensions && (
                          <p className="text-white/75 text-xs font-one">
                            Dimensions : {dimensions}
                          </p>
                        )}
                        {typeof f.price === "number" && (
                          <p className="text-white text-base font-semibold font-one mt-1">
                            {formatPrice(f.price)}
                          </p>
                        )}

                        {bookingPath && canBookFlashes && (
                          <div className="mt-auto pt-2">
                            <Link
                              href={`${bookingPath}?prestation=TATTOO&flashId=${encodeURIComponent(f.id)}`}
                              className="inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-lg bg-tertiary-400/10 px-3 text-xs text-white transition hover:bg-tertiary-400/20"
                            >
                              Réserver <ArrowUpRight size={15} className="text-tertiary-400" aria-hidden="true" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <Pagination
                scrollToTop={scrollToTop}
                current={flashesPage}
                total={flashesTotalPages}
                onChange={setFlashesPage}
              />
            </>
          ))}

        {/* PRODUITS */}
        {active === "products" &&
          (counts.products === 0 ? (
            <Empty>Aucun produit en vente.</Empty>
          ) : (
            <>
              <ul className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                {productsPageItems.map((p) => (
                  <li
                    key={p.id}
                    className="group flex min-w-0 flex-col rounded-xl border border-white/10 bg-noir-700/50 overflow-hidden transition hover:border-tertiary-400/30"
                  >
                    <div className="relative aspect-square shrink-0 bg-noir-700">
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 50vw"
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-3">
                      <p className="break-words text-white/95 font-one text-sm">{p.name}</p>
                      {p.description && (
                        <p className="text-white/60 text-xs line-clamp-2">
                          {p.description}
                        </p>
                      )}
                      <p className="text-white text-base font-semibold font-one mt-1">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <Pagination
                scrollToTop={scrollToTop}
                current={productsPage}
                total={productsTotalPages}
                onChange={setProductsPage}
              />
            </>
          ))}
      </div>

      </div>
      {/* LIGHTBOX */}
      {lightboxOpen &&
        createPortal(
          <div
            role="dialog"
            ref={lightboxRef}
            aria-label="Galerie d’images du salon"
            aria-modal="true"
            className="fixed inset-0 z-100000 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onKeyDown={onLightboxKey}
            tabIndex={-1}
            onClick={closeLightbox}
          >
            <div
              className="relative max-w-[92vw] max-h-[86vh] w-full h-full flex items-center justify-center rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full rounded-xl">
                <Image
                  src={activeImages[lightboxIndex]}
                  alt={`${salonName ?? "Image"} - ${lightboxIndex + 1}/${
                    activeImages.length
                  }`}
                  fill
                  className="object-contain rounded-xl"
                  sizes="100vw"
                  priority
                />
              </div>

              <button
                onClick={closeLightbox}
                aria-label="Fermer"
                className="cursor-pointer absolute top-3 right-3 px-2 py-0.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                ✕
              </button>

              {activeImages.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Précédent"
                    className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 px-3 pb-0.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-2xl border border-white/20"
                  >
                    ‹
                  </button>
                  <button
                    onClick={next}
                    aria-label="Suivant"
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 px-3 pb-0.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-2xl border border-white/20"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] text-white/80 font-one bg-black/30 px-2 py-1 rounded-2xl">
                    {lightboxIndex + 1} / {activeImages.length}
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}

