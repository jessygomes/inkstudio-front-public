"use client";

import { useSession } from "next-auth/react";
import { CalendarDays, Heart, Images, MessageCircle, UserPlus } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";

export default function HomeAccount() {
  const { status } = useSession();
  if (status !== "unauthenticated") return null;
  return (
    <section aria-labelledby="account-title" className="border-y border-white/10 bg-noir-500/60 py-16 font-one sm:py-20">
      <div className="mx-4 grid gap-10 sm:mx-8 lg:mx-20 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div><p className="text-xs uppercase tracking-[0.2em] text-tertiary-400">Votre compte gratuit</p><h2 id="account-title" className="mt-4 font-two text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">Toutes vos envies.<br />Un seul espace.</h2><p className="mt-5 max-w-md text-base leading-8 text-white/60">Gardez vos inspirations à portée de main et retrouvez vos échanges, vos salons favoris et vos rendez-vous.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap"><AppButton href="/creer-un-compte" icon={<UserPlus size={17} aria-hidden="true" />} className="min-h-12 focus-visible:outline-2 focus-visible:outline-tertiary-400">Créer mon compte</AppButton><AppButton href="/se-connecter" variant="secondary" className="min-h-12 focus-visible:outline-2 focus-visible:outline-tertiary-400">Me connecter</AppButton></div></div>
        <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
          {[
            { Icon: CalendarDays, title: "Vos rendez-vous", description: "Réservez en ligne et suivez vos demandes depuis votre espace personnel." },
            { Icon: Images, title: "Vos inspirations", description: "Créez des moodboards et partagez vos idées avec votre tatoueur pour chaque projet." },
            { Icon: MessageCircle, title: "Vos échanges", description: "Discutez directement avec les salons pour préciser vos envies avant le jour J." },
            { Icon: Heart, title: "Vos coups de cœur", description: "Sauvegardez vos salons préférés et retrouvez l’historique de vos rendez-vous." },
          ].map(({ Icon, title, description }) => <div key={title} className="border-t border-white/15 pt-5"><Icon size={23} aria-hidden="true" className="mb-4 text-tertiary-400" /><h3 className="font-two text-xl font-medium text-white">{title}</h3><p className="mt-2 text-sm leading-7 text-white/60">{description}</p></div>)}
        </div>
      </div>
    </section>
  );
}

