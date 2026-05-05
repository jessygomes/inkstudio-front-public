"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { FaUserPlus } from "react-icons/fa";
import { BsChatDots, BsCalendarCheck, BsHeart } from "react-icons/bs";
import AppButton from "@/components/Shared/AppButton";

const perks = [
  {
    icon: BsCalendarCheck,
    title: "Réservez en ligne",
    description: "Prenez rendez-vous 24/7 et suivez vos demandes en temps réel.",
  },
  {
    icon: BsChatDots,
    title: "Messagerie directe",
    description: "Échangez avec les salons pour affiner votre projet avant le jour J.",
  },
  {
    icon: BsHeart,
    title: "Favoris & historique",
    description: "Sauvegardez vos salons préférés et retrouvez tous vos rendez-vous passés.",
  },
];

export default function ClientAccountPromoSection() {
  const { data: session, status } = useSession();

  if (status === "authenticated" || status === "loading") return null;

  return (
    <section className="relative overflow-hidden">
      {/* Background photo */}
      <Image
        src="/photos/complete.jpg"
        alt="Salon de tatouage"
        fill
        className="object-cover"
        sizes="100vw"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-noir-900/75" />

      {/* Content */}
      <div className="relative z-10 mx-4 sm:mx-8 lg:mx-20 py-20 flex flex-col items-center gap-10 text-center">

        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-tertiary-400/60" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-tertiary-400 font-one">
              Compte gratuit
            </span>
            <span className="h-px w-10 bg-tertiary-400/60" />
          </div>
          <h2 className="text-4xl font-bold text-white font-two sm:text-5xl">
            Vivez l&apos;expérience complète
          </h2>
          <p className="max-w-lg text-base text-white/90 font-one">
            Créez votre compte en moins de 2 minutes.
          </p>
        </div>

        {/* Perks */}
        <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3 max-w-6xl">
          {perks.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group flex gap-4 rounded-2xl border border-white/10 bg-noir-700/40 p-5 backdrop-blur-lg transition-all duration-300 hover:border-tertiary-400/30 hover:bg-noir-900/55 text-left"
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-tertiary-500/25 ring-1 ring-tertiary-400/25 transition-colors duration-300 group-hover:bg-tertiary-500/40">
                <Icon size={20} className="text-tertiary-400 text-sm" />
              </div>
              <div>
                <h3 className="text-md font-bold text-white font-two">{title}</h3>
                <p className="mt-0.5 text-sm leading-relaxed text-white/80 font-one">{description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <AppButton href="/creer-un-compte" variant="primary" icon={<FaUserPlus />}>
            Créer mon compte
          </AppButton>
          <AppButton href="/se-connecter" variant="secondary">
            J&apos;ai déjà un compte
          </AppButton>
        </div>

      </div>
    </section>
  );
}
