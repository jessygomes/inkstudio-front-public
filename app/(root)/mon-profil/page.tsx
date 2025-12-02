"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/components/Context/UserContext";
import { getClientProfile } from "@/lib/actions/user.action";
import {
  FaUser,
  FaHeart,
  FaCalendarAlt,
  FaEdit,
  FaCog,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

// Import des composants
import InfosTab from "@/components/MonProfil/InfosTab";
import FavorisTab from "@/components/MonProfil/FavorisTab";
import RendezVousTab from "@/components/MonProfil/RendezVousTab";
import { LogoutBtn } from "@/components/Auth/LogoutBtn";
import Image from "next/image";
import Link from "next/link";
import { User } from "@/lib/type";

export default function MonProfilPage() {
  const { isAuthenticated, isClient } = useUser();
  const [activeTab, setActiveTab] = useState<"infos" | "favoris" | "rdv">(
    "infos"
  );

  // État pour les données complètes du profil avec type explicite
  const [profileData, setProfileData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Récupération des données complètes du profil
  useEffect(() => {
    if (!isAuthenticated || !isClient) return;

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
  }, [isAuthenticated, isClient]);

  // Fonction pour rafraîchir les données après modification
  const refreshProfile = async () => {
    const result = await getClientProfile();
    if (result.ok) {
      setProfileData(result.data);
    }
  };

  // Redirection si pas authentifié ou pas client
  if (!isAuthenticated || !isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-noir-700 via-noir-600 to-noir-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 font-one mb-4">
            Vous devez être connecté en tant que client pour accéder à cette
            page.
          </p>
          <Link
            href="/connexion"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-xl transition-all duration-300 font-one text-sm shadow-lg hover:scale-105"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-noir-700 via-noir-600 to-noir-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-tertiary-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/60 font-one">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-noir-700 via-noir-600 to-noir-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 font-one mb-4">
            Erreur lors du chargement du profil
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-noir-700 via-noir-600 to-noir-800 pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Header avec avatar et infos principales */}
        <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-lg border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/20 rounded-2xl flex items-center justify-center border border-tertiary-400/30">
                {profileData.image ? (
                  <Image
                    src={profileData.image}
                    alt="Avatar"
                    width={96}
                    height={96}
                    className="rounded-2xl object-cover"
                  />
                ) : (
                  <FaUser className="w-8 h-8 sm:w-10 sm:h-10 text-tertiary-400" />
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-tertiary-500 hover:bg-tertiary-600 rounded-full flex items-center justify-center transition-colors shadow-lg">
                <FaEdit className="w-3 h-3 text-white" />
              </button>
            </div>

            {/* Infos utilisateur - utiliser les vraies données */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-one font-bold text-white mb-2">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm font-one">
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="w-4 h-4 text-tertiary-400" />
                      {profileData.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="w-4 h-4 text-tertiary-400" />
                      {profileData.clientProfile?.city}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/mon-profil/modifier"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-xl transition-all duration-300 font-one text-sm shadow-lg hover:scale-105"
                  >
                    <FaEdit className="w-4 h-4" />
                    Modifier
                  </Link>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:from-white/[0.12] hover:to-white/[0.06] text-white border border-white/20 hover:border-white/30 rounded-xl transition-all duration-300 font-one text-sm">
                    <FaCog className="w-4 h-4" />
                    Paramètres
                  </button>

                  <LogoutBtn>Se Déconnecter</LogoutBtn>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(
            [
              { key: "rdv", icon: FaCalendarAlt, label: "Mes rendez-vous" },
              { key: "favoris", icon: FaHeart, label: "Salons favoris" },
              { key: "infos", icon: FaUser, label: "Mes informations" },
            ] as const
          ).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-one text-sm transition-all duration-300 ${
                activeTab === key
                  ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white shadow-lg shadow-tertiary-500/25"
                  : "bg-gradient-to-br from-white/[0.08] to-white/[0.02] text-white/80 hover:text-white hover:from-white/[0.12] hover:to-white/[0.06] border border-white/20 hover:border-white/30"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-6">
          {activeTab === "infos" && (
            <InfosTab
              user={profileData}
              // appointmentsCount={realAppointments.length}
              // favoritesCount={realFavorites.length}
              // onUpdate={refreshProfile} // Callback pour rafraîchir après modification
            />
          )}

          {activeTab === "favoris" && <FavorisTab />}

          {activeTab === "rdv" && <RendezVousTab />}
        </div>
      </div>
    </div>
  );
}
