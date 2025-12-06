/* eslint-disable react/no-unescaped-entities */
import React from "react";
import {
  FaBuilding,
  FaGavel,
  FaServer,
  FaShieldAlt,
  FaEnvelope,
  FaExternalLinkAlt,
} from "react-icons/fa";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales",
  description:
    "Consultez les mentions légales d'Inkera, plateforme pour salons de tatouage. Informations légales, hébergement et propriété intellectuelle.",
  keywords: [
    "mentions légales",
    "Inkera",
    "informations légales",
    "propriété intellectuelle",
    "hébergement",
    "responsabilité",
    "contact",
    "conditions d'utilisation",
    "salons de tatouage",
  ],
};

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-noir-700 via-noir-600 to-noir-700 pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-noir-700 to-noir-800 py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-8 max-w-4xl relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-tertiary-500/10 border border-tertiary-400/20 rounded-full px-4 py-2 mb-6">
              <FaGavel size={16} className="text-tertiary-400" />
              <span className="text-tertiary-400 font-one text-sm font-semibold">
                Informations Légales
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-two uppercase text-white font-bold leading-tight mb-6">
              Mentions{" "}
              <span className="bg-gradient-to-r from-tertiary-400 to-tertiary-500 bg-clip-text text-transparent">
                Légales
              </span>
            </h1>

            <div className="w-24 h-1 bg-gradient-to-r from-tertiary-400 to-tertiary-500 rounded-full mx-auto mb-8"></div>

            <p className="text-xl text-white/70 font-one leading-relaxed max-w-3xl mx-auto">
              Informations légales et conditions d'utilisation de la plateforme{" "}
              <span className="text-tertiary-400 font-semibold">Inkera</span>
            </p>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
          <div className="space-y-12">
            {/* 1. Éditeur du site */}
            <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                  <FaBuilding size={24} className="text-tertiary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-two">
                  1. Éditeur du site
                </h2>
              </div>

              <div className="space-y-4 text-white/80 font-one leading-relaxed">
                <p className="text-white mb-4">
                  Le site Inkera est édité par :
                </p>

                <div className="bg-white/5 rounded-2xl p-6">
                  <div className="space-y-3">
                    <p>
                      <strong className="text-white">
                        PINTO BARRETO Jessy
                      </strong>
                    </p>
                    <p>
                      Entreprise individuelle enregistrée sous le numéro{" "}
                      <strong className="text-white">[SIRET]</strong>
                    </p>
                    <p>
                      <strong className="text-white">Adresse :</strong> [
                      adresse professionnelle]
                    </p>
                    <p>
                      <strong className="text-white">Email :</strong>{" "}
                      inthegleam01@gmail.com
                    </p>
                    <p>
                      <strong className="text-white">
                        Directeur de la publication :
                      </strong>{" "}
                      PINTO BARRETO Jessy
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Hébergement */}
            <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                  <FaServer size={24} className="text-tertiary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-two">
                  2. Hébergement
                </h2>
              </div>

              <div className="space-y-4 text-white/80 font-one leading-relaxed">
                <p className="text-white mb-4">Le site est hébergé par :</p>

                <div className="bg-white/5 rounded-2xl p-6">
                  <div className="space-y-3">
                    <p>
                      <strong className="text-white">Vercel Inc.</strong>
                    </p>
                    <p>440 N Barranca Ave #4133, Covina, CA 91723</p>
                    <p className="flex items-center gap-2">
                      <strong className="text-white">Site web :</strong>
                      <a
                        href="https://vercel.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-tertiary-400 hover:text-tertiary-300 flex items-center gap-1"
                      >
                        https://vercel.com
                        <FaExternalLinkAlt size={12} />
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Propriété intellectuelle */}
            <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
              <h2 className="text-2xl font-bold text-white font-two mb-6">
                3. Propriété intellectuelle
              </h2>

              <div className="space-y-4 text-white/80 font-one leading-relaxed">
                <p>
                  L'ensemble du contenu du site (textes, images, logos,
                  graphismes, vidéos, structure, code source) est protégé par le
                  droit d'auteur et demeure la propriété exclusive de Inkera ou
                  de ses partenaires.
                </p>
                <p>
                  Toute reproduction, distribution, modification ou adaptation,
                  même partielle, est strictement interdite sans autorisation
                  écrite préalable.
                </p>
              </div>
            </div>

            {/* 4. Responsabilité */}
            <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                  <FaShieldAlt size={24} className="text-tertiary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-two">
                  4. Responsabilité
                </h2>
              </div>

              <div className="space-y-4 text-white/80 font-one leading-relaxed">
                <p>
                  Inkera s'efforce d'assurer l'exactitude et la mise à jour des
                  informations diffusées sur le site. Cependant, la société ne
                  saurait être tenue responsable d'éventuelles erreurs,
                  omissions ou indisponibilités du service.
                </p>

                <div className="bg-white/5 rounded-2xl p-6 mt-6">
                  <h3 className="font-semibold text-tertiary-400 mb-3">
                    Responsabilité des salons
                  </h3>
                  <p>
                    Les pages des salons de tatouage sont publiées sous la
                    responsabilité de chaque salon, qui gère ses propres
                    contenus (textes, images, tarifs, etc.).
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Liens externes */}
            <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white font-two mb-6">
                5. Liens externes
              </h2>

              <div className="space-y-4 text-white/80 font-one leading-relaxed">
                <p>
                  Le site peut contenir des liens vers des sites tiers. Inkera
                  ne peut être tenu responsable du contenu de ces sites externes
                  ni des éventuels dommages résultant de leur utilisation.
                </p>
              </div>
            </div>

            {/* 6. Contact */}
            <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                  <FaEnvelope size={24} className="text-tertiary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-two">
                  6. Contact
                </h2>
              </div>

              <div className="space-y-4 text-white/80 font-one leading-relaxed">
                <p>
                  Pour toute question concernant le site ou signalement d'un
                  contenu, vous pouvez contacter :
                </p>

                <div className="bg-white/5 rounded-2xl p-6">
                  <p className="flex items-center gap-2 text-lg">
                    <span>📧</span>
                    <strong className="text-white">
                      inthegleam01@gmail.com
                    </strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Dernière mise à jour */}
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 bg-tertiary-500/10 border border-tertiary-400/20 rounded-full px-6 py-3">
                <span className="text-white/70 font-one text-sm">
                  Dernière mise à jour :{" "}
                  {new Date().toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
