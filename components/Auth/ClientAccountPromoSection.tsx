"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaUserPlus } from "react-icons/fa";
import { BsChatDots, BsCalendarCheck, BsHeart, BsStar } from "react-icons/bs";
import { MdHistory } from "react-icons/md";
import { RiVipCrownLine } from "react-icons/ri";

export default function ClientAccountPromoSection() {
  const { data: session, status } = useSession();

  // Ne rien afficher si l'utilisateur est connecté ou en cours de chargement
  if (status === "authenticated" || status === "loading") {
    return null;
  }

  return (
    <section className="py-16 bg-secondary-500">
      <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
        {/* En-tête de section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl">
              <RiVipCrownLine className="text-tertiary-500" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-two">
              Créez votre compte client
            </h2>
          </div>
          <p className="text-white/70 font-one text-lg max-w-2xl mx-auto">
            Profitez d&apos;une expérience personnalisée et simplifiez vos
            démarches
          </p>
        </div>

        {/* Grille des avantages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {/* Avantage 1: Messagerie */}
          <div className="bg-gradient-to-br from-noir-600/50 to-noir-800/50 backdrop-blur-sm rounded-2xl p-6 border border-tertiary-500/20 hover:border-tertiary-500/50 transition-all duration-300 group">
            <div className="flex flex-col h-full">
              <div className="w-14 h-14 bg-gradient-to-br from-tertiary-500/30 to-tertiary-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <BsChatDots className="text-tertiary-400 text-2xl" />
              </div>
              <h3 className="text-white font-two font-bold text-lg mb-2">
                Messagerie intégrée
              </h3>
              <p className="text-white/70 font-one text-sm leading-relaxed flex-grow">
                Échangez directement avec les salons pour discuter de votre
                projet, poser des questions et recevoir des conseils
                personnalisés.
              </p>
              <div className="mt-4 inline-flex items-center text-tertiary-400 text-sm font-one font-semibold">
                <span className="mr-1">→</span> Communication instantanée
              </div>
            </div>
          </div>

          {/* Avantage 2: Réservations */}
          <div className="bg-gradient-to-br from-noir-600/50 to-noir-800/50 backdrop-blur-sm rounded-2xl p-6 border border-tertiary-500/20 hover:border-tertiary-500/50 transition-all duration-300 group">
            <div className="flex flex-col h-full">
              <div className="w-14 h-14 bg-gradient-to-br from-tertiary-500/30 to-tertiary-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <BsCalendarCheck className="text-tertiary-400 text-2xl" />
              </div>
              <h3 className="text-white font-two font-bold text-lg mb-2">
                Gestion des rendez-vous
              </h3>
              <p className="text-white/70 font-one text-sm leading-relaxed flex-grow">
                Réservez en ligne 24/7, suivez l&apos;état de vos demandes et
                recevez des confirmations automatiques pour vos rendez-vous.
              </p>
              <div className="mt-4 inline-flex items-center text-tertiary-400 text-sm font-one font-semibold">
                <span className="mr-1">→</span> Réservation simplifiée
              </div>
            </div>
          </div>

          {/* Avantage 3: Favoris */}
          <div className="bg-gradient-to-br from-noir-600/50 to-noir-800/50 backdrop-blur-sm rounded-2xl p-6 border border-tertiary-500/20 hover:border-tertiary-500/50 transition-all duration-300 group">
            <div className="flex flex-col h-full">
              <div className="w-14 h-14 bg-gradient-to-br from-tertiary-500/30 to-tertiary-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <BsHeart className="text-tertiary-400 text-2xl" />
              </div>
              <h3 className="text-white font-two font-bold text-lg mb-2">
                Salons favoris
              </h3>
              <p className="text-white/70 font-one text-sm leading-relaxed flex-grow">
                Sauvegardez vos salons et artistes préférés pour les retrouver
                facilement et suivre leurs nouveautés.
              </p>
              <div className="mt-4 inline-flex items-center text-tertiary-400 text-sm font-one font-semibold">
                <span className="mr-1">→</span> Accès rapide
              </div>
            </div>
          </div>

          {/* Avantage 4: Historique */}
          <div className="bg-gradient-to-br from-noir-600/50 to-noir-800/50 backdrop-blur-sm rounded-2xl p-6 border border-tertiary-500/20 hover:border-tertiary-500/50 transition-all duration-300 group">
            <div className="flex flex-col h-full">
              <div className="w-14 h-14 bg-gradient-to-br from-tertiary-500/30 to-tertiary-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <MdHistory className="text-tertiary-400 text-2xl" />
              </div>
              <h3 className="text-white font-two font-bold text-lg mb-2">
                Historique complet
              </h3>
              <p className="text-white/70 font-one text-sm leading-relaxed flex-grow">
                Consultez l&apos;historique de tous vos rendez-vous passés et à
                venir, avec photos et détails.
              </p>
              <div className="mt-4 inline-flex items-center text-tertiary-400 text-sm font-one font-semibold">
                <span className="mr-1">→</span> Tout au même endroit
              </div>
            </div>
          </div>

          {/* Avantage 5: Avis et évaluations */}
          <div className="bg-gradient-to-br from-noir-600/50 to-noir-800/50 backdrop-blur-sm rounded-2xl p-6 border border-tertiary-500/20 hover:border-tertiary-500/50 transition-all duration-300 group">
            <div className="flex flex-col h-full">
              <div className="w-14 h-14 bg-gradient-to-br from-tertiary-500/30 to-tertiary-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <BsStar className="text-tertiary-400 text-2xl" />
              </div>
              <h3 className="text-white font-two font-bold text-lg mb-2">
                Avis et évaluations
              </h3>
              <p className="text-white/70 font-one text-sm leading-relaxed flex-grow">
                Laissez des avis sur vos expériences et consultez les retours
                d&apos;autres clients pour choisir le meilleur salon.
              </p>
              <div className="mt-4 inline-flex items-center text-tertiary-400 text-sm font-one font-semibold">
                <span className="mr-1">→</span> Partagez votre expérience
              </div>
            </div>
          </div>

          {/* Avantage 6: Profil personnalisé */}
          <div className="bg-gradient-to-br from-noir-600/50 to-noir-800/50 backdrop-blur-sm rounded-2xl p-6 border border-tertiary-500/20 hover:border-tertiary-500/50 transition-all duration-300 group">
            <div className="flex flex-col h-full">
              <div className="w-14 h-14 bg-gradient-to-br from-tertiary-500/30 to-tertiary-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaUserPlus className="text-tertiary-400 text-2xl" />
              </div>
              <h3 className="text-white font-two font-bold text-lg mb-2">
                Profil personnalisé
              </h3>
              <p className="text-white/70 font-one text-sm leading-relaxed flex-grow">
                Créez votre profil, renseignez vos préférences et gagnez du
                temps lors de vos réservations futures.
              </p>
              <div className="mt-4 inline-flex items-center text-tertiary-400 text-sm font-one font-semibold">
                <span className="mr-1">→</span> Préremplissage automatique
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="relative overflow-hidden rounded-3xl border border-tertiary-500/30 bg-gradient-to-br from-tertiary-500/10 via-primary-400/50 to-primary-500/50 backdrop-blur-lg shadow-2xl p-8">
          {/* Effets de fond */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl -z-10" />

          <div className="relative z-10 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-white font-two mb-4">
              Rejoignez-nous gratuitement
            </h3>
            <p className="text-white/80 font-one text-base sm:text-lg mb-8 max-w-2xl mx-auto">
              L&apos;inscription est rapide et gratuite. Commencez à profiter de
              tous ces avantages dès maintenant.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/creer-un-compte"
                className="group cursor-pointer inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-one font-semibold bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white transition-all duration-300 shadow-lg shadow-tertiary-500/25 hover:shadow-tertiary-500/40 transform hover:scale-105"
              >
                <FaUserPlus className="text-lg" />
                Créer mon compte gratuit
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
              </Link>

              <Link
                href="/se-connecter"
                className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-one font-semibold border-2 border-white/20 bg-gradient-to-br from-white/[0.08] to-white/[0.02] text-white/90 hover:border-white/30 hover:bg-white/[0.12] backdrop-blur-sm transition-all duration-300"
              >
                J&apos;ai déjà un compte
              </Link>
            </div>

            <p className="mt-6 text-white/60 font-one text-sm">
              Aucune carte bancaire requise • Inscription en moins de 2 minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
