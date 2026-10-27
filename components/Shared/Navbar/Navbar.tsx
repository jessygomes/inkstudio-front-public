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
    <nav aria-label="Navigation principale" className="mx-4 flex items-center justify-between gap-4 py-3 font-one sm:mx-8 lg:mx-10 xl:mx-20">
      <Link href="/" aria-hidden={!showLogo} tabIndex={showLogo ? undefined : -1} className={"flex w-32 shrink-0 items-center rounded-sm transition-opacity focus-visible:outline-2 focus-visible:outline-tertiary-400 xl:w-36 " + (showLogo ? "opacity-100" : "pointer-events-none opacity-0")}><Image src="/logo/logo_inline_people_white.png" alt="Inkera People — Accueil" width={150} height={50} className="h-auto w-full" /></Link>
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
              <button ref={triggerRef} type="button" onClick={() => setIsProfileMenuOpen(value => !value)} aria-label="Mon espace client" aria-expanded={isProfileMenuOpen} aria-controls="desktop-profile-menu" className="relative flex size-10 items-center justify-center rounded-xl border border-white/15 bg-noir-800 text-white/75 transition hover:border-tertiary-400/40 focus-visible:outline-2 focus-visible:outline-tertiary-400">
                {session.user.image ? <Image src={session.user.image} alt="" fill sizes="40px" className="rounded-xl object-cover" /> : <UserRound size={18} aria-hidden="true" />}
                {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-tertiary-500 px-1 text-[9px] text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
              </button>
              {isProfileMenuOpen && <div id="desktop-profile-menu" className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-noir-800 p-2 shadow-2xl shadow-black/40">
                <Link href="/mon-profil" onClick={() => setIsProfileMenuOpen(false)} className="mb-2 flex items-center justify-between gap-3 rounded-xl border-b border-white/10 px-3 py-3 transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-tertiary-400"><span className="min-w-0"><span className="block text-[10px] uppercase tracking-wider text-tertiary-400">Mon espace client</span><span className="mt-1 block truncate text-sm text-white/85">{session.user.firstName} {session.user.lastName}</span></span><ArrowUpRight size={14} aria-hidden="true" className="shrink-0 text-white/40" /></Link>
                {profileLinks.map(({ href, label, Icon, count }) => <Link key={href} href={href} onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-white/65 transition hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400"><Icon size={15} aria-hidden="true" className="text-white/40" /><span className="flex-1">{label}</span>{count > 0 && <span aria-label={count + " notifications"} className="rounded-full bg-tertiary-400/15 px-1.5 py-0.5 text-[9px] text-tertiary-400">{count > 99 ? "99+" : count}</span>}</Link>)}
                <div className="mt-2 border-t border-white/10 pt-2 text-white/60" onClick={() => setIsProfileMenuOpen(false)}><LogoutBtn>Déconnexion</LogoutBtn></div>
              </div>}
            </div>
          ) : <AppButton href="/se-connecter" className="px-4! text-[13px]! shadow-none!">Se connecter</AppButton>}
        </div>
      </div>
    </nav>
  );
}
