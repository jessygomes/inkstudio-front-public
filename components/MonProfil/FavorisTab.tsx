/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaHeart,
  FaMapMarkerAlt,
  FaEye,
  FaInstagram,
  FaFacebook,
  FaGlobe,
} from "react-icons/fa";
import { getFavoriteSalon } from "@/lib/actions/user.action";
import FavoriteBtn from "@/components/Shared/FavoriteBtn";

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

export default function FavorisTab() {
  const [favoriteSalons, setFavoriteSalons] = useState<FavoriteSalon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteSalon = async () => {
      try {
        setLoading(true);
        const result = await getFavoriteSalon();

        if (result.ok && result.data) {
          const salons = result.data.favoriteSalons || [];
          setFavoriteSalons(salons);
        } else {
          console.error("Erreur récupération favoris:", result.message);
          setFavoriteSalons([]);
        }
      } catch (error) {
        console.error("Erreur fetch favoris:", error);
        setFavoriteSalons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteSalon();
  }, []);

  const refreshFavorites = () => {
    const fetchFavoriteSalon = async () => {
      try {
        const result = await getFavoriteSalon();
        if (result.ok && result.data) {
          const salons = result.data.favoriteSalons || [];
          setFavoriteSalons(salons);
        }
      } catch (error) {
        console.error("Erreur refresh favoris:", error);
      }
    };
    fetchFavoriteSalon();
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-tertiary-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/60 font-one">Chargement des favoris...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Header modernisé */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-white font-one font-semibold text-lg sm:text-xl mb-1">
            Mes salons favoris
          </h3>
          <p className="text-white/60 font-one text-xs">
            {favoriteSalons.length} salon{favoriteSalons.length > 1 ? "s" : ""}{" "}
            sauvegardé{favoriteSalons.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center">
          <FaHeart className="w-5 h-5 text-pink-400" />
        </div>
      </div>

      {favoriteSalons.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaHeart className="w-8 h-8 text-pink-400/50" />
          </div>
          <p className="text-white/60 font-one mb-4">
            Vous n'avez pas encore de salons favoris
          </p>
          <Link
            href="/trouver-un-salon"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-xl transition-all duration-300 font-one text-sm shadow-lg hover:scale-105"
          >
            Découvrir des salons
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteSalons.map((salon) => (
            <div
              key={salon.id}
              className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 hover:border-white/20 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              {/* Accent bar */}
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-pink-500 to-pink-600" />

              <div className="p-4 pl-5">
                {/* Header avec image et info */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/20 border border-tertiary-400/30 ring-2 ring-white/5">
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
                        {salon.city}{" "}
                        {salon.postalCode && `(${salon.postalCode})`}
                      </span>
                    </div>
                  </div>

                  {/* Bouton favori en haut à droite */}
                  <div className="absolute top-3 right-3">
                    <FavoriteBtn
                      salonId={salon.id}
                      variant="icon-only"
                      className="!w-8 !h-8 !p-0"
                      onToggle={(isFav) => {
                        if (!isFav) {
                          refreshFavorites();
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Description */}
                {salon.description && (
                  <p className="text-white/60 font-one text-xs line-clamp-2 mb-3 leading-relaxed">
                    {salon.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                  <Link
                    href={`/salon/${salon.salonName
                      .toLowerCase()
                      .replace(/\s+/g, "-")}/${salon.city.toLowerCase()}-${
                      salon.postalCode || "00000"
                    }`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-tertiary-500/15 hover:bg-tertiary-500/25 text-tertiary-300 border border-tertiary-500/30 rounded-lg font-one text-xs transition-all"
                  >
                    <FaEye className="w-3 h-3" />
                    Voir le salon
                  </Link>

                  {/* Liens sociaux compacts */}
                  <div className="flex gap-1">
                    {salon.website && (
                      <Link
                        href={salon.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-tertiary-400 transition-all"
                        title="Site web"
                      >
                        <FaGlobe className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {salon.instagram && (
                      <Link
                        href={salon.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 rounded-lg text-white/60 hover:text-pink-400 transition-all"
                        title="Instagram"
                      >
                        <FaInstagram className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {salon.facebook && (
                      <Link
                        href={salon.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 rounded-lg text-white/60 hover:text-blue-400 transition-all"
                        title="Facebook"
                      >
                        <FaFacebook className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
