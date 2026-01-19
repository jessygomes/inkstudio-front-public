"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AuthPromptBanner() {
  const { data: session, status } = useSession();

  // Ne rien afficher si l'utilisateur est connecté ou en cours de chargement
  if (status === "authenticated" || status === "loading") {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-tertiary-500/30 bg-gradient-to-br from-tertiary-500/10 via-tertiary-600/5 to-purple-500/5 backdrop-blur-lg shadow-lg p-6 mb-6">
      {/* Effet de fond décoratif */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-tertiary-400/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/5 rounded-full blur-3xl -z-10" />

      <div className="relative z-10">
        {/* En-tête avec icône */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-tertiary-400 to-tertiary-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-tertiary-500/25">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="text-white font-one font-bold text-lg mb-2">
              Créez votre compte gratuitement
            </h3>
            <p className="text-white/80 font-one text-sm leading-relaxed mb-4">
              Profitez d&apos;une expérience complète et gérez vos rendez-vous
              en toute simplicité !
            </p>
          </div>
        </div>

        {/* Liste des avantages */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          <div className="flex items-start gap-3 bg-white/[0.03] rounded-lg p-3 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-tertiary-500/20 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-tertiary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-white font-one font-semibold text-sm mb-1">
                Messagerie directe
              </h4>
              <p className="text-white/70 font-one text-xs leading-relaxed">
                Échangez en temps réel avec votre salon
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/[0.03] rounded-lg p-3 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-tertiary-500/20 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-tertiary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-white font-one font-semibold text-sm mb-1">
                Historique RDV
              </h4>
              <p className="text-white/70 font-one text-xs leading-relaxed">
                Retrouvez tous vos rendez-vous passés et à venir
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/[0.03] rounded-lg p-3 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-tertiary-500/20 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-tertiary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-white font-one font-semibold text-sm mb-1">
                Salons favoris
              </h4>
              <p className="text-white/70 font-one text-xs leading-relaxed">
                Sauvegardez vos artistes préférés
              </p>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/creer-un-compte"
            className="flex-1 group cursor-pointer px-6 py-3 rounded-xl text-sm font-one font-semibold bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white transition-all duration-300 shadow-lg shadow-tertiary-500/25 hover:shadow-tertiary-500/40 text-center"
          >
            <div className="flex items-center justify-center gap-2">
              Créer un compte gratuit
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </Link>

          <Link
            href="/se-connecter"
            className="flex-1 cursor-pointer px-6 py-3 rounded-xl text-sm font-one font-semibold border-2 border-white/20 bg-gradient-to-br from-white/[0.08] to-white/[0.02] text-white/90 hover:border-white/30 hover:bg-white/[0.12] backdrop-blur-sm transition-all duration-300 text-center"
          >
            J&apos;ai déjà un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
