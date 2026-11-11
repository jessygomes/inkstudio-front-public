"use client";

import { useSession } from "next-auth/react";
import { ArrowUpRight, Heart, Images, MessageCircle, Share2 } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";
import { iconBadge } from "@/components/Shared/ui";

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
      <div className="mx-page">
        <header className="mb-10 flex flex-col items-center text-center sm:mb-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/60">Votre compte client · Gratuit</p>
          <h2 id="account-title" className="mt-1.5 font-two text-2xl font-bold uppercase leading-tight tracking-wide text-white sm:text-4xl">Un espace pour toutes vos envies</h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/55 sm:text-base sm:leading-7">De l’inspiration à la conversation, gardez le fil de votre projet.</p>
          <span aria-hidden="true" className="mt-6 h-px w-24 bg-linear-to-r from-transparent via-tertiary-400/70 to-transparent" />
        </header>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ Icon, title, description }) => (
            <li key={title} className="rounded-3xl bg-noir-700 p-5 transition-colors hover:bg-noir-500 sm:p-6">
              <span aria-hidden="true" className={iconBadge}><Icon size={18} /></span>
              <h3 className="mt-5 text-base font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-white/55">{description}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {status === "authenticated"
            ? <AppButton href="/mon-profil" icon={<ArrowUpRight size={15} aria-hidden="true" />} className="min-h-11! rounded-xl! px-6! hover:translate-y-0!">Mon espace client</AppButton>
            : <>
                <AppButton href="/creer-un-compte" icon={<ArrowUpRight size={15} aria-hidden="true" />} className="min-h-11! rounded-xl! px-6! hover:translate-y-0!">Créer mon compte</AppButton>
                <AppButton href="/se-connecter" variant="secondary" className="min-h-11! rounded-xl! border-0! bg-white/6! px-5! hover:bg-white/10!">Me connecter</AppButton>
              </>}
        </div>
      </div>
    </section>
  );
}
