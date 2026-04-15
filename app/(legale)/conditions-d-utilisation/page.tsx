/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import type { Metadata } from "next";
import {
  FaFileContract,
  FaUserCheck,
  FaCalendarCheck,
  FaShieldAlt,
} from "react-icons/fa";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description:
    "Consultez les conditions d'utilisation de la plateforme Inkera pour la mise en relation et la prise de rendez-vous avec les salons.",
  keywords: [
    "conditions d'utilisation",
    "CGU",
    "Inkera",
    "réservation tatouage",
    "salons de tatouage",
    "plateforme",
  ],
};

export default function ConditionsDUtilisation() {
  return (
    <main className="min-h-screen bg-linear-to-b from-noir-700 via-noir-600 to-noir-700 pt-20">
      <section className="bg-linear-to-r from-noir-700 to-noir-800 py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-8 max-w-4xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-tertiary-500/10 border border-tertiary-400/20 rounded-full px-4 py-2 mb-6">
            <FaFileContract size={16} className="text-tertiary-400" />
            <span className="text-tertiary-400 font-one text-sm font-semibold">
              Cadre d'utilisation
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-two uppercase text-white font-bold leading-tight mb-6">
            Conditions{" "}
            <span className="bg-linear-to-r from-tertiary-400 to-tertiary-500 bg-clip-text text-transparent">
              d'utilisation
            </span>
          </h1>

          <div className="w-24 h-1 bg-linear-to-r from-tertiary-400 to-tertiary-500 rounded-full mx-auto mb-8"></div>

          <p className="text-xl text-white/70 font-one leading-relaxed max-w-3xl mx-auto">
            Règles applicables à l'accès et à l'utilisation de la plateforme{" "}
            <span className="text-tertiary-400 font-semibold">Inkera</span>.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl space-y-8">
          <div className="bg-linear-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
            <p className="text-white/80 font-one leading-relaxed text-lg">
              En accédant au site ou en utilisant les services proposés par
              Inkera, vous acceptez les présentes conditions d'utilisation. Si
              vous n'acceptez pas ces conditions, vous ne devez pas utiliser la
              plateforme.
            </p>
            <p className="text-white/50 font-one text-sm mt-4">
              Dernière mise à jour : 15 avril 2026
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <section className="bg-linear-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-linear-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                  <FaUserCheck size={22} className="text-tertiary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-two">
                  1. Accès au service
                </h2>
              </div>

              <div className="space-y-4 text-white/80 font-one leading-relaxed">
                <p>
                  Inkera met à disposition une plateforme permettant aux
                  utilisateurs de découvrir des salons, consulter des
                  informations et effectuer des demandes de rendez-vous.
                </p>
                <p>
                  L'accès au site est gratuit hors coûts de connexion internet.
                  Certaines fonctionnalités peuvent nécessiter la création d'un
                  compte.
                </p>
              </div>
            </section>

            <section className="bg-linear-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-linear-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                  <FaCalendarCheck size={22} className="text-tertiary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-two">
                  2. Réservations et demandes
                </h2>
              </div>

              <div className="space-y-4 text-white/80 font-one leading-relaxed">
                <p>
                  Les demandes de rendez-vous envoyées via Inkera sont
                  transmises au salon concerné. La confirmation finale, les
                  disponibilités, les tarifs et les conditions d'exécution
                  restent sous la responsabilité du salon.
                </p>
                <p>
                  L'utilisateur s'engage à fournir des informations exactes lors
                  de toute demande ou prise de contact.
                </p>
              </div>
            </section>
          </div>

          <section className="bg-linear-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white font-two mb-6">
              3. Obligations de l'utilisateur
            </h2>

            <ul className="list-disc ml-6 space-y-3 text-white/80 font-one leading-relaxed">
              <li>
                Utiliser la plateforme de manière loyale et conforme à sa
                finalité.
              </li>
              <li>
                Ne pas usurper l'identité d'un tiers ni fournir de fausses
                informations.
              </li>
              <li>
                Ne pas publier, transmettre ou demander de contenus illicites,
                injurieux ou contraires à l'ordre public.
              </li>
              <li>
                Respecter les salons, leurs équipes, leurs horaires et leurs
                conditions propres de prise en charge.
              </li>
            </ul>
          </section>

          <section className="bg-linear-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white font-two mb-6">
              4. Compte utilisateur
            </h2>

            <div className="space-y-4 text-white/80 font-one leading-relaxed">
              <p>
                Lorsque la création d'un compte est proposée, l'utilisateur est
                responsable de la confidentialité de ses identifiants et de
                toute activité réalisée depuis son compte.
              </p>
              <p>
                Inkera se réserve le droit de suspendre ou supprimer un compte
                en cas d'usage abusif, frauduleux ou contraire aux présentes
                conditions.
              </p>
            </div>
          </section>

          <section className="bg-linear-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-linear-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                <FaShieldAlt size={22} className="text-tertiary-400" />
              </div>
              <h2 className="text-2xl font-bold text-white font-two">
                5. Responsabilité et disponibilité
              </h2>
            </div>

            <div className="space-y-4 text-white/80 font-one leading-relaxed">
              <p>
                Inkera agit comme intermédiaire technique de mise en relation.
                Inkera ne garantit ni l'acceptation d'une demande, ni la qualité
                des prestations réalisées par les salons référencés.
              </p>
              <p>
                La plateforme peut être temporairement indisponible pour des
                raisons de maintenance, de mise à jour ou d'incident technique,
                sans que cela n'ouvre droit à indemnisation.
              </p>
            </div>
          </section>

          <section className="bg-linear-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white font-two mb-6">
              6. Propriété intellectuelle
            </h2>

            <p className="text-white/80 font-one leading-relaxed">
              Les contenus, éléments graphiques, marques, textes et composants
              du site demeurent protégés par le droit applicable. Toute
              reproduction ou exploitation non autorisée est interdite.
            </p>
          </section>

          <section className="bg-linear-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white font-two mb-6">
              7. Données personnelles
            </h2>

            <p className="text-white/80 font-one leading-relaxed">
              Les traitements de données personnelles liés à l'utilisation du
              site sont détaillés dans la{" "}
              <Link
                href="/politique-de-confidentialite"
                className="text-tertiary-400 hover:text-tertiary-300 underline underline-offset-4 transition-colors"
              >
                politique de confidentialité
              </Link>{" "}
              disponible sur le site.
            </p>
          </section>

          <section className="bg-linear-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white font-two mb-6">
              8. Contact
            </h2>

            <p className="text-white/80 font-one leading-relaxed">
              Pour toute question relative aux présentes conditions
              d'utilisation, vous pouvez contacter Inkera à l'adresse suivante :
              <strong className="text-white"> contact@theinkera.com</strong>
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
