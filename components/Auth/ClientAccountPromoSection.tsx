"use client";

import { useSession } from "next-auth/react";
import { ArrowUpRight, Heart, Images, MessageCircle, Share2 } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";

const benefits = [
  { Icon: Images, title: "Vos moodboards", description: "Rassemblez vos inspirations au même endroit." },
  { Icon: Share2, title: "Vos idées partagées", description: "Montrez votre univers à votre artiste ou à vos proches." },
  { Icon: Heart, title: "Vos favoris", description: "Retrouvez les artistes et créations qui vous plaisent." },
  { Icon: MessageCircle, title: "Le contact direct", description: "Échangez avec les artistes dans la messagerie Inkera." },
];

export default function ClientAccountPromoSection() {
  const { status } = useSession();
  return (
    <section aria-labelledby="account-title" className="bg-noir-800 font-one">
      <div className="mx-4 border-y border-white/10 py-8 sm:mx-8 sm:py-10 lg:mx-20">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div><p className="text-[11px] uppercase tracking-[0.2em] text-tertiary-400">Votre compte client · Gratuit</p><h2 id="account-title" className="mt-3 font-two text-2xl font-medium tracking-tight text-white sm:text-3xl">Un espace pour toutes vos envies.</h2><p className="mt-3 max-w-lg text-sm leading-7 text-white/60">De l’inspiration à la conversation, gardez le fil de votre projet.</p></div>
          <div className="flex flex-wrap gap-3">{status === "authenticated" ? <AppButton href="/mon-profil" icon={<ArrowUpRight size={15} aria-hidden="true" />} className="px-5!">Mon espace client</AppButton> : <><AppButton href="/creer-un-compte" icon={<ArrowUpRight size={15} aria-hidden="true" />} className="px-5!">Créer mon compte</AppButton><AppButton href="/se-connecter" variant="secondary" className="px-4!">Me connecter</AppButton></>}</div>
        </div>
        <div className="mt-8 grid gap-x-7 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">{benefits.map(({ Icon, title, description }) => <div key={title}><Icon size={21} strokeWidth={1.4} aria-hidden="true" className="mb-3 text-tertiary-400" /><h3 className="text-sm font-medium text-white/90">{title}</h3><p className="mt-2 max-w-xs text-xs leading-6 text-white/55">{description}</p></div>)}</div>
      </div>
    </section>
  );
}
