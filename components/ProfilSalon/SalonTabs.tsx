"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import type { FlashProps, PortfolioProps, ProductSalonProps } from "@/lib/type";

type Props = {
  portfolio: PortfolioProps[];
  products: ProductSalonProps[];
  photos: string[];
  flashes?: FlashProps[];
  salonName?: string;
  bookingPath?: string;
  canBookFlashes?: boolean;
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

export default function SalonTabs({
  portfolio,
  products,
  photos,
  flashes = [],
  salonName,
  bookingPath,
  canBookFlashes = true,
}: Props) {
  const [flashSort, setFlashSort] = useState<FlashSort>("default");

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

  const counts = useMemo(
    () => ({
      photos: photos?.filter(Boolean).length ?? 0,
      portfolio: portfolio?.filter((p) => !!p.imageUrl).length ?? 0,
      flashes: sortedFlashes.length,
      products: products?.length ?? 0,
    }),
    [portfolio, products, photos, sortedFlashes],
  );

  // Priorité d’onglet: photos > portfolio > flash > produits
  const [active, setActive] = useState<
    "portfolio" | "photos" | "flashes" | "products"
  >(() => {
    if (counts.portfolio > 0) return "portfolio";
    if (counts.photos > 0) return "photos";
    if (counts.flashes > 0) return "flashes";
    return "products";
  });

  // Pagination (6/page) pour portfolio & produits
  const [portfolioPage, setPortfolioPage] = useState(1);
  const [flashesPage, setFlashesPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);

  const portfolioTotalPages = Math.max(
    1,
    Math.ceil(counts.portfolio / PER_PAGE) || 1,
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
  const portfolioPageItems = portfolio.slice(
    portfolioStart,
    portfolioStart + PER_PAGE,
  );

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

  useEffect(() => {
    setPortfolioPage(1);
    setFlashesPage(1);
    setProductsPage(1);
  }, [active]);

  useEffect(() => {
    setFlashesPage(1);
  }, [flashSort]);

  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollToTop = () => {
    if (!sectionRef.current) return;
    const top = sectionRef.current.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  const setTab = (tab: "portfolio" | "photos" | "flashes" | "products") => {
    setActive(tab);
    scrollToTop();
  };

  // LIGHTBOX (Photos & Portfolio)
  const activeImages = useMemo<string[]>(() => {
    if (active === "photos") return (photos ?? []).filter(Boolean);
    if (active === "portfolio")
      return (portfolio ?? []).map((p) => p.imageUrl).filter(Boolean);
    if (active === "flashes")
      return (sortedFlashes ?? [])
        .map((f) => f.imageUrl)
        .filter(Boolean) as string[];
    return [];
  }, [active, photos, portfolio, sortedFlashes]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxOpen, isMounted]);

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
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  const Empty = ({ children }: { children: React.ReactNode }) => (
    <div className="text-white/65 text-sm font-one flex items-center gap-2">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/30" />
      {children}
    </div>
  );

  const Pagination = ({
    current,
    total,
    onChange,
  }: {
    current: number;
    total: number;
    onChange: (p: number) => void;
  }) =>
    total > 1 ? (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
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
            className="cursor-pointer px-3 py-1.5 rounded-2xl text-xs font-one bg-noir-700/80  hover:bg-noir-700/20  disabled:opacity-50 disabled:cursor-not-allowed text-white border border-white/15 transition"
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
                  onClick={() => {
                    onChange(p);
                    scrollToTop();
                  }}
                  className={`cursor-pointer w-6 h-6 rounded-2xl text-xs font-one transition-all ${
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
            className="cursor-pointer px-3 py-1.5 rounded-2xl text-xs font-one bg-noir-700/80  hover:bg-noir-700/20 disabled:opacity-50 disabled:cursor-not-allowed text-white border border-white/15 transition"
          >
            Suivant
          </button>
        </div>
      </div>
    ) : null;

  return (
    <section ref={sectionRef}>
      <div className="bg-noir-700 rounded-2xl p-8 border border-white/10">
        {/* Segmented tabs */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div
            role="tablist"
            aria-label="Contenus du salon"
            className="flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-noir-700/85 p-1"
          >
            {(
              [
                { key: "photos", label: "Photos", count: counts.photos },
                {
                  key: "portfolio",
                  label: "Portfolio",
                  count: counts.portfolio,
                },
                { key: "flashes", label: "Flash", count: counts.flashes },
                { key: "products", label: "Produits", count: counts.products },
              ] as const
            ).map((t) => {
              const selected = active === t.key;
              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setTab(t.key)}
                  className={`group relative inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-one font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/50 ${
                    selected
                      ? "bg-tertiary-400/20 text-white shadow-[inset_0_-2px_0_0_var(--color-tertiary-400)]"
                      : "text-white/65 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <span>{t.label}</span>
                  {t.count > 0 && (
                    <span
                      className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                        selected
                          ? "bg-tertiary-400/25 text-tertiary-100"
                          : "bg-white/10 text-white/75"
                      }`}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {active === "flashes" && counts.flashes > 0 && (
              <select
                value={flashSort}
                onChange={(e) => setFlashSort(e.target.value as FlashSort)}
                className="cursor-pointer px-3 py-1.5 rounded-2xl text-xs font-one bg-noir-700/10 hover:bg-white/20 border border-white/20 text-white/90 transition"
                aria-label="Trier les flashs"
                title="Trier les flashs"
              >
                <option value="default" className="bg-noir-700 text-white">
                  Tri: Défaut
                </option>
                <option value="price-asc" className="bg-noir-700 text-white">
                  Prix croissant
                </option>
                <option value="price-desc" className="bg-noir-700 text-white">
                  Prix décroissant
                </option>
                <option value="name-asc" className="bg-noir-700 text-white">
                  Nom A → Z
                </option>
              </select>
            )}

            {(active === "photos" ||
              active === "portfolio" ||
              active === "flashes") &&
              activeImages.length > 0 && (
                <button
                  onClick={() => openLightbox(0)}
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl text-xs font-one bg-noir-700/10 hover:border-white/40 border border-white/20 text-white/90 transition"
                  aria-label="Tout agrandir"
                  title="Tout agrandir"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    className="opacity-80"
                  >
                    <path
                      d="M4 14v6h6M20 10V4h-6M20 4l-7 7M4 20l7-7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                  <p className="hidden sm:block">Agrandir</p>
                </button>
              )}
          </div>
        </div>

        {/* PHOTOS */}
        {active === "photos" &&
          (counts.photos === 0 ? (
            <Empty>Aucune photo du lieu.</Empty>
          ) : (
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((src, i) => (
                <li
                  key={`${src}-${i}`}
                  className="relative aspect-4/3 rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition group cursor-zoom-in"
                  aria-label={`Photo du salon ${i + 1}`}
                  onClick={() => openLightbox(i)}
                >
                  <Image
                    src={src}
                    alt={`${salonName ?? "Salon"} - photo ${i + 1}`}
                    fill
                    sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-black/10" />
                </li>
              ))}
            </ul>
          ))}

        {/* PORTFOLIO */}
        {active === "portfolio" &&
          (counts.portfolio === 0 ? (
            <Empty>Aucune pièce dans le portfolio.</Empty>
          ) : (
            <>
              <ul className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolioPageItems.map((item, idx) => {
                  const globalIndex = portfolioStart + idx;
                  return (
                    <li
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-white/2 overflow-hidden hover:bg-white/10 transition"
                    >
                      <button
                        className="relative aspect-4/3 w-full cursor-zoom-in"
                        onClick={() => openLightbox(globalIndex)}
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
                      <div className="p-2">
                        <p className="text-white/95 font-one text-sm">
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
              <ul className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {flashesPageItems.map((f) => {
                  const label = f.title || f.name || "Flash";
                  const dimensions = getFlashDimensions(f);
                  const imageIndex = flashLightboxIndexById.get(f.id);
                  return (
                    <li
                      key={f.id}
                      className="rounded-2xl border border-white/10 bg-white/2 overflow-hidden hover:bg-white/10 transition"
                    >
                      <button
                        type="button"
                        className="relative aspect-4/3 bg-noir-700 w-full text-left"
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
                            className="object-cover"
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
                      <div className="p-3 space-y-1">
                        <p className="text-white/95 font-one text-sm">
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
                          <p className="text-tertiary-300 text-xs font-one mt-1">
                            {formatPrice(f.price)}
                          </p>
                        )}

                        {bookingPath && canBookFlashes && (
                          <Link
                            href={`${bookingPath}?prestation=TATTOO&flashId=${encodeURIComponent(f.id)}`}
                            className="mt-2 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-one bg-linear-to-r from-tertiary-500 to-tertiary-400 text-white hover:from-tertiary-400 hover:to-tertiary-500 transition"
                          >
                            Réserver ce flash
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <Pagination
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
              <ul className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {productsPageItems.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-2xl border border-white/10 bg-white/2 overflow-hidden hover:bg-white/10 transition"
                  >
                    <div className="relative aspect-4/3">
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-white/95 font-one text-sm">{p.name}</p>
                      {p.description && (
                        <p className="text-white/60 text-xs line-clamp-2">
                          {p.description}
                        </p>
                      )}
                      <p className="text-tertiary-300 text-xs font-one mt-1">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <Pagination
                current={productsPage}
                total={productsTotalPages}
                onChange={setProductsPage}
              />
            </>
          ))}
      </div>

      {/* LIGHTBOX */}
      {isMounted &&
        lightboxOpen &&
        createPortal(
          <div
            role="dialog"
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
