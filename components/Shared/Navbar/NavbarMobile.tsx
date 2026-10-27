"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, CalendarDays, Heart, Home, Images, Menu, MessageCircle, Newspaper, Search, Sparkles, UserRound, X } from "lucide-react";
import { useMessagingContext } from "@/components/Context/MessageProvider";
import AppButton from "@/components/Shared/AppButton";
import NavbarSocialLinks from "./NavbarSocialLinks";

const links = [
  { href: "/", label: "Accueil", Icon: Home },
  { href: "/trouver-un-salon", label: "Trouver un salon", Icon: Search },
  { href: "/inspiration", label: "Inspirations", Icon: Images },
  { href: "/journal", label: "Le journal", Icon: Newspaper },
  { href: "/en-savoir-plus", label: "Découvrir Inkera", Icon: Sparkles },
];

export default function NavbarMobile() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, proposalCount, messageCount } = useMessagingContext();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const authenticated = status === "authenticated" && !!session?.user;
  const close = () => setIsOpen(false);
  const accountLinks = [
    { href: "/mon-profil?tab=rdv", label: "Rendez-vous", Icon: CalendarDays, count: 0 },
    { href: "/mon-profil?tab=messagerie", label: "Messagerie", Icon: MessageCircle, count: messageCount },
    { href: "/mon-profil?tab=moodboard", label: "Moodboards", Icon: Images, count: proposalCount },
    { href: "/mon-profil?tab=favoris", label: "Favoris", Icon: Heart, count: 0 },
  ];

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const trigger = triggerRef.current;
    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
      trigger?.focus();
    };
  }, [isOpen]);

  return (
    <nav aria-label="Navigation mobile" className="ml-auto font-one">
      <div className="flex items-center gap-2 text-white">
        {authenticated ? (
          <Link href="/mon-profil" aria-label="Mon compte client" className="relative flex size-10 items-center justify-center rounded-xl border border-white/15 bg-noir-800 focus-visible:outline-2 focus-visible:outline-tertiary-400">
            {session.user.image ? <Image src={session.user.image} alt="" fill sizes="40px" className="rounded-xl object-cover" /> : <UserRound size={18} aria-hidden="true" />}
            {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-tertiary-500 px-1 text-[9px] text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
          </Link>
        ) : <AppButton href="/se-connecter" className="px-3! text-xs! shadow-none!">Connexion</AppButton>}
        <button ref={triggerRef} type="button" onClick={() => setIsOpen(true)} aria-label="Ouvrir le menu" aria-expanded={isOpen} aria-controls="mobile-navigation" className="flex size-10 items-center justify-center rounded-xl border border-white/15 text-white/85 transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-tertiary-400"><Menu size={21} aria-hidden="true" /></button>
      </div>

      {isOpen && createPortal(
        <dialog ref={dialogRef} id="mobile-navigation" aria-labelledby="mobile-navigation-title" onCancel={close} onClick={event => { if (event.target === event.currentTarget) close(); }} className="fixed inset-y-0 left-auto right-0 m-0 ml-auto h-dvh max-h-dvh w-[calc(100%_-_1rem)] max-w-[390px] border-0 border-l border-white/10 bg-noir-800 p-0 text-white shadow-2xl backdrop:bg-black/65 backdrop:backdrop-blur-sm">
          <div className="flex h-full flex-col">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-5">
              <Link href="/" onClick={close}><Image src="/logo/logo_inline_people_white.png" alt="Inkera People — Accueil" width={150} height={50} className="h-auto w-32" /></Link>
              <button type="button" onClick={close} aria-label="Fermer le menu" className="flex size-9 items-center justify-center rounded-xl border border-white/10 text-white/60 transition hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400"><X size={18} aria-hidden="true" /></button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6">
              <h2 id="mobile-navigation-title" className="mb-4 text-[10px] uppercase tracking-[0.18em] text-white/40">Explorer Inkera</h2>
              <ul className="space-y-1.5">
                {links.map(({ href, label, Icon }) => {
                  const active = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
                  return <li key={href}><Link href={href} onClick={close} aria-current={active ? "page" : undefined} className={"group flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition focus-visible:outline-2 focus-visible:outline-tertiary-400 " + (active ? "border-tertiary-400/20 bg-tertiary-400/10 text-white" : "border-transparent text-white/65 hover:bg-white/5 hover:text-white")}><Icon size={18} strokeWidth={1.5} aria-hidden="true" className={active ? "text-tertiary-400" : "text-white/40"} /><span className="flex-1">{label}</span><ArrowUpRight size={14} aria-hidden="true" className={active ? "text-tertiary-400" : "text-white/20 group-hover:text-white/60"} /></Link></li>;
                })}
              </ul>

              <div className="mt-6 border-t border-white/10 pt-5">
                <h3 className="mb-4 text-[10px] uppercase tracking-[0.18em] text-white/40">Mon espace client</h3>
                {authenticated ? <>
                  <Link href="/mon-profil" onClick={close} className="mb-3 flex items-center gap-3 rounded-xl border border-white/10 p-3 transition hover:border-white/20 focus-visible:outline-2 focus-visible:outline-tertiary-400"><span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5">{session.user.image ? <Image src={session.user.image} alt="" fill sizes="40px" className="object-cover" /> : <UserRound size={18} aria-hidden="true" />}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm text-white/85">{session.user.firstName} {session.user.lastName}</span><span className="mt-1 block text-[11px] text-white/45">Voir mon profil</span></span><ArrowUpRight size={14} aria-hidden="true" className="text-white/35" /></Link>
                  <div className="grid grid-cols-2 gap-2">{accountLinks.map(({ href, label, Icon, count }) => <Link key={href} href={href} onClick={close} className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-xs text-white/65 transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-tertiary-400"><Icon size={14} aria-hidden="true" className="shrink-0 text-white/40" /><span className="truncate">{label}</span>{count > 0 && <span aria-label={count + " notifications"} className="ml-auto rounded-full bg-tertiary-400/15 px-1.5 text-[9px] text-tertiary-400">{count > 99 ? "99+" : count}</span>}</Link>)}</div>
                </> : <><p className="mb-4 text-xs leading-6 text-white/55">Vos inspirations, vos favoris et vos échanges, au même endroit.</p><div className="grid grid-cols-2 gap-2"><AppButton href="/se-connecter" onClick={close} className="px-3! text-xs! shadow-none!">Me connecter</AppButton><AppButton href="/creer-un-compte" onClick={close} variant="secondary" className="px-3! text-xs!">Créer un compte</AppButton></div></>}
              </div>
            </div>

            <div className="shrink-0 border-t border-white/10 px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4"><p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-white/40">Suivre Inkera</p><NavbarSocialLinks expanded onNavigate={close} /></div>
          </div>
        </dialog>, document.body
      )}
    </nav>
  );
}
