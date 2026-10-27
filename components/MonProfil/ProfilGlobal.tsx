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
import { CalendarDays, Heart, Images, MessageCircle, Pencil, Star, UserRound } from "lucide-react";

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
      <div role="status" aria-label="Chargement du profil" className="mx-auto px-4 py-6 sm:px-6 lg:px-8 xl:px-12">
        <div aria-hidden="true" className="mb-6 space-y-3 motion-safe:animate-pulse sm:space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-noir-800 p-4 sm:gap-5 sm:p-6">
            <div className="size-14 shrink-0 rounded-2xl bg-white/5 sm:size-18" />
            <div className="min-w-0 flex-1 space-y-2"><div className="h-2 w-24 rounded bg-white/5" /><div className="h-6 w-2/3 max-w-56 rounded-lg bg-white/10" /><div className="hidden h-3 w-3/4 max-w-80 rounded bg-white/5 sm:block" /></div>
            <div className="size-11 shrink-0 rounded-xl bg-white/5 sm:w-36" />
          </div>
          <div className="grid grid-cols-3 gap-1.5 lg:grid-cols-6">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-14 rounded-xl border border-white/8 bg-white/5 sm:h-11" />)}</div>
        </div>
        <div aria-hidden="true" className="space-y-4 motion-safe:animate-pulse">{[0, 1, 2].map(index => <div key={index} className="h-32 rounded-2xl border border-white/10 bg-white/5" />)}</div>
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

  const initials = [profileData.firstName, profileData.lastName].map((name) => name?.trim().charAt(0) || "").join("").toLocaleUpperCase("fr-FR");

  return (
    <div className="relative">
    
      <div className="relative mx-auto px-4 sm:px-6 py-6 lg:px-8 xl:px-12">
        <section aria-label="Mon profil" className="mb-6 space-y-3 font-one sm:mb-7 sm:space-y-4">
          <header className="relative flex min-w-0 flex-wrap items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-noir-800 p-4 sm:gap-5 sm:p-6">
            <div className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-noir-800 ring-4 ring-white/3 sm:size-18">
              {profileData.image ? <Image src={profileData.image} alt="Photo de profil" fill sizes="(min-width: 640px) 72px, 56px" className="object-cover" priority /> : <span aria-hidden="true" className="text-xl font-semibold text-tertiary-400 sm:text-2xl">{initials || <UserRound size={22} />}</span>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-tertiary-400/80 sm:text-[10px]">Mon espace Inkera</p>
              <h1 className="wrap-anywhere text-xl font-semibold leading-tight tracking-tight text-white min-[380px]:text-2xl sm:text-3xl">{profileData.firstName} {profileData.lastName}</h1>
              <p className="mt-1.5 hidden text-xs leading-5 text-white/40 sm:block">Vos projets, vos inspirations et vos échanges, au même endroit.</p>
            </div>
            <Link href="/mon-profil/modifier" aria-label="Modifier mon profil" title="Modifier mon profil" className="ml-auto inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/3 px-3 text-xs text-white/55 transition hover:border-white/20 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-400 sm:px-4"><Pencil size={14} aria-hidden="true" /><span className="hidden sm:inline">Modifier mon profil</span></Link>
            <p className="w-full text-[11px] leading-5 text-white/40 sm:hidden">Vos projets, vos inspirations et vos échanges, au même endroit.</p>
          </header>
          <nav aria-label="Rubriques du profil" className="grid grid-cols-3 gap-1.5 lg:grid-cols-6">
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
              return <button key={item.key} type="button" aria-current={selected ? "page" : undefined} aria-controls="profile-content" onClick={() => handleTabChange(item.key)} style={selected ? { background: "linear-gradient(90deg, color-mix(in srgb, var(--color-tertiary-500) 22%, var(--color-noir-800)), color-mix(in srgb, var(--color-cuatro-600) 22%, var(--color-noir-800))) padding-box, linear-gradient(90deg, color-mix(in srgb, var(--color-tertiary-500) 60%, transparent), color-mix(in srgb, var(--color-cuatro-600) 60%, transparent)) border-box" } : undefined} className={`group relative flex min-h-14 min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border px-1.5 py-2 text-[11px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-400 sm:min-h-11 sm:flex-row sm:justify-start sm:gap-2 sm:px-2.5 sm:text-xs lg:flex-col lg:justify-center xl:flex-row xl:justify-start ${selected ? "border-transparent font-semibold text-white" : "border-white/8 bg-noir-800 text-white/50 hover:border-white/15 hover:bg-white/4 hover:text-white/80"}`}>
                <span className={`grid size-6 shrink-0 place-items-center rounded-lg transition-colors ${selected ? "bg-black/15 text-white" : "bg-white/4 text-white/35 group-hover:text-white/60"}`}><Icon size={15} aria-hidden="true" /></span>
                <span className="min-w-0 text-center leading-4 sm:text-left lg:text-center xl:text-left">{item.label}</span>
                {count > 0 && <span className={`absolute right-1.5 top-1.5 grid min-h-4 min-w-4 place-items-center rounded-md px-1 text-[9px] font-semibold leading-none ${selected ? "bg-black/20 text-white" : "bg-tertiary-400/15 text-tertiary-400"}`} aria-hidden="true">{count > 99 ? "99+" : count}</span>}
                {count > 0 && <span className="sr-only">{count} {item.key === "moodboard" ? "propositions en attente" : "messages non lus"}</span>}
              </button>;
            })}
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
