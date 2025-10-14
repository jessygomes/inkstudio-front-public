"use client";

import Image from "next/image";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import type { PortfolioProps, ProductSalonProps } from "@/lib/type";

type Props = {
  portfolio: PortfolioProps[];
  products: ProductSalonProps[];
  photos: string[];
  salonName?: string;
};

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

export default function SalonTabs({
  portfolio,
  products,
  photos,
  salonName,
}: Props) {
  const counts = useMemo(
    () => ({
      photos: photos?.filter(Boolean).length ?? 0,
      portfolio: portfolio?.filter((p) => !!p.imageUrl).length ?? 0,
      products: products?.length ?? 0,
    }),
    [portfolio, products, photos]
  );

  // Priorité d’onglet: photos > portfolio > produits
  const [active, setActive] = useState<"photos" | "portfolio" | "products">(
    () => {
      if (counts.photos > 0) return "photos";
      if (counts.portfolio > 0) return "portfolio";
      return "products";
    }
  );

  // Pagination (6/page) pour portfolio & produits
  const [portfolioPage, setPortfolioPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);

  const portfolioTotalPages = Math.max(
    1,
    Math.ceil(counts.portfolio / PER_PAGE) || 1
  );
  const productsTotalPages = Math.max(
    1,
    Math.ceil(counts.products / PER_PAGE) || 1
  );

  const portfolioStart = (portfolioPage - 1) * PER_PAGE;
  const portfolioPageItems = portfolio.slice(
    portfolioStart,
    portfolioStart + PER_PAGE
  );

  const productsStart = (productsPage - 1) * PER_PAGE;
  const productsPageItems = products.slice(
    productsStart,
    productsStart + PER_PAGE
  );

  useEffect(() => {
    setPortfolioPage(1);
    setProductsPage(1);
  }, [active]);

  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollToTop = () =>
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const setTab = (tab: "photos" | "portfolio" | "products") => {
    setActive(tab);
    scrollToTop();
  };

  // LIGHTBOX (Photos & Portfolio)
  const activeImages = useMemo<string[]>(() => {
    if (active === "photos") return (photos ?? []).filter(Boolean);
    if (active === "portfolio")
      return (portfolio ?? []).map((p) => p.imageUrl).filter(Boolean);
    return [];
  }, [active, photos, portfolio]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = useCallback(
    (startIndex = 0) => {
      if (activeImages.length === 0) return;
      setLightboxIndex(
        Math.max(0, Math.min(startIndex, activeImages.length - 1))
      );
      setLightboxOpen(true);
    },
    [activeImages.length]
  );

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const prev = useCallback(
    () =>
      setLightboxIndex(
        (i) => (i - 1 + activeImages.length) % activeImages.length
      ),
    [activeImages.length]
  );
  const next = useCallback(
    () => setLightboxIndex((i) => (i + 1) % activeImages.length),
    [activeImages.length]
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
            className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-one bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white border border-white/15 transition"
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
                  className={`cursor-pointer w-8 h-8 rounded-lg text-xs font-one transition-all ${
                    current === p
                      ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white"
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
            className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-one bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white border border-white/15 transition"
          >
            Suivant
          </button>
        </div>
      </div>
    ) : null;

  return (
    <section ref={sectionRef}>
      <div className="bg-noir-600 rounded-2xl p-8 border border-white/10">
        {/* Segmented tabs */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div
            role="tablist"
            aria-label="Contenus du salon"
            className="flex rounded-xl bg-noir-700 p-1 border border-white/10"
          >
            {(
              [
                { key: "photos", label: "Photos", count: counts.photos },
                {
                  key: "portfolio",
                  label: "Portfolio",
                  count: counts.portfolio,
                },
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
                  className={`cursor-pointer px-4 py-2.5 text-sm font-one font-medium rounded-lg transition-all ${
                    selected
                      ? "bg-tertiary-400 text-white shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {t.label} {t.count > 0 ? `(${t.count})` : ""}
                </button>
              );
            })}
          </div>

          {(active === "photos" || active === "portfolio") &&
            activeImages.length > 0 && (
              <button
                onClick={() => openLightbox(0)}
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-one bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 transition"
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

        {/* PHOTOS */}
        {active === "photos" &&
          (counts.photos === 0 ? (
            <Empty>Aucune photo du lieu.</Empty>
          ) : (
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((src, i) => (
                <li
                  key={`${src}-${i}`}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition group cursor-zoom-in"
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
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolioPageItems.map((item, idx) => {
                  const globalIndex = portfolioStart + idx;
                  return (
                    <li
                      key={item.id}
                      className="rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition"
                    >
                      <button
                        className="relative aspect-[4/3] w-full cursor-zoom-in"
                        onClick={() => openLightbox(globalIndex)}
                        aria-label={`Agrandir ${item.title}`}
                      >
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition" />
                      </button>
                      <div className="p-3">
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

        {/* PRODUITS */}
        {active === "products" &&
          (counts.products === 0 ? (
            <Empty>Aucun produit en vente.</Empty>
          ) : (
            <>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {productsPageItems.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition"
                  >
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
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
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
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
              className="cursor-pointer absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              ✕
            </button>

            {activeImages.length > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label="Précédent"
                  className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  ‹
                </button>
                <button
                  onClick={next}
                  aria-label="Suivant"
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  ›
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] text-white/80 font-one bg-black/30 px-2 py-1 rounded">
                  {lightboxIndex + 1} / {activeImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
