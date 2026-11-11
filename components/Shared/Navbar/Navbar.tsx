"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CalendarDays, Heart, Images, MessageCircle, Settings, Star, UserRound } from "lucide-react";
import { useMessagingContext } from "@/components/Context/MessageProvider";
import { LogoutBtn } from "@/components/Auth/LogoutBtn";
import AppButton from "@/components/Shared/AppButton";
import NavbarSocialLinks from "./NavbarSocialLinks";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/trouver-un-salon", label: "Trouver un salon" },
  { href: "/inspiration", label: "Inspirations" },
  { href: "/journal", label: "Journal" },
  { href: "/en-savoir-plus", label: "En savoir plus" },
];

export default function Navbar({ showLogo = false }: { showLogo?: boolean }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { unreadCount, proposalCount, messageCount } = useMessagingContext();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const profileLinks = [
    { href: "/mon-profil?tab=rdv", label: "Rendez-vous", Icon: CalendarDays, count: 0 },
    { href: "/mon-profil?tab=messagerie", label: "Messagerie", Icon: MessageCircle, count: messageCount },
    { href: "/mon-profil?tab=moodboard", label: "Moodboards", Icon: Images, count: proposalCount },
    { href: "/mon-profil?tab=favoris", label: "Favoris", Icon: Heart, count: 0 },
    { href: "/mon-profil?tab=mesavis", label: "Mes avis", Icon: Star, count: 0 },
    { href: "/mon-profil?tab=infos", label: "Mes informations", Icon: Settings, count: 0 },
  ];

  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const outside = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) setIsProfileMenuOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setIsProfileMenuOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [isProfileMenuOpen]);

  return (
    <nav aria-label="Navigation principale" className="flex items-center justify-between gap-4 py-3 font-one mx-page">
      <Link href="/" aria-hidden={!showLogo} tabIndex={showLogo ? undefined : -1} className={"flex size-9 shrink-0 items-center rounded-xl transition-opacity focus-visible:outline-2 focus-visible:outline-tertiary-400 xl:size-10 " + (showLogo ? "opacity-100" : "pointer-events-none opacity-0")}><Image src="/logo/Logo16.png" alt="Inkera — Accueil" width={96} height={96} className="size-full object-contain" priority /></Link>
      <div className="flex items-center gap-4 xl:gap-6">
        <ul className="flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
            return <li key={href}><Link href={href} aria-current={active ? "page" : undefined} className={"block rounded-xl px-2.5 py-2.5 whitespace-nowrap text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-tertiary-400 xl:px-3 " + (active ? "bg-white/5 text-white" : "text-white/60 hover:bg-white/5 hover:text-white")}>{label}</Link></li>;
          })}
        </ul>
        <div className="flex items-center gap-3 border-l border-white/10 pl-4">
          <NavbarSocialLinks />
          {status === "authenticated" && session?.user ? (
            <div ref={profileMenuRef} className="relative">
              <button ref={triggerRef} type="button" onClick={() => setIsProfileMenuOpen(value => !value)} aria-label="Mon espace client" aria-expanded={isProfileMenuOpen} aria-controls="desktop-profile-menu" className="relative flex size-10 items-center justify-center overflow-hidden rounded-xl bg-white/6 text-white/75 transition hover:opacity-85 focus-visible:outline-2 focus-visible:outline-tertiary-400">
                {session.user.image ? <Image src={session.user.image} alt="" fill sizes="40px" className="rounded-xl object-cover" /> : <UserRound size={18} aria-hidden="true" />}
                {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-tertiary-500 px-1 text-[9px] text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
              </button>
              {isProfileMenuOpen && <div id="desktop-profile-menu" className="absolute right-0 top-full z-50 mt-3 w-72 rounded-3xl bg-noir-700 p-2 font-one shadow-2xl shadow-black/70">
                <Link href="/mon-profil" onClick={() => setIsProfileMenuOpen(false)} className="group flex items-center gap-3 rounded-2xl bg-linear-to-br from-tertiary-400/20 via-tertiary-500/10 to-cuatro-500/20 p-3 transition hover:from-tertiary-400/30 hover:to-cuatro-500/30 focus-visible:outline-2 focus-visible:outline-tertiary-400">
                  <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/10 text-white/70">{session.user.image ? <Image src={session.user.image} alt="" fill sizes="44px" className="object-cover" /> : <UserRound size={18} aria-hidden="true" />}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-white">{session.user.firstName} {session.user.lastName}</span><span className="mt-0.5 block text-[11px] text-white/55">Voir mon espace client</span></span>
                  <ArrowUpRight size={15} aria-hidden="true" className="shrink-0 text-white/45 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                </Link>
                <nav aria-label="Mon espace client" className="mt-2 space-y-0.5">
                  {profileLinks.map(({ href, label, Icon, count }) => <Link key={href} href={href} onClick={() => setIsProfileMenuOpen(false)} className="group flex items-center gap-3 rounded-xl px-2 py-1.5 text-[13px] text-white/70 transition hover:bg-white/6 hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/5 text-white/45 transition group-hover:text-tertiary-400"><Icon size={15} aria-hidden="true" /></span><span className="flex-1">{label}</span>{count > 0 && <span aria-label={count + " notifications"} className="grid min-w-5 place-items-center rounded-xl bg-linear-to-r from-tertiary-400 to-tertiary-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">{count > 99 ? "99+" : count}</span>}</Link>)}
                </nav>
                <div className="mt-2 pt-1"><LogoutBtn onDone={() => setIsProfileMenuOpen(false)} className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 text-[13px] text-white/50 transition hover:bg-red-400/10 [&>svg]:mx-2 hover:text-red-300 focus-visible:outline-2 focus-visible:outline-tertiary-400">Déconnexion</LogoutBtn></div>
              </div>}
            </div>
          ) : <AppButton href="/se-connecter" className="px-4! text-[13px]! shadow-none!">Se connecter</AppButton>}
        </div>
      </div>
    </nav>
  );
}
