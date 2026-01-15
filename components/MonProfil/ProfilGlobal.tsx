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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-noir-700 via-noir-500 to-noir-700 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-tertiary-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/60 font-one">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-noir-700 via-noir-500 to-noir-700 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 font-one mb-4">
            Erreur lors du chargement du profil
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Header modernisé */}
        <div className=" backdrop-blur-lg border border-white/10 hover:border-white/20 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl transition-all duration-300 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar modernisé - Plus grand sur mobile */}
            <div className="relative flex-shrink-0">
              <div className="relative w-32 h-32 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/20 rounded-2xl flex items-center justify-center overflow-hidden border border-tertiary-400/30 ring-4 ring-white/5">
                {profileData.image ? (
                  <Image
                    src={profileData.image}
                    alt="Avatar"
                    fill
                    sizes="(min-width: 1024px) 128px, (min-width: 640px) 112px, 128px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <FaUser className="w-12 h-12 sm:w-12 sm:h-12 lg:w-12 lg:h-12 text-tertiary-400" />
                )}
              </div>
              {/* Status indicator */}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-noir-700 ring-2 ring-emerald-500/30"></div>
            </div>

            {/* Infos utilisateur modernisées */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="space-y-4">
                {/* Nom et titre */}
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-one font-bold text-white mb-1">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                </div>

                {/* Infos de contact */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-white/80 text-sm font-one justify-center sm:justify-start">
                    <div className="w-6 h-6 rounded-lg bg-tertiary-500/20 flex items-center justify-center flex-shrink-0">
                      <FaEnvelope className="w-3 h-3 text-tertiary-400" />
                    </div>
                    <span className="truncate">{profileData.email}</span>
                  </div>
                  {profileData.clientProfile?.city && (
                    <div className="flex items-center gap-2 text-white/80 text-sm font-one justify-center sm:justify-start">
                      <div className="w-6 h-6 rounded-lg bg-tertiary-500/20 flex items-center justify-center flex-shrink-0">
                        <FaMapMarkerAlt className="w-3 h-3 text-tertiary-400" />
                      </div>
                      <span>{profileData.clientProfile.city}</span>
                    </div>
                  )}
                </div>

                {/* Actions compactes - width auto et flex wrap */}
                <div className="flex gap-2 pt-2 justify-center sm:justify-start">
                  <Link
                    href="/mon-profil/modifier"
                    className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg font-one text-xs transition-all duration-300 shadow-lg shadow-tertiary-500/20 hover:shadow-tertiary-500/30 whitespace-nowrap"
                    aria-label="Modifier les informations de mon profil"
                  >
                    <FaEdit className="w-3 h-3" />
                    Modifier
                  </Link>
                  {/* <button className="cursor-pointer flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/15 text-white/80 hover:text-white border border-white/20 hover:border-white/30 rounded-lg font-one text-xs transition-all duration-300 whitespace-nowrap">
                    <FaCog className="w-3 h-3" />
                    Paramètres
                  </button> */}
                  <LogoutBtn>Déconnexion</LogoutBtn>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets modernisée */}
        <div className="flex flex-wrap gap-2 mb-8">
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
              className={`cursor-pointer flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg font-one text-xs sm:text-sm font-medium transition-all duration-300 ${
                activeTab === key
                  ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white shadow-lg shadow-tertiary-500/25"
                  : "bg-gradient-to-br from-white/[0.08] to-white/[0.02] text-white/80 hover:text-white hover:from-white/[0.12] hover:to-white/[0.06] border border-white/20 hover:border-white/30"
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.slice(0, 3)}</span>
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
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
