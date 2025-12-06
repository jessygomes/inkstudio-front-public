/* eslint-disable react/no-unescaped-entities */
import React from "react";
import {
  FaShieldAlt,
  FaLock,
  FaDatabase,
  FaClock,
  FaUserShield,
  FaEnvelope,
  FaCookieBite,
  FaEdit,
} from "react-icons/fa";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Consultez la politique de confidentialité d'Inkera conforme au RGPD. Protection des données personnelles et gestion de la vie privée.",
  keywords: [
    "politique de confidentialité",
    "RGPD",
    "Inkera",
    "protection des données",
    "vie privée",
    "données personnelles",
  ],
};

export default function PolitiqueDeConfidentialite() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-noir-700 via-noir-600 to-noir-700 pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-noir-700 to-noir-800 py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-8 max-w-4xl relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-tertiary-500/10 border border-tertiary-400/20 rounded-full px-4 py-2 mb-6">
              <FaLock size={16} className="text-tertiary-400" />
              <span className="text-tertiary-400 font-one text-sm font-semibold">
                Protection des données
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-two uppercase text-white font-bold leading-tight mb-6">
              Politique de{" "}
              <span className="bg-gradient-to-r from-tertiary-400 to-tertiary-500 bg-clip-text text-transparent">
                Confidentialité
              </span>
            </h1>

            <div className="w-24 h-1 bg-gradient-to-r from-tertiary-400 to-tertiary-500 rounded-full mx-auto mb-8"></div>

            <p className="text-xl text-white/70 font-one leading-relaxed max-w-3xl mx-auto">
              Protection de vos données personnelles et respect du{" "}
              <span className="text-tertiary-400 font-semibold">RGPD</span>
            </p>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
          <div className="space-y-12">
            {/* Dernière mise à jour */}
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 bg-tertiary-500/10 border border-tertiary-400/20 rounded-full px-6 py-3">
                <span className="text-white/70 font-one text-sm">
                  Dernière mise à jour :{" "}
                  {new Date().toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>

            {/* 1. Introduction */}
            <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                  <FaShieldAlt size={24} className="text-tertiary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-two">
                  1. Introduction
                </h2>
              </div>

              <div className="text-white/80 font-one leading-relaxed">
                <p>
                  La présente politique de confidentialité explique comment
                  Inkera collecte, utilise et protège les données personnelles
                  des utilisateurs du site public, notamment lors de la prise de
                  rendez-vous avec un salon.
                </p>
              </div>
            </div>

            {/* 2. Données collectées */}
            <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                  <FaDatabase size={24} className="text-tertiary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-two">
                  2. Données collectées
                </h2>
              </div>

              <div className="space-y-4 text-white/80 font-one leading-relaxed">
                <p>
                  Lorsque vous prenez un rendez-vous via le site, les
                  informations suivantes peuvent être collectées :
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/5 rounded-2xl p-4">
                    <h3 className="font-semibold text-tertiary-400 mb-2">
                      Informations personnelles
                    </h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Nom et prénom</li>
                      <li>• Adresse e-mail</li>
                      <li>• Numéro de téléphone (facultatif)</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4">
                    <h3 className="font-semibold text-tertiary-400 mb-2">
                      Informations sur le projet
                    </h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Description du tatouage souhaité</li>
                      <li>• Zone du corps</li>
                      <li>• Taille approximative</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-tertiary-500/10 rounded-2xl p-6 mt-6">
                  <p className="text-tertiary-300">
                    <strong>Important :</strong> Ces données sont transmises
                    uniquement au salon concerné afin qu'il puisse vous
                    recontacter et gérer votre demande.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Finalité du traitement */}
            <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white font-two mb-6">
                3. Finalité du traitement
              </h2>

              <div className="space-y-4 text-white/80 font-one leading-relaxed">
                <p>
                  Les données sont collectées pour les finalités suivantes :
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {[
                    "Permettre la prise de contact entre le client et le salon",
                    "Faciliter la gestion du rendez-vous",
                    "Assurer le suivi client (confirmation, modification ou annulation)",
                    "Garantir le bon fonctionnement du site et la sécurité des échanges",
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 bg-white/5 rounded-xl p-4"
                    >
                      <span className="text-tertiary-400 mt-1">✓</span>
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mt-6">
                  <p className="text-red-300">
                    <strong>
                      Aucune donnée n'est utilisée à des fins publicitaires
                    </strong>{" "}
                    sans votre consentement explicite.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Destinataires des données */}
            <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                  <FaUserShield size={24} className="text-tertiary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-two">
                  4. Destinataires des données
                </h2>
              </div>

              <div className="space-y-4 text-white/80 font-one leading-relaxed">
                <p>Les données sont accessibles uniquement à :</p>

                <div className="space-y-3 mt-6">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="font-semibold text-tertiary-400 mb-2">
                      L'équipe d'administration de Inkera
                    </h3>
                    <p className="text-sm text-white/70">
                      (à des fins techniques et de support)
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="font-semibold text-tertiary-400 mb-2">
                      Le salon de tatouage concerné
                    </h3>
                    <p className="text-sm text-white/70">
                      (pour la demande de rendez-vous)
                    </p>
                  </div>
                </div>

                <div className="bg-tertiary-500/10 rounded-2xl p-6 mt-6">
                  <p className="text-tertiary-300">
                    Les salons s'engagent à respecter la confidentialité et à ne
                    pas réutiliser vos informations à d'autres fins.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Durée de conservation */}
            <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                  <FaClock size={24} className="text-tertiary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-two">
                  5. Durée de conservation
                </h2>
              </div>

              <div className="space-y-4 text-white/80 font-one leading-relaxed">
                <p>Vos données sont conservées :</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Demandes non honorées
                    </h3>
                    <p className="text-lg font-semibold text-white">12 mois</p>
                    <p className="text-sm text-white/70 mt-2">
                      à compter de la dernière interaction
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Clients réguliers
                    </h3>
                    <p className="text-lg font-semibold text-white">
                      3 ans maximum
                    </p>
                    <p className="text-sm text-white/70 mt-2">
                      sauf demande de suppression anticipée
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Sécurité des données */}
            <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
              <h2 className="text-2xl font-bold text-white font-two mb-6">
                6. Sécurité des données
              </h2>

              <div className="space-y-4 text-white/80 font-one leading-relaxed">
                <p>
                  Inkera met en œuvre toutes les mesures techniques nécessaires
                  pour protéger vos informations contre la perte, l'accès non
                  autorisé ou la divulgation :
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {[
                    {
                      icon: "🔒",
                      title: "Chiffrement HTTPS",
                      desc: "Toutes les communications sont sécurisées",
                    },
                    {
                      icon: "🔑",
                      title: "Accès restreints",
                      desc: "Contrôle strict des autorisations",
                    },
                    {
                      icon: "💾",
                      title: "Sauvegardes sécurisées",
                      desc: "Protection contre la perte de données",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-xl p-4 text-center"
                    >
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <h3 className="font-semibold text-tertiary-400 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-white/70">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 7. Vos droits */}
            <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white font-two mb-6">
                7. Vos droits
              </h2>

              <div className="space-y-4 text-white/80 font-one leading-relaxed">
                <p>Conformément au RGPD, vous disposez des droits suivants :</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {[
                    "Droit d'accès à vos données",
                    "Droit de rectification",
                    "Droit à l'effacement (\"droit à l'oubli\")",
                    "Droit d'opposition",
                    "Droit à la portabilité",
                    "Droit à la limitation du traitement",
                  ].map((right, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-tertiary-400">⚖️</span>
                        <span className="text-sm font-medium">{right}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-tertiary-500/10 rounded-2xl p-6 mt-6">
                  <p className="text-tertiary-300 mb-2">
                    <strong>Pour exercer vos droits, contactez :</strong>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>📧</span>
                    <strong className="text-white">
                      inthegleam01@gmail.com
                    </strong>
                  </p>
                </div>
              </div>
            </div>

            {/* 8. Cookies et traceurs */}
            <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                  <FaCookieBite size={24} className="text-tertiary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-two">
                  8. Cookies et traceurs
                </h2>
              </div>

              <div className="space-y-4 text-white/80 font-one leading-relaxed">
                <p>
                  Le site utilise uniquement des cookies techniques et de mesure
                  d'audience anonymes (par exemple Google Analytics, si
                  configuré).
                </p>

                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
                  <p className="text-red-300">
                    <strong>Aucun cookie publicitaire</strong> n'est utilisé
                    sans votre consentement.
                  </p>
                </div>
              </div>
            </div>

            {/* 9. Modifications */}
            <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                  <FaEdit size={24} className="text-tertiary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-two">
                  9. Modifications
                </h2>
              </div>

              <div className="text-white/80 font-one leading-relaxed">
                <p>
                  Cette politique de confidentialité peut être mise à jour à
                  tout moment. La date de dernière mise à jour est toujours
                  indiquée en haut de la page.
                </p>
              </div>
            </div>

            {/* 10. Contact RGPD */}
            <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                  <FaEnvelope size={24} className="text-tertiary-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-two">
                  10. Contact RGPD
                </h2>
              </div>

              <div className="space-y-4 text-white/80 font-one leading-relaxed">
                <p>
                  Pour toute question relative à la gestion de vos données
                  personnelles :
                </p>

                <div className="bg-white/5 rounded-2xl p-6">
                  <p className="flex items-center gap-2 text-lg">
                    <span>📧</span>
                    <strong className="text-white">[ton@email.fr]</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
