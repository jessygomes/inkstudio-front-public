/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import type { Metadata } from "next";
import {
  FaCookieBite,
  FaDatabase,
  FaEnvelope,
  FaGavel,
  FaGoogle,
  FaLock,
  FaShieldAlt,
  FaUserShield,
} from "react-icons/fa";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité d'Inkera conforme au RGPD.",
  keywords: [
    "politique de confidentialité",
    "RGPD",
    "Inkera",
    "données personnelles",
    "cookies",
    "Google OAuth",
  ],
};

export default function PolitiqueDeConfidentialite() {
  return (
    <main className="min-h-screen bg-linear-to-b from-noir-700 via-noir-600 to-noir-700 pt-20">
      <section className="bg-linear-to-r from-noir-700 to-noir-800 py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-8 max-w-4xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-tertiary-500/10 border border-tertiary-400/20 rounded-full px-4 py-2 mb-6">
            <FaShieldAlt size={16} className="text-tertiary-400" />
            <span className="text-tertiary-400 font-one text-sm font-semibold">
              Protection des données
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-two uppercase text-white font-bold leading-tight mb-6">
            Politique de{" "}
            <span className="bg-linear-to-r from-tertiary-400 to-tertiary-500 bg-clip-text text-transparent">
              confidentialité
            </span>
          </h1>

          <div className="w-24 h-1 bg-linear-to-r from-tertiary-400 to-tertiary-500 rounded-full mx-auto mb-8"></div>

          <p className="text-xl text-white/70 font-one leading-relaxed max-w-3xl mx-auto">
            Informations relatives à la collecte, à l'utilisation et à la
            protection des données personnelles sur{" "}
            <span className="text-tertiary-400 font-semibold">Inkera</span>.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl space-y-8">
          <div className="bg-linear-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
            <p className="text-white/80 font-one leading-relaxed text-lg">
              Cette politique explique comment Inkera collecte, utilise et
              protège les données personnelles des utilisateurs. Les règles
              générales d'accès et d'usage de la plateforme sont précisées dans
              les{" "}
              <Link
                href="/conditions-d-utilisation"
                className="text-tertiary-400 hover:text-tertiary-300 underline underline-offset-4 transition-colors"
              >
                conditions d'utilisation
              </Link>
              .
            </p>
            <p className="text-white/50 font-one text-sm mt-4">
              Dernière mise à jour : 15 avril 2026
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <section className="bg-linear-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-linear-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                  <FaDatabase size={22} className="text-tertiary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-two">
                  1. Données collectées
                </h2>
              </div>

              <ul className="list-disc ml-6 space-y-3 text-white/80 font-one leading-relaxed">
                <li>Nom et prénom</li>
                <li>Email</li>
                <li>Numéro de téléphone facultatif</li>
                <li>Informations liées aux rendez-vous</li>
              </ul>
            </section>

            <section className="bg-linear-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-linear-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                  <FaGavel size={22} className="text-tertiary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-two">
                  2. Finalité du traitement
                </h2>
              </div>

              <ul className="list-disc ml-6 space-y-3 text-white/80 font-one leading-relaxed">
                <li>Gestion des rendez-vous</li>
                <li>Communication avec les salons</li>
                <li>Amélioration du service</li>
              </ul>
            </section>
          </div>

          <section className="bg-linear-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white font-two mb-6">
              3. Destinataires des données
            </h2>

            <p className="text-white/80 font-one leading-relaxed">
              Les données sont accessibles uniquement à Inkera et au salon
              concerné par la demande.
            </p>
          </section>

          <section className="bg-linear-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white font-two mb-6">
              4. Durée de conservation
            </h2>

            <p className="text-white/80 font-one leading-relaxed">
              Les données sont conservées pendant une durée maximale de 3 ans,
              sauf demande de suppression.
            </p>
          </section>

          <section className="bg-linear-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-linear-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                <FaLock size={22} className="text-tertiary-400" />
              </div>
              <h2 className="text-2xl font-bold text-white font-two">
                5. Sécurité des données
              </h2>
            </div>

            <p className="text-white/80 font-one leading-relaxed">
              Inkera met en œuvre des mesures techniques pour protéger vos
              informations, notamment via HTTPS et des accès restreints.
            </p>
          </section>

          <section className="bg-linear-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-linear-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                <FaUserShield size={22} className="text-tertiary-400" />
              </div>
              <h2 className="text-2xl font-bold text-white font-two">
                6. Vos droits
              </h2>
            </div>

            <p className="text-white/80 font-one leading-relaxed">
              Conformément au RGPD, vous pouvez demander l'accès, la
              modification ou la suppression de vos données personnelles.
            </p>
          </section>

          <div className="grid gap-8 md:grid-cols-2">
            <section className="bg-linear-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-linear-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                  <FaCookieBite size={22} className="text-tertiary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-two">
                  7. Cookies
                </h2>
              </div>

              <p className="text-white/80 font-one leading-relaxed">
                Le site utilise uniquement des cookies techniques et de mesure
                d’audience anonymes.
              </p>
            </section>

            <section className="bg-linear-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-linear-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                  <FaGoogle size={22} className="text-tertiary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-two">
                  8. Données collectées via Google
                </h2>
              </div>

              <p className="text-white/80 font-one leading-relaxed">
                Lors de l’utilisation de la connexion Google, Inkera collecte
                uniquement votre adresse email et votre nom afin de créer et
                gérer votre compte. Ces données ne sont ni vendues ni partagées.
              </p>
            </section>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <section className="bg-linear-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white font-two mb-6">
                9. Responsable du traitement
              </h2>

              <p className="text-white/80 font-one leading-relaxed">
                Inkera – contact@theinkera.com
              </p>
            </section>

            <section className="bg-linear-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white font-two mb-6">
                10. Base légale
              </h2>

              <p className="text-white/80 font-one leading-relaxed">
                Le traitement des données repose sur votre consentement lors de
                l’utilisation du service.
              </p>
            </section>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <section className="bg-linear-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white font-two mb-6">
                11. Hébergement
              </h2>

              <p className="text-white/80 font-one leading-relaxed">
                Les données sont hébergées sur des serveurs sécurisés.
              </p>
            </section>

            <section className="bg-linear-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white font-two mb-6">
                12. Réclamation
              </h2>

              <p className="text-white/80 font-one leading-relaxed">
                Vous pouvez introduire une réclamation auprès de la CNIL
                (www.cnil.fr).
              </p>
            </section>
          </div>

          <section className="bg-linear-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-linear-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                <FaEnvelope size={22} className="text-tertiary-400" />
              </div>
              <h2 className="text-2xl font-bold text-white font-two">
                13. Contact
              </h2>
            </div>

            <p className="text-white/80 font-one leading-relaxed">
              Pour toute demande :{" "}
              <strong className="text-white">contact@theinkera.com</strong>
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
