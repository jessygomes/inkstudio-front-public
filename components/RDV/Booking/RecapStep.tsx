/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Section from "./Section";
import ReferenceImages from "./ReferenceImages";

interface RecapStepProps {
  prestation: string;
  formData: any;
  selectedDate: string;
  selectedSlots: string[];
  selectedTatoueur: string | null;
  artists: any[];
  piercingZones: any[];
  piercingPrice: number | null;
  pierc: string | null;
  salon: any;
  referenceFile?: File | null;
  sketchFile?: File | null;
}

export default function RecapStep({
  prestation,
  formData,
  selectedDate,
  selectedSlots,
  selectedTatoueur,
  artists,
  piercingZones,
  piercingPrice,
  pierc,
  salon,
  referenceFile,
  sketchFile,
}: RecapStepProps) {
  // Trouver le nom du tatoueur
  const tatoueur = artists.find((a) => a.id === selectedTatoueur);

  // Trouver la zone de piercing
  const piercingZone = piercingZones.find((pz) => pz.id === pierc);

  return (
    <Section title="Récapitulatif de votre demande">
      <div className="space-y-4">
        {/* Informations client */}
        <div className="p-4 rounded-md border border-white/10">
          <h3 className="text-white font-one mb-3 flex items-center gap-2">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Vos informations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-white/60 font-one text-xs mb-0.5">Nom</p>
              <p className="text-white font-one ">
                {formData?.client?.lastName || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-white/60 font-one text-xs mb-0.5">Prénom</p>
              <p className="text-white font-one ">
                {formData?.client?.firstName || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-white/60 font-one text-xs mb-0.5">Email</p>
              <p className="text-white font-one ">
                {formData?.client?.email || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-white/60 font-one text-xs mb-0.5">Téléphone</p>
              <p className="text-white font-one ">
                {formData?.client?.phone || "N/A"}
              </p>
            </div>
            {formData?.client?.birthDate && (
              <div>
                <p className="text-white/60 font-one text-xs mb-0.5">
                  Date de naissance
                </p>
                <p className="text-white font-one">
                  {new Date(formData.client.birthDate).toLocaleDateString(
                    "fr-FR",
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Informations prestation */}
        <div className="bg-white/[0.03] p-4 rounded-md border border-white/10">
          <h3 className="text-white font-one mb-3 flex items-center gap-2">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Détails de la prestation
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-white/60 font-one text-xs mb-0.5">
                Type de prestation
              </p>
              <p className="text-white font-one">
                {prestation === "TATTOO"
                  ? "Tatouage"
                  : prestation === "PIERCING"
                    ? "Piercing"
                    : "Projet / Consultation"}
              </p>
            </div>

            {prestation === "PIERCING" && piercingZone && (
              <>
                <div>
                  <p className="text-white/60 font-one text-xs mb-0.5">
                    Zone de piercing
                  </p>
                  <p className="text-white font-one">{piercingZone.name}</p>
                </div>
                {piercingPrice !== null && (
                  <div>
                    <p className="text-white/60 font-one text-xs mb-0.5">
                      Prix
                    </p>
                    <p className="font-one text-tertiary-400">
                      {piercingPrice}€
                    </p>
                  </div>
                )}
              </>
            )}

            {(prestation === "TATTOO" ||
              prestation === "PROJET" ||
              prestation === "RETOUCHE") && (
              <>
                {formData?.details?.zone && (
                  <div>
                    <p className="text-white/60 font-one text-xs mb-0.5">
                      Zone du corps
                    </p>
                    <p className="text-white font-one">
                      {formData.details.zone}
                    </p>
                  </div>
                )}
                {formData?.details?.size && (
                  <div>
                    <p className="text-white/60 font-one text-xs mb-0.5">
                      Taille souhaitée
                    </p>
                    <p className="text-white font-one">
                      {formData.details.size}
                    </p>
                  </div>
                )}
                {formData?.details?.colorStyle && (
                  <div>
                    <p className="text-white/60 font-one text-xs mb-0.5">
                      Style et couleurs
                    </p>
                    <p className="text-white font-one">
                      {formData.details.colorStyle}
                    </p>
                  </div>
                )}
                {formData?.details?.description && (
                  <div>
                    <p className="text-white/60 font-one text-xs mb-0.5">
                      Description
                    </p>
                    <p className="text-white font-one leading-relaxed text-sm">
                      {formData.details.description}
                    </p>
                  </div>
                )}
              </>
            )}

            {formData?.message && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-white/60 font-one text-sm mb-0.5">
                  Message complémentaire
                </p>
                <p className="text-white font-one leading-relaxed text-sm">
                  {formData.message}
                </p>
              </div>
            )}
            <ReferenceImages
              referenceFile={referenceFile}
              sketchFile={sketchFile}
            />
          </div>
        </div>

        {/* Informations rendez-vous */}
        <div className="bg-tertiary-500/10 p-4 rounded-md border border-tertiary-500/30">
          <h3 className="text-white font-one mb-3 flex items-center gap-2">
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
            Rendez-vous
          </h3>
          <div className="space-y-3">
            {formData.visio && (
              <div className="bg-tertiary-500/20 border border-tertiary-400/40 rounded p-2 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-tertiary-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm text-white font-one font-semibold">
                  Rendez-vous en visioconférence
                </span>
              </div>
            )}

            {tatoueur && (
              <div>
                <p className="text-white/60 font-one mb-0.5">Tatoueur</p>
                <p className="text-white font-one font-semibold">
                  {tatoueur.name}
                </p>
              </div>
            )}

            <div>
              <p className="text-white/60 font-one text-sm mb-0.5">Date</p>
              <p className="text-white font-one">
                {new Date(selectedDate).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div>
              <p className="text-white/60 font-one text-sm mb-0.5">Horaire</p>
              <p className="text-white font-one">
                {new Date(selectedSlots[0]).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(
                  new Date(selectedSlots[selectedSlots.length - 1]).getTime() +
                    30 * 60 * 1000,
                ).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div>
              <p className="text-white/60 font-one text-sm mb-0.5">
                Durée totale
              </p>
              <p className="text-white font-one">
                {selectedSlots.length * 30} min
              </p>
            </div>
          </div>
        </div>

        {/* Avertissement */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-md p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-orange-400"
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
            <div className="flex-1">
              <h4 className="text-orange-300 font-one mb-1.5 text-sm">
                Informations importantes
              </h4>
              <ul className="text-sm text-orange-300/80 font-one space-y-0.5 list-disc list-inside">
                {salon.addConfirmationEnabled ? (
                  <>
                    <li>Votre demande sera envoyée au salon pour validation</li>
                    <li>
                      Vous recevrez une confirmation par email une fois validée
                    </li>
                    <li>Le salon peut vous contacter pour plus de détails</li>
                  </>
                ) : (
                  <>
                    <li>Votre rendez-vous sera enregistré directement</li>
                    <li>Vous recevrez un email de confirmation</li>
                    <li>Vérifiez vos informations avant de confirmer</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
