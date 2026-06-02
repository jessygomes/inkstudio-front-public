/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { toSlug } from "@/lib/utils";
import {
  FaHeart,
  FaMapMarkerAlt,
  FaEye,
  FaInstagram,
  FaFacebook,
  FaGlobe,
  FaImage,
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
  const [isMounted, setIsMounted] = useState(false);
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
        setFavoritePortfolioImages(result.data.favoritePortfolioImages || []);
      } else {
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  useEffect(() => {
    if (activeView !== "images" && lightboxIndex !== null) {
      setLightboxIndex(null);
    }
  }, [activeView, lightboxIndex]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    if (lightboxIndex >= favoritePortfolioImages.length) {
      setLightboxIndex(null);
    }
  }, [favoritePortfolioImages.length, lightboxIndex]);

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
    <div className="bg-linear-to-br from-noir-500/6 to-white/3 backdrop-blur-lg border border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-white font-one font-semibold text-lg sm:text-xl mb-1">
            {activeView === "salons" ? "Mes salons favoris" : "Mes images favorites"}
          </h3>
          <p className="text-white/60 font-one text-xs">
            {activeCount} {activeView === "salons" ? "salon" : "image"}
            {activeCount > 1 ? "s" : ""} sauvegardé{activeCount > 1 ? "s" : ""}
          </p>
        </div>
        <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center">
          {activeView === "salons" ? (
            <FaHeart className="w-5 h-5 text-pink-400" />
          ) : (
            <FaImage className="w-5 h-5 text-pink-400" />
          )}
        </div>
      </div>

      {/* Onglets */}
      <div className="mb-6 inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          onClick={() => setActiveView("salons")}
          className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-one transition ${
            activeView === "salons"
              ? "bg-tertiary-500/25 text-tertiary-100"
              : "text-white/65 hover:text-white"
          }`}
        >
          Salons
        </button>
        <button
          type="button"
          onClick={() => setActiveView("images")}
          className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-one transition ${
            activeView === "images"
              ? "bg-tertiary-500/25 text-tertiary-100"
              : "text-white/65 hover:text-white"
          }`}
        >
          Images
        </button>
      </div>

      {/* Etat vide salons */}
      {activeView === "salons" && favoriteSalons.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaHeart className="w-8 h-8 text-pink-400/50" />
          </div>
          <p className="text-white/60 font-one mb-4">
            Vous n'avez pas encore de salons favoris
          </p>
          <Link
            href="/trouver-un-salon"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-xl transition-all duration-300 font-one text-sm shadow-lg hover:scale-105"
          >
            Decouvrir des salons
          </Link>
        </div>

      /* Etat vide images */
      ) : activeView === "images" && favoritePortfolioImages.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaImage className="w-8 h-8 text-pink-400/50" />
          </div>
          <p className="text-white/60 font-one mb-4">
            Vous n'avez pas encore d'images favorites
          </p>
          <Link
            href="/inspiration"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-xl transition-all duration-300 font-one text-sm shadow-lg hover:scale-105"
          >
            Decouvrir des inspirations
          </Link>
        </div>

      /* Liste salons */
      ) : activeView === "salons" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteSalons.map((salon) => (
            <div
              key={salon.id}
              className="group relative bg-linear-to-br from-noir-500/6 to-white/3 border border-white/10 hover:border-white/20 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-pink-500 to-pink-600" />
              <div className="p-4 pl-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-linear-to-br from-tertiary-400/20 to-tertiary-500/20 border border-tertiary-400/30 ring-2 ring-white/5">
                      {salon.image ? (
                        <Image
                          src={salon.image}
                          alt={salon.salonName}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-tertiary-400 text-lg font-bold">
                          {salon.salonName.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-one font-semibold text-white text-sm mb-1 line-clamp-1 group-hover:text-tertiary-400 transition-colors">
                      {salon.salonName}
                    </h4>
                    <div className="flex items-center gap-1.5 text-white/60 text-xs">
                      <FaMapMarkerAlt className="w-3 h-3 text-tertiary-400" />
                      <span className="font-one truncate">
                        {salon.city}{salon.postalCode && ` (${salon.postalCode})`}
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <FavoriteBtn
                      salonId={salon.id}
                      variant="icon-only"
                      className="w-8! h-8! p-0!"
                      onToggle={(isFav) => { if (!isFav) fetchFavoriteSalons(); }}
                    />
                  </div>
                </div>

                {salon.description && (
                  <p className="text-white/60 font-one text-xs line-clamp-2 mb-3 leading-relaxed">
                    {salon.description}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                  <Link
                    href={`/salon/${toSlug(salon.salonName)}/${toSlug(salon.city)}-${salon.postalCode || "00000"}`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-tertiary-500/15 hover:bg-tertiary-500/25 text-tertiary-300 border border-tertiary-500/30 rounded-2xl font-one text-xs transition-all"
                  >
                    <FaEye className="w-3 h-3" />
                    Voir le salon
                  </Link>
                  <div className="flex gap-1">
                    {salon.website && (
                      <Link href={salon.website} target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/60 hover:text-tertiary-400 transition-all"
                        title="Site web">
                        <FaGlobe className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {salon.instagram && (
                      <Link href={salon.instagram} target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 rounded-2xl text-white/60 hover:text-pink-400 transition-all"
                        title="Instagram">
                        <FaInstagram className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {salon.facebook && (
                      <Link href={salon.facebook} target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 rounded-2xl text-white/60 hover:text-blue-400 transition-all"
                        title="Facebook">
                        <FaFacebook className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      /* Mosaique images */
      ) : (
        <div className="columns-2 gap-3 sm:columns-3 sm:gap-3 xl:columns-4">
          {favoritePortfolioImages.map((image, index) => {
            const salonHref = buildSalonHref(
              image.user?.salonName,
              image.user?.city,
              image.user?.postalCode,
            );
            return (
              <article
                key={image.id}
                className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-noir-700 shadow-xl"
              >
                <div
                  className={`relative w-full ${CARD_ASPECT_RATIOS[index % CARD_ASPECT_RATIOS.length]} overflow-hidden`}
                >
                  <Image
                    src={image.imageUrl}
                    alt={image.title || "Image favorite"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width:640px) 50vw, (max-width:1280px) 33vw, 20vw"
                  />

                  {/* Zone cliquable pour ouvrir la lightbox */}
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className="absolute inset-0 z-10 cursor-zoom-in"
                    aria-label={`Agrandir : ${image.title || "Image favorite"}`}
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                  {/* Bouton favori */}
                  <div className="absolute top-3 right-3 z-20">
                    <FavoritePortfolioBtn
                      portfolioId={image.id}
                      initialFavorite
                      variant="icon-only"
                      onToggle={(isFav) => { if (!isFav) fetchFavoritePortfolio(); }}
                    />
                  </div>

                  {/* Bandeau bas leger */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-black/40 px-3 py-2 backdrop-blur-sm">
                    <p className="line-clamp-1 text-xs font-semibold text-white font-one">
                      {image.user?.salonName || "Salon"}
                    </p>
                    <p className="line-clamp-1 text-[10px] text-white/70 font-one">
                      {image.tatoueur?.name || "Artiste"}
                    </p>
                    <Link
                      href={salonHref}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-one text-tertiary-300 transition hover:text-tertiary-100"
                    >
                      <FaEye className="h-2.5 w-2.5" />
                      Voir le salon
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {isMounted &&
        lightboxIndex !== null &&
        activeImage &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-99999 flex flex-col lg:flex-row bg-black/90 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            {/* Zone image */}
            <div
              className="relative flex flex-1 items-center justify-center p-4 sm:p-8"
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
                className="absolute top-4 right-4 z-10 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
              >
                <FaXmark className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                aria-label="Image precedente"
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
              >
                <FaArrowLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                aria-label="Image suivante"
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
              >
                <FaArrowRight className="h-4 w-4" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-2xl bg-black/40 px-3 py-1 text-[11px] text-white/70 font-one">
                {lightboxIndex + 1} / {favoritePortfolioImages.length}
              </div>
            </div>

            {/* Panneau infos */}
            <aside
              className="shrink-0 border-t border-white/10 bg-noir-700/95 p-4 lg:flex lg:w-80 lg:flex-col lg:justify-between lg:border-t-0 lg:border-l lg:p-6"
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
