/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getClientProfile } from "@/lib/actions/user.action";
import { User } from "@/lib/type";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import InfosTab from "./InfosTab";
import FavorisTab from "./FavorisTab";
import RendezVousTab from "./RendezVousTab";
import MesAvisTab from "./MesAvisTab";

import {
  FaUser,
  FaHeart,
  FaCalendarAlt,
  FaEdit,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import Image from "next/image";
import { LogoutBtn } from "../Auth/LogoutBtn";

export default function ProfilGlobal(user: User) {
  const [activeTab, setActiveTab] = useState<
    "rdv" | "favoris" | "infos" | "mesavis"
  >("rdv");

  // État pour les données complètes du profil avec type explicite
  const [profileData, setProfileData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Récupération des données complètes du profil
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const result = await getClientProfile();

        if (result.ok) {
          setProfileData(result.data);
        } else {
          console.error("Erreur récupération profil:", result.message);
        }
      } catch (error) {
        console.error("Erreur fetch profil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Fonction pour rafraîchir les données après modification
  const refreshProfile = async () => {
    const result = await getClientProfile();
    if (result.ok) {
      setProfileData(result.data);
    }
  };

  // Loading state - Skeleton
  if (loading) {
    return (
      <div className="">
        <div className="mx-auto px-4 sm:px-6 py-8 lg:px-20">
          {/* Header skeleton */}
          <div className="backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl mb-8 animate-pulse">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar skeleton */}
              <div className="relative shrink-0">
                <div className="w-32 h-32 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-linear-to-br from-white/10 to-white/5 rounded-2xl"></div>
              </div>

              {/* Infos skeleton */}
              <div className="flex-1 min-w-0 text-center sm:text-left w-full">
                <div className="space-y-4">
                  {/* Nom skeleton */}
                  <div className="flex flex-col gap-2">
                    <div className="h-8 bg-white/10 rounded-lg w-48 mx-auto sm:mx-0"></div>
                  </div>

                  {/* Infos de contact skeleton */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <div className="w-6 h-6 rounded-lg bg-white/10"></div>
                      <div className="h-4 bg-white/10 rounded w-40"></div>
                    </div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <div className="w-6 h-6 rounded-lg bg-white/10"></div>
                      <div className="h-4 bg-white/10 rounded w-32"></div>
                    </div>
                  </div>

                  {/* Actions skeleton */}
                  <div className="flex gap-2 pt-2 justify-center sm:justify-start">
                    <div className="h-8 bg-white/10 rounded-lg w-24"></div>
                    <div className="h-8 bg-white/10 rounded-lg w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation tabs skeleton */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 bg-white/10 rounded-lg w-32 animate-pulse"
              ></div>
            ))}
          </div>

          {/* Contenu skeleton */}
          <div className="space-y-4 animate-pulse">
            <div className="h-32 bg-white/5 rounded-2xl border border-white/10"></div>
            <div className="h-32 bg-white/5 rounded-2xl border border-white/10"></div>
            <div className="h-32 bg-white/5 rounded-2xl border border-white/10"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-linear-to-b from-noir-700 via-noir-500 to-noir-700 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 font-one mb-4">
            Erreur lors du chargement du profil
          </p>
        </div>
      </div>
    );
  }

  const cityLabel = profileData.clientProfile?.city || "Non renseignée";

  return (
    <div className="relative">
    
      <div className="relative mx-auto px-4 sm:px-6 py-8 lg:px-20">
        <section className="mb-8 overflow-hidden rounded-3xl border border-white/12 bg-noir-700/85 shadow-2xl backdrop-blur-lg">
          <div className="h-20 bg-linear-to-r from-tertiary-500/35 via-blue-400/20 to-cuatro-500/35"></div>

          <div className="px-4 pb-5 pt-4 sm:px-6 sm:pb-6 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end sm:gap-6">
                <div className="relative -mt-16 shrink-0">
                  <div className="relative h-32 w-32 overflow-hidden rounded-3xl border-4 border-noir-700 bg-linear-to-br from-tertiary-400/20 to-tertiary-500/20 ring-1 ring-white/15 sm:h-36 sm:w-36">
                    {profileData.image ? (
                      <Image
                        src={profileData.image}
                        alt="Avatar"
                        fill
                        sizes="(min-width: 640px) 144px, 128px"
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <FaUser className="h-12 w-12 text-tertiary-300" />
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 h-3.5 w-3.5 rounded-full border-2 border-noir-700 bg-emerald-500"></div>
                </div>

                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-white font-two sm:text-3xl lg:text-4xl">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <p className="mt-1 text-sm text-white/70 font-one sm:text-xs">
                    Espace client Inkera
                  </p>

                  <div className="mt-3 flex flex-col gap-2 text-white/80 font-one sm:flex-row sm:flex-wrap sm:gap-4">
                    <div className="flex items-center justify-center gap-2 text-xs sm:justify-start sm:text-sm">
                      <FaEnvelope className="text-tertiary-400" />
                      <span className="truncate">{profileData.email}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <Link
                      href="/mon-profil/modifier"
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/6 px-4 py-2 text-xs text-white transition-all duration-300 hover:border-white/25 hover:bg-white/10 font-one"
                      aria-label="Modifier les informations de mon profil"
                    >
                      <FaEdit className="h-3 w-3" />
                      Modifier le profil
                    </Link>
                    <LogoutBtn>Déconnexion</LogoutBtn>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:gap-3 lg:min-w-[320px]">
                {[
                  { label: "Ville", value: cityLabel },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-noir-700/55 px-3 py-3 text-center"
                  >
                    <div className="text-[11px] uppercase tracking-[0.16em] text-white/50 font-one">
                      {item.label}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white font-two sm:text-base">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-1">
              <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto overflow-y-hidden px-1 py-2 [scrollbar-width:none] [-ms-overflow-style:none] sm:mx-0 sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-1 sm:overflow-visible sm:px-0 sm:py-0">
                {(
                  [
                    { key: "rdv", icon: FaCalendarAlt, label: "Rendez-vous" },
                    { key: "favoris", icon: FaHeart, label: "Favoris" },
                    { key: "infos", icon: FaUser, label: "Infos" },
                    { key: "mesavis", icon: FaEnvelope, label: "Avis" },
                  ] as const
                ).map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`group relative flex shrink-0 cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition-all duration-300 font-one sm:rounded-none sm:border-transparent sm:px-0 sm:py-3 ${
                      activeTab === key
                        ? "border-tertiary-400/20 bg-tertiary-400/15 text-white shadow-[inset_0_-2px_0_0_var(--color-tertiary-400)] sm:border-transparent sm:bg-transparent"
                        : "border-white/10 bg-white/4 text-white/60 hover:text-white/85 sm:border-transparent sm:bg-transparent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                    <span
                      className={`absolute bottom-0 left-0 hidden h-0.5 w-full rounded-full transition-all duration-300 sm:block ${
                        activeTab === key
                          ? "bg-tertiary-400 opacity-100"
                          : "bg-tertiary-400 opacity-0 group-hover:opacity-50"
                      }`}
                    ></span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          {activeTab === "infos" && <InfosTab user={profileData} />}
          {activeTab === "favoris" && <FavorisTab />}
          {activeTab === "rdv" && <RendezVousTab />}
          {activeTab === "mesavis" && <MesAvisTab />}
        </div>
      </div>
    </div>
  );
}
