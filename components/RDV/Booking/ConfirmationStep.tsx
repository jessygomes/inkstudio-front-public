/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Link from "next/link";
import { toSlug } from "@/lib/utils";

interface ConfirmationStepProps {
  salon: any;
  addConfirmationEnabled: boolean;
}

export default function ConfirmationStep({
  salon,
  addConfirmationEnabled,
}: ConfirmationStepProps) {
  const salonSlug = toSlug(salon.salonName);
  const citySlug = toSlug(salon.city);
  const postalCode = salon.postalCode;

  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center px-4 py-12">
      {addConfirmationEnabled ? (
        /* Mode avec confirmation requise */
        <div className="max-w-2xl w-full space-y-8 text-center">
          {/* Icône de succès */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-gradient-to-br from-tertiary-400 to-tertiary-600 rounded-full animate-pulse opacity-30"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-tertiary-500 to-tertiary-600 rounded-full flex items-center justify-center shadow-2xl shadow-tertiary-500/50">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Message principal */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-one font-bold text-white">
              Demande envoyée avec succès !
            </h2>
            <p className="text-lg text-white/80 font-one leading-relaxed max-w-lg mx-auto">
              Votre demande de rendez-vous a bien été transmise au salon{" "}
              <span className="font-semibold text-tertiary-400">
                {salon.salonName}
              </span>
            </p>
          </div>

          {/* Informations */}
          <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 rounded-2xl border border-white/10 backdrop-blur-sm space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-tertiary-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-tertiary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1 text-left space-y-3">
                <h3 className="text-white font-one font-semibold text-xl">
                  Prochaines étapes
                </h3>
                <ul className="space-y-3 text-sm text-white/80 font-one">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-tertiary-500/20 rounded-full flex items-center justify-center text-tertiary-400 text-xs font-semibold">
                      1
                    </span>
                    <span>
                      Le salon examinera votre demande et vérifiera les
                      disponibilités
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-tertiary-500/20 rounded-full flex items-center justify-center text-tertiary-400 text-xs font-semibold">
                      2
                    </span>
                    <span>
                      Vous recevrez un email de confirmation une fois votre
                      rendez-vous validé
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-tertiary-500/20 rounded-full flex items-center justify-center text-tertiary-400 text-xs font-semibold">
                      3
                    </span>
                    <span>
                      Le salon pourrait vous contacter directement pour
                      finaliser les détails
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact du salon */}
          {(salon.salonEmail || salon.salonPhone) && (
            <div className="bg-gradient-to-br from-white/[0.05] to-transparent p-6 rounded-2xl border border-white/10">
              <h3 className="text-white font-one font-semibold text-lg mb-4">
                Besoin de nous contacter ?
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
                {salon.salonPhone && (
                  <a
                    href={`tel:${salon.salonPhone}`}
                    className="flex items-center gap-2 text-white/80 hover:text-tertiary-400 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="font-one">{salon.salonPhone}</span>
                  </a>
                )}
                {salon.salonEmail && (
                  <a
                    href={`mailto:${salon.salonEmail}`}
                    className="flex items-center gap-2 text-white/80 hover:text-tertiary-400 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-one">{salon.salonEmail}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/salon/${salonSlug}/${citySlug}-${postalCode}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-tertiary-500 to-tertiary-600 text-white rounded-xl font-one font-semibold hover:from-tertiary-600 hover:to-tertiary-700 transition-all duration-300 shadow-lg hover:shadow-tertiary-500/50 transform hover:-translate-y-0.5"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Retour au salon
            </Link>
            <Link
              href="/mon-profil"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/20 text-white rounded-xl font-one font-semibold hover:bg-white/[0.12] transition-all duration-300 backdrop-blur-sm"
            >
              Voir mes rendez-vous
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        /* Mode confirmation directe */
        <div className="max-w-2xl w-full space-y-8 text-center">
          {/* Icône de succès */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full animate-pulse opacity-30"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Message principal */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-one font-bold text-white">
              Rendez-vous confirmé !
            </h2>
            <p className="text-lg text-white/80 font-one leading-relaxed max-w-lg mx-auto">
              Votre rendez-vous a été enregistré avec succès chez{" "}
              <span className="font-semibold text-tertiary-400">
                {salon.salonName}
              </span>
            </p>
          </div>

          {/* Informations */}
          <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 rounded-2xl border border-white/10 backdrop-blur-sm space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1 text-left space-y-3">
                <h3 className="text-white font-one font-semibold text-xl">
                  Email de confirmation envoyé
                </h3>
                <p className="text-sm text-white/80 font-one leading-relaxed">
                  Vous allez recevoir un email de confirmation avec tous les
                  détails de votre rendez-vous. Pensez à vérifier vos spams si
                  vous ne le recevez pas dans les prochaines minutes.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-left">
                  <h4 className="text-orange-300 font-one font-semibold text-sm mb-1">
                    Important
                  </h4>
                  <p className="text-xs text-orange-300/80 font-one">
                    Merci d&apos;arriver à l&apos;heure. En cas
                    d&apos;empêchement, prévenez le salon au plus tôt.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact du salon */}
          {(salon.salonEmail || salon.salonPhone) && (
            <div className="bg-gradient-to-br from-white/[0.05] to-transparent p-6 rounded-2xl border border-white/10">
              <h3 className="text-white font-one font-semibold text-lg mb-4">
                Contact du salon
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
                {salon.salonPhone && (
                  <a
                    href={`tel:${salon.salonPhone}`}
                    className="flex items-center gap-2 text-white/80 hover:text-tertiary-400 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="font-one">{salon.salonPhone}</span>
                  </a>
                )}
                {salon.salonEmail && (
                  <a
                    href={`mailto:${salon.salonEmail}`}
                    className="flex items-center gap-2 text-white/80 hover:text-tertiary-400 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-one">{salon.salonEmail}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/salon/${salonSlug}/${citySlug}-${postalCode}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-tertiary-500 to-tertiary-600 text-white rounded-xl font-one font-semibold hover:from-tertiary-600 hover:to-tertiary-700 transition-all duration-300 shadow-lg hover:shadow-tertiary-500/50 transform hover:-translate-y-0.5"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Retour au salon
            </Link>
            <Link
              href="/mon-profil"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/20 text-white rounded-xl font-one font-semibold hover:bg-white/[0.12] transition-all duration-300 backdrop-blur-sm"
            >
              Voir mes rendez-vous
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
