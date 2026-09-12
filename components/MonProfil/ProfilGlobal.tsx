/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getClientProfile } from "@/lib/actions/user.action";
import { User } from "@/lib/type";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InfosTab from "./InfosTab";
import FavorisTab from "./FavorisTab";
import RendezVousTab from "./RendezVousTab";
import MesAvisTab from "./MesAvisTab";
import MoodboardTab from "./MoodboardTab";

import {
  FaUser,
  FaHeart,
  FaCalendarAlt,
  FaEdit,
  FaPalette,
} from "react-icons/fa";
import Image from "next/image";
import { Star } from "lucide-react";

type TabKey = "rdv" | "moodboard" | "favoris" | "mesavis" | "infos";
const VALID_TABS: TabKey[] = ["rdv", "moodboard", "favoris", "mesavis", "infos"];

export default function ProfilGlobal(user: User) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get("tab") as TabKey | null;
  const initialTab: TabKey =
    tabFromUrl && VALID_TABS.includes(tabFromUrl) ? tabFromUrl : "rdv";

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  useEffect(() => {
    const nextTab: TabKey =
      tabFromUrl && VALID_TABS.includes(tabFromUrl) ? tabFromUrl : "rdv";

    setActiveTab((prev) => (prev === nextTab ? prev : nextTab));
  }, [tabFromUrl]);

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", key);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

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
          <div className="border-b border-white/10 pb-6 mb-8 animate-pulse">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar skeleton */}
              <div className="relative shrink-0">
                <div className="h-16 w-16 sm:h-20 sm:w-20 bg-white/5 rounded-full"></div>
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

  const initials = [profileData.firstName, profileData.lastName].map((name) => name?.trim().charAt(0) || "").join("").toLocaleUpperCase("fr-FR");

  return (
    <div className="relative">
    
      <div className="relative mx-auto px-4 sm:px-6 py-8 lg:px-20">
        <section aria-label="Mon profil" className="mb-8">
          <div className="border-b border-white/10 lg:flex lg:items-end lg:gap-6 bg-linear-to-l from-noir-700 via-noir-500 to-noir-700 pt-5 px-5 rounded-t-2xl">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between lg:w-64 lg:shrink-0 lg:pb-3 xl:w-72">
              <div className="flex min-w-0 items-center gap-4 sm:gap-6 lg:gap-3">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/5 sm:h-20 sm:w-20 lg:h-12 lg:w-12">
                  {profileData.image ? (
                    <Image src={profileData.image} alt="Photo de profil" fill sizes="(min-width: 1024px) 48px, (min-width: 640px) 80px, 64px" className="object-cover" priority />
                  ) : (
                    <span aria-hidden="true" className="font-two text-2xl font-medium text-tertiary-400">{initials || <FaUser className="h-6 w-6" />}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="mb-2 font-one text-xs uppercase tracking-[0.2em] text-tertiary-400">Mon espace Inkera</p>
                  <h1 className="wrap-anywhere font-two text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-3xl">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                </div>
              </div>
            </div>

            <div className="mt-6 lg:mt-0 lg:min-w-0 lg:flex-1">
              <nav aria-label="Rubriques du profil" className="-mb-px flex overflow-x-auto gap-x-5 sm:gap-x-8 lg:justify-end-safe lg:gap-x-4 xl:gap-x-6">
                {([
                  { key: "rdv", icon: FaCalendarAlt, label: "Rendez-vous" },
                  { key: "moodboard", icon: FaPalette, label: "Moodboard" },
                  { key: "favoris", icon: FaHeart, label: "Favoris" },
                  { key: "mesavis", icon: Star, label: "Mes avis" },
                  { key: "infos", icon: FaUser, label: "Mes informations" },
                  { key: "modifier", icon: FaEdit, label: "Modifier le profil", href: "/mon-profil/modifier" },
                ] as const).map((item) => {
                  const Icon = item.icon;
                  const className = `flex min-h-12 shrink-0 whitespace-nowrap cursor-pointer items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors font-one focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-400 ${activeTab === item.key ? "border-tertiary-400 text-tertiary-400" : "border-transparent text-white/60 hover:border-white/30 hover:text-white"}`;
                  const content = <><Icon aria-hidden="true" className="h-4 w-4 shrink-0" /><span>{item.label}</span></>;

                  return "href" in item ? (
                    <Link key={item.key} href={item.href} className={className}>
                      {content}
                    </Link>
                  ) : (
                    <button
                      key={item.key}
                      type="button"
                      aria-current={activeTab === item.key ? "page" : undefined}
                      aria-controls="profile-content"
                      onClick={() => handleTabChange(item.key)}
                      className={className}
                    >
                      {content}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </section>

        <div id="profile-content" className="space-y-6">
          {activeTab === "infos" && <InfosTab user={profileData} />}
          {activeTab === "moodboard" && <MoodboardTab />}
          {activeTab === "favoris" && <FavorisTab />}
          {activeTab === "rdv" && <RendezVousTab />}
          {activeTab === "mesavis" && <MesAvisTab />}
        </div>
      </div>
    </div>
  );
}
