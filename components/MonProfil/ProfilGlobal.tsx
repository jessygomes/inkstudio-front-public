/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getClientProfile } from "@/lib/actions/user.action";
import { User } from "@/lib/type";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMessagingContext } from "@/components/Context/MessageProvider";
import InfosTab from "./InfosTab";
import FavorisTab from "./FavorisTab";
import RendezVousTab from "./RendezVousTab";
import MesAvisTab from "./MesAvisTab";
import MoodboardTab from "./MoodboardTab";
import PeopleInboxWorkspace from "./PeopleInboxWorkspace";


import Image from "next/image";
import { CalendarDays, Heart, Images, MessageCircle, Pencil, Search, Star, UserRound } from "lucide-react";

type TabKey = "rdv" | "messagerie" | "moodboard" | "favoris" | "mesavis" | "infos";
const VALID_TABS: TabKey[] = ["rdv", "messagerie", "moodboard", "favoris", "mesavis", "infos"];

export default function ProfilGlobal(user: User) {
  const router = useRouter();
  const { proposalCount, messageCount } = useMessagingContext();
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
    params.delete("conversation");
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

  if (loading) {
    return (
      <div role="status" aria-label="Chargement du profil" className="py-6 px-page">
        <div aria-hidden="true" className="mb-6 space-y-3 motion-safe:animate-pulse sm:space-y-4">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="size-14 shrink-0 rounded-2xl bg-white/5 sm:size-18" />
            <div className="min-w-0 flex-1 space-y-2"><div className="h-2 w-24 rounded bg-white/5" /><div className="h-6 w-2/3 max-w-56 rounded-lg bg-white/10" /><div className="hidden h-3 w-3/4 max-w-80 rounded bg-white/5 sm:block" /></div>
            <div className="size-11 shrink-0 rounded-xl bg-white/5 sm:w-36" />
          </div>
          <div className="mt-6 flex gap-1 overflow-hidden rounded-2xl bg-noir-700 p-1.5">{Array.from({ length: 6 }, (_, index) => <div key={index} className={"h-11 w-28 shrink-0 rounded-xl lg:flex-1 " + (index === 0 ? "bg-white/8" : "bg-white/3")} />)}</div>
        </div>
        <div aria-hidden="true" className="space-y-4 motion-safe:animate-pulse">{[0, 1, 2].map(index => <div key={index} className="h-40 rounded-3xl bg-white/5" />)}</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-noir-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 font-one mb-4">
            Erreur lors du chargement du profil
          </p>
        </div>
      </div>
    );
  }

  const createdAt = profileData.createdAt ? new Date(profileData.createdAt) : null;
  const memberSince = createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : null;
  const hour = new Date().getHours();
  const greeting = hour >= 18 || hour < 5 ? "Bonsoir" : "Bonjour";
  const initials = [profileData.firstName, profileData.lastName].map((name) => name?.trim().charAt(0) || "").join("").toLocaleUpperCase("fr-FR");

  return (
    <div className="relative">
    
      <div className="relative py-6 px-page">
        {/* Identité + rubriques : un seul bloc, sur le fond de l'app. */}
        {/* Identité + rubriques : un seul bloc. */}
        <section aria-label="Mon profil" className="mb-8 font-one">
          <header className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-4">
            <div className="relative shrink-0">
              <div className="relative grid size-18 place-items-center overflow-hidden rounded-2xl bg-linear-to-br from-tertiary-400 via-tertiary-500 to-cuatro-500 shadow-xl shadow-black/40 sm:size-20">
                {profileData.image ? <Image src={profileData.image} alt="Photo de profil" fill sizes="80px" className="object-cover" priority /> : <span aria-hidden="true" className="text-2xl font-semibold text-white">{initials || <UserRound size={24} />}</span>}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/45">{greeting},</p>
              <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                <h1 className="wrap-anywhere text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">{profileData.firstName} {profileData.lastName}</h1>
                <Link href="/mon-profil/modifier" aria-label="Modifier mon profil" title="Modifier mon profil" className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/6 hover:text-tertiary-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-400"><Pencil size={15} aria-hidden="true" /></Link>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-white/55">
                {memberSince && <span className="rounded-xl bg-white/5 px-2.5 py-1">Membre depuis {memberSince}</span>}
                {(messageCount > 0 || proposalCount > 0) && <span className="rounded-xl bg-tertiary-400/12 px-2.5 py-1 text-tertiary-400">{[messageCount > 0 && `${messageCount} message${messageCount > 1 ? "s" : ""} non lu${messageCount > 1 ? "s" : ""}`, proposalCount > 0 && `${proposalCount} proposition${proposalCount > 1 ? "s" : ""}`].filter(Boolean).join(" · ")}</span>}
              </div>
            </div>
            <Link href="/trouver-un-salon" className="hidden min-h-11 items-center gap-2 rounded-xl bg-white/6 px-4 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400 sm:inline-flex"><Search size={14} aria-hidden="true" />Trouver un salon</Link>
          </header>

          {/* Rubriques : contrôle segmenté, l'onglet actif est surélevé. */}
          <nav aria-label="Rubriques du profil" className="mt-6 sm:mt-7">
            <div className="no-scrollbar bleed-page overflow-x-auto sm:mx-0 sm:px-0">
              <div className="flex w-max min-w-full gap-1 rounded-2xl bg-noir-700 p-1.5 lg:grid lg:w-full lg:grid-cols-6">
                {([
                  { key: "rdv", icon: CalendarDays, label: "Rendez-vous" },
                  { key: "messagerie", icon: MessageCircle, label: "Messagerie" },
                  { key: "moodboard", icon: Images, label: "Moodboard" },
                  { key: "favoris", icon: Heart, label: "Favoris" },
                  { key: "mesavis", icon: Star, label: "Mes avis" },
                  { key: "infos", icon: UserRound, label: "Mes informations" },
                ] as const).map(item => {
                  const Icon = item.icon;
                  const count = item.key === "moodboard" ? proposalCount : item.key === "messagerie" ? messageCount : 0;
                  const selected = activeTab === item.key;
                  return (
                    <button key={item.key} type="button" aria-current={selected ? "page" : undefined} aria-controls="profile-content" onClick={() => handleTabChange(item.key)}
                      className={`group relative flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-400 ${selected ? "bg-noir-500 font-medium text-white shadow-lg shadow-black/30" : "text-white/50 hover:bg-white/4 hover:text-white/85"}`}>
                      <Icon size={16} aria-hidden="true" className={selected ? "text-tertiary-400" : "text-white/35 transition-colors group-hover:text-white/65"} />
                      <span className="whitespace-nowrap">{item.label}</span>
                      {count > 0 && <span aria-hidden="true" className="grid min-h-5 min-w-5 place-items-center rounded-xl bg-linear-to-r from-tertiary-400 to-tertiary-500 px-1.5 text-[10px] font-semibold leading-none text-white">{count > 99 ? "99+" : count}</span>}
                      {count > 0 && <span className="sr-only">{count} {item.key === "moodboard" ? "propositions en attente" : "messages non lus"}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </section>

        <div id="profile-content" className="space-y-6">
          {activeTab === "infos" && <InfosTab user={profileData} />}
          {activeTab === "moodboard" && <MoodboardTab />}
          {activeTab === "favoris" && <FavorisTab />}
          {activeTab === "rdv" && <RendezVousTab />}
          {activeTab === "messagerie" && <PeopleInboxWorkspace />}
          {activeTab === "mesavis" && <MesAvisTab />}
        </div>
      </div>
    </div>
  );
}
