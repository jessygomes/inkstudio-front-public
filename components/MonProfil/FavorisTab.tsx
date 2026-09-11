"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Expand, MapPin, Heart, Images, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { toSlug } from "@/lib/utils";
import {
  FaInstagram,
  FaFacebook,
  FaGlobe,
} from "react-icons/fa";
import { FaArrowLeft, FaArrowRight, FaXmark } from "react-icons/fa6";
import {
  getFavoritePortfolioImages,
  getFavoriteSalon,
} from "@/lib/actions/user.action";
import FavoriteBtn from "@/components/Shared/FavoriteBtn";
import FavoritePortfolioBtn from "@/components/Shared/FavoritePortfolioBtn";
import AppButton from "@/components/Shared/AppButton";

type FavoriteSalon = {
  id: string;
  salonName: string;
  image?: string;
  city: string;
  postalCode?: string;
  description?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
};

type FavoritePortfolioImage = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  style?: string[];
  favoritedAt?: string;
  user?: {
    id?: string;
    salonName?: string;
    city?: string;
    postalCode?: string;
    instagram?: string;
  };
  tatoueur?: {
    id?: string;
    name?: string;
    instagram?: string;
  };
};

type FavoritesView = "salons" | "images";

type InstagramProfile = {
  href: string;
  label: string;
};

