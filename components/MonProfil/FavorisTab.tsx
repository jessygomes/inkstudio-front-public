/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaHeart, FaMapMarkerAlt, FaEye } from "react-icons/fa";
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
          // Accéder à la propriété favoriteSalons dans la réponse
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
    // Recharger la liste après suppression d'un favori
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
      <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-tertiary-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/60 font-one">Chargement des favoris...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-one font-semibold text-lg">
          Mes salons favoris
        </h3>
        <span className="text-white/60 font-one text-sm">
          {favoriteSalons.length} salon{favoriteSalons.length > 1 ? "s" : ""}
        </span>
      </div>

      {favoriteSalons.length === 0 ? (
        <div className="text-center py-12">
          <FaHeart className="w-12 h-12 text-white/30 mx-auto mb-4" />
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
              className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-tertiary-400/30">
                  {salon.image ? (
                    <Image
                      src={salon.image}
                      alt={salon.salonName}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover w-full h-full"
                    />
                  ) : (
                    <FaHeart className="w-5 h-5 text-tertiary-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-one font-semibold text-white text-sm mb-1 truncate">
                    {salon.salonName}
                  </h4>
                  <div className="flex items-center gap-2 mb-1">
                    <FaMapMarkerAlt className="w-3 h-3 text-white/50" />
                    <span className="text-white/70 font-one text-xs">
                      {salon.city} {salon.postalCode && `(${salon.postalCode})`}
                    </span>
                  </div>
                  {salon.description && (
                    <p className="text-white/60 font-one text-xs line-clamp-2 mt-1">
                      {salon.description.length > 80
                        ? `${salon.description.substring(0, 80)}...`
                        : salon.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-white/10">
                <Link
                  href={`/salon/${salon.salonName
                    .toLowerCase()
                    .replace(/\s+/g, "-")}/${salon.city.toLowerCase()}-${
                    salon.postalCode || "00000"
                  }`}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-tertiary-500/20 hover:bg-tertiary-500/30 text-tertiary-300 border border-tertiary-500/30 rounded-lg font-one text-xs transition-colors"
                >
                  <FaEye className="w-3 h-3" />
                  Voir
                </Link>

                <FavoriteBtn
                  salonId={salon.id}
                  variant="icon-only"
                  className="!w-auto !h-auto px-3 py-2"
                  onToggle={(isFav) => {
                    if (!isFav) {
                      // Si retiré des favoris, actualiser la liste
                      refreshFavorites();
                    }
                  }}
                />
              </div>

              {/* Liens sociaux */}
              {(salon.website || salon.instagram || salon.facebook) && (
                <div className="flex gap-2 mt-2">
                  {salon.website && (
                    <Link
                      href={salon.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-tertiary-400 transition-colors"
                      title="Site web"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118C6.004 6.048 4.97 7.413 4.083 9zM10 2C5.582 2 2 5.582 2 10s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 2c-.424 0-.84.04-1.25.115-.376 1.005-.6 2.213-.667 3.385h3.834c-.067-1.172-.291-2.38-.667-3.385A6.978 6.978 0 0010 4zm4.917 5c-.089-1.546-.383-2.97-.837-4.118C14.996 6.048 16.03 7.413 16.917 9h-1.946zm-2.417 2H7.5c.067 1.172.291 2.38.667 3.385.424.115.84.115 1.25.115.424 0 .84-.04 1.25-.115.376-1.005.6-2.213.667-3.385z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                  )}
                  {salon.instagram && (
                    <Link
                      href={salon.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-pink-400 transition-colors"
                      title="Instagram"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </Link>
                  )}
                  {salon.facebook && (
                    <Link
                      href={salon.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-blue-400 transition-colors"
                      title="Facebook"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