const normalizeInstagramProfile = (
  input?: string | null,
): InstagramProfile | null => {
  const raw = (input || "").trim();
  if (!raw) return null;

  const unescapedRaw = raw.replace(/\\\//g, "/").trim();
  const withoutAt = unescapedRaw.replace(/^@+/, "").trim();
  let handle = withoutAt;

  const looksLikeUrl =
    /^https?:\/\//i.test(withoutAt) || /^www\./i.test(withoutAt);
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

  return { href: `https://instagram.com/${handle}`, label: `@${handle}` };
};

export default function FavorisTab() {
  const [favoriteSalons, setFavoriteSalons] = useState<FavoriteSalon[]>([]);
  const [favoritePortfolioImages, setFavoritePortfolioImages] = useState<
    FavoritePortfolioImage[]
  >([]);
  const [activeView, setActiveView] = useState<FavoritesView>("salons");
  const [loading, setLoading] = useState(true);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const buildSalonHref = (
    salonName?: string,
    city?: string,
    postalCode?: string,
  ) => {
    const nameSlug = toSlug(salonName || "salon");
    const locSource = [city, postalCode]
      .filter((value) => typeof value === "string" && value.trim() !== "")
      .join("-");
    const locSlug = toSlug(locSource) || "localisation";
    return `/salon/${nameSlug}/${locSlug}`;
  };

  const fetchFavoriteSalons = async () => {
    try {
      const result = await getFavoriteSalon();
      if (result.ok && result.data) {
        setFavoriteSalons(result.data.favoriteSalons || []);
      } else {
        setFavoriteSalons([]);
      }
    } catch {
      setFavoriteSalons([]);
    }
  };

  const fetchFavoritePortfolio = async () => {
    try {
      const result = await getFavoritePortfolioImages();
      if (result.ok && result.data) {
        setLightboxIndex(null);
        setFavoritePortfolioImages(result.data.favoritePortfolioImages || []);
      } else {
        setLightboxIndex(null);
      setFavoritePortfolioImages([]);
      }
    } catch {
      setFavoritePortfolioImages([]);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchFavoriteSalons(), fetchFavoritePortfolio()]);
      setLoading(false);
    };
    load();
  }, []);

  const lightboxVisible = lightboxIndex !== null;
  useEffect(() => {
    if (!lightboxVisible) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    lightboxRef.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [lightboxVisible]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const prevImage = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null || favoritePortfolioImages.length === 0
          ? null
          : (i - 1 + favoritePortfolioImages.length) %
            favoritePortfolioImages.length,
      ),
    [favoritePortfolioImages.length],
  );

  const nextImage = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null || favoritePortfolioImages.length === 0
          ? null
          : (i + 1) % favoritePortfolioImages.length,
      ),
    [favoritePortfolioImages.length],
  );

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

  const activeCount =
    activeView === "salons"
      ? favoriteSalons.length
      : favoritePortfolioImages.length;

  const activeImage =
    lightboxIndex !== null ? favoritePortfolioImages[lightboxIndex] : null;

  const activeImageSalonHref = buildSalonHref(
    activeImage?.user?.salonName,
    activeImage?.user?.city,
    activeImage?.user?.postalCode,
  );
  const activeImageSalonInstagram = normalizeInstagramProfile(
    activeImage?.user?.instagram,
  );
  const activeImageArtistInstagram = normalizeInstagramProfile(
    activeImage?.tatoueur?.instagram,
  );

  if (loading) {
    return (
      <div className="bg-linear-to-br from-noir-500/6 to-white/3 backdrop-blur-lg border border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-tertiary-400 border-t-transparent mx-auto mb-4" />
          <p className="text-white/60 font-one">Chargement des favoris...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-one [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-tertiary-400 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-tertiary-400">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h3 className="text-xl text-white">Mes favoris</h3><p className="mt-1 text-xs text-white/50">Les profils et les créations qui vous inspirent.</p></div>
        <AppButton href={activeView === "salons" ? "/trouver-un-salon" : "/inspiration"} variant="secondary" className="min-h-11" icon={<ArrowUpRight size={16} />}>Explorer</AppButton>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div className="flex flex-wrap gap-1 rounded-xl bg-noir-500 p-1" role="group" aria-label="Type de favoris">
          {([{ key: "salons", label: "Salons & artistes", count: favoriteSalons.length, Icon: Store }, { key: "images", label: "Inspirations", count: favoritePortfolioImages.length, Icon: Images }] as const).map(({key,label,count,Icon}) => <button key={key} type="button" aria-pressed={activeView === key} onClick={() => { setActiveView(key); closeLightbox(); }} className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm transition ${activeView === key ? "bg-white/10 text-white" : "text-white/50 hover:text-white"}`}><Icon size={15} className={activeView === key ? "text-tertiary-400" : ""} /><span>{label}</span><span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50">{count}</span></button>)}
        </div>
        <span className="text-xs text-white/45">{activeCount} favori{activeCount > 1 ? "s" : ""}</span>
      </div>
      {activeCount === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-noir-500 px-5 py-6 text-center">
          <Heart size={28} className="mx-auto mb-3 text-tertiary-400/60" /><h4 className="text-lg text-white">Votre sélection commence ici</h4>
          <p className="mx-auto mb-4 mt-2 max-w-md text-sm leading-6 text-white/55">{activeView === "salons" ? "Enregistrez les salons et artistes qui vous plaisent pour les retrouver facilement." : "Enregistrez vos créations préférées pour préparer votre prochain projet."}</p>
          <AppButton href={activeView === "salons" ? "/trouver-un-salon" : "/inspiration"} className="min-h-11">{activeView === "salons" ? "Découvrir les salons" : "Trouver l’inspiration"}</AppButton>
        </div>
      ) : activeView === "salons" ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
          {favoriteSalons.map((salon) => {
            const href = buildSalonHref(salon.salonName, salon.city, salon.postalCode);
            const instagram = normalizeInstagramProfile(salon.instagram);
            return (
              <article key={salon.id} className="group min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-noir-500 transition-colors hover:border-tertiary-400/25">
                <div className="flex items-start gap-3 p-3">
                  <Link href={href} aria-label={`Découvrir ${salon.salonName}`} className="relative block h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-noir-700 sm:w-24">
                    {salon.image ? <Image src={salon.image} alt="" fill sizes="96px" className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" /> : <span className="grid h-full place-items-center bg-tertiary-400/5 text-3xl text-white/30">{salon.salonName.charAt(0)}</span>}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="min-w-0 break-words pt-1 text-base font-semibold leading-5 text-white"><Link href={href} className="transition hover:text-tertiary-400">{salon.salonName}</Link></h4>
                      <div className="shrink-0"><FavoriteBtn salonId={salon.id} variant="icon-only" onToggle={(isFav) => { if (!isFav) fetchFavoriteSalons(); }} /></div>
                    </div>
                    {salon.city && <p className="mt-1 flex items-start gap-1 text-xs leading-5 text-white/50"><MapPin size={12} className="mt-1 shrink-0" /><span className="break-words">{salon.city} {salon.postalCode}</span></p>}
                    {salon.description && <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-white/60">{salon.description}</p>}
                  </div>
                </div>
                <div className="mx-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/8 py-2">
                  <Link href={href} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-xs text-white/80 transition hover:bg-white/5 hover:text-tertiary-400">Découvrir le profil<ArrowUpRight size={14} /></Link>
                  <div className="flex items-center gap-1">
                    {[{href:salon.website,label:"Site internet",Icon:FaGlobe},{href:instagram?.href,label:"Instagram",Icon:FaInstagram},{href:salon.facebook,label:"Facebook",Icon:FaFacebook}].filter((social) => social.href).map(({href:link,label,Icon}) => <a key={label} href={link} target="_blank" rel="noopener noreferrer" aria-label={`${label} de ${salon.salonName}`} title={label} className="grid h-11 w-11 place-items-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white"><Icon size={14} /></a>)}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {favoritePortfolioImages.map((image,index) => <article key={image.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-noir-500 transition hover:border-white/25">
            <div className="relative aspect-square bg-noir-700">
              <button type="button" onClick={() => setLightboxIndex(index)} aria-label={`Agrandir ${image.title || "l’image favorite"}`} className="absolute inset-0 cursor-zoom-in"><Image src={image.imageUrl} alt={image.title || "Image favorite"} fill sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, 50vw" className="object-contain p-2" /><span className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-lg bg-black/50 text-white"><Expand size={14} /></span></button>
              <div className="absolute right-2 top-2"><FavoritePortfolioBtn portfolioId={image.id} initialFavorite variant="icon-only" onToggle={(isFav) => { if (!isFav) fetchFavoritePortfolio(); }} /></div>
            </div>
            <div className="px-3 pb-2 pt-3"><h4 className="line-clamp-2 break-words text-sm text-white">{image.title || "Sans titre"}</h4>{image.tatoueur?.name && <p className="mt-1 truncate text-xs text-white/50">{image.tatoueur.name}</p>}{image.user?.salonName && <Link href={buildSalonHref(image.user.salonName,image.user.city,image.user.postalCode)} className="mt-1 inline-flex min-h-11 max-w-full items-center gap-1 text-xs text-white/60 hover:text-tertiary-400"><span className="truncate">{image.user.salonName}</span><ArrowUpRight size={13} className="shrink-0" /></Link>}</div>
          </article>)}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null &&
        activeImage &&
        createPortal(
          <div
            role="dialog"
            ref={lightboxRef}
            tabIndex={-1}
            aria-label="Détails de l’image favorite"
            onKeyDown={(event) => {
              if (event.key !== "Tab") return;
              const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]'));
              const first = controls[0]; const last = controls[controls.length - 1];
              if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) { event.preventDefault(); last?.focus(); }
              else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
            }}
            aria-modal="true"
            className="fixed inset-0 z-99999 flex flex-col lg:flex-row bg-black/90 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            {/* Zone image */}
            <div
              className="relative flex min-h-[40vh] flex-1 items-center justify-center p-4 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                key={activeImage.id}
                src={activeImage.imageUrl}
                alt={activeImage.title || "Image favorite"}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />

              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Fermer"
                className="absolute top-4 right-4 z-10 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
              >
                <FaXmark className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                aria-label="Image precedente"
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
              >
                <FaArrowLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                aria-label="Image suivante"
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
              >
                <FaArrowRight className="h-4 w-4" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-2xl bg-black/40 px-3 py-1 text-[11px] text-white/70 font-one">
                {lightboxIndex + 1} / {favoritePortfolioImages.length}
              </div>
            </div>

            {/* Panneau infos */}
            <aside
              className="max-h-[45vh] shrink-0 overflow-y-auto lg:max-h-screen border-t border-white/10 bg-noir-700/95 p-4 lg:flex lg:w-80 lg:flex-col lg:justify-between lg:border-t-0 lg:border-l lg:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-5">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/45 font-one">Tatouage</p>
                  <h2 className="text-lg font-semibold text-white font-one">
                    {activeImage.title || "Image favorite"}
                  </h2>
                  {activeImage.description && (
                    <p className="text-sm text-white/65 font-one">{activeImage.description}</p>
                  )}
                </div>

                <div className="space-y-1 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/45 font-one">Salon</p>
                  <p className="text-base tracking-widest font-semibold text-white font-one">
                    {activeImage.user?.salonName || "Salon"}
                  </p>
                  <p className="text-sm text-white/60 font-one">
                    {activeImage.user?.city || "Ville non renseignee"}
                  </p>
                  {activeImageSalonInstagram && (
                    <a
                      href={activeImageSalonInstagram.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1.5 text-xs text-tertiary-300 transition hover:text-tertiary-100"
                    >
                      <FaInstagram className="h-4 w-4" />
                      {activeImageSalonInstagram.label}
                    </a>
                  )}
                </div>

                {activeImage.tatoueur?.name && (
                  <div className="space-y-1 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/45 font-one">Artiste</p>
                    <p className="text-sm font-semibold text-white font-one">
                      {activeImage.tatoueur.name}
                    </p>
                    {activeImageArtistInstagram && (
                      <a
                        href={activeImageArtistInstagram.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 text-xs text-tertiary-300 transition hover:text-tertiary-100"
                      >
                        <FaInstagram className="h-4 w-4" />
                        {activeImageArtistInstagram.label}
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <FavoritePortfolioBtn
                  portfolioId={activeImage.id}
                  initialFavorite
                  variant="default"
                  className="w-full"
                  onToggle={(isFav) => { if (!isFav) fetchFavoritePortfolio(); }}
                />
                <AppButton
                  href={activeImageSalonHref}
                  onClick={closeLightbox}
                  variant="primary"
                  fullWidth
                >
                  Voir le profil
                </AppButton>
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </div>
  );
}
