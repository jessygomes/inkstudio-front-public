/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import { toast } from "sonner";

import { TbClockHour4 } from "react-icons/tb";
import { BiDetail } from "react-icons/bi";
import { MdOutlineDateRange } from "react-icons/md";
import { FaCircleInfo } from "react-icons/fa6";

interface ProposedSlot {
  id: string;
  from: string; // ISO
  to: string; // ISO
  tatoueurId?: string | null;
  status?: string;
}

interface ProposeRdvInfo {
  id: string;
  prestation: string;
  clientFirstname: string;
  clientLastname: string;
  clientEmail: string;
  clientPhone: string;
  status: string;
  details: string | null;
  salonName: string;
  salonEmail: string;
  salonImage: string;
  salonHours: string;
  salonPhone: string;
  salonAddress: string;
  salonPostalCode: string;
  salonCity: string;
  proposedSlots?: ProposedSlot[];
}

interface TokenValidation {
  isLoading: boolean;
  isValid: boolean;
  error: string | null;
  appointmentRequest?: ProposeRdvInfo;
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-noir-700 to-noir-500 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary-400 mx-auto mb-4"></div>
        <p className="text-white font-one">Chargement...</p>
      </div>
    </div>
  );
}

// Move the main component logic to a separate component
function RdvRequestContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [tokenValidation, setTokenValidation] = useState<TokenValidation>({
    isLoading: true,
    isValid: false,
    error: null,
  });

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // État pour le message du client
  const [clientMessage, setClientMessage] = useState<string>("");

  const [isSuccessful, setIsSuccessful] = useState(false);

  // Ajout d'un état pour le motif de refus
  const [declineReason, setDeclineReason] = useState<string>("");

  // Fonction pour accepter la proposition
  async function handleAccept() {
    if (!token) return;
    if (!selectedSlotId) {
      toast.error("Merci de choisir un créneau.");
      return;
    }

    console.log("Accepting slot:", selectedSlotId);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/appointment-request-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            action: "accept",
            slotId: selectedSlotId,
          }),
        }
      );
      const result = await res.json();
      if (result.error) {
        toast.error(result.message || "Erreur lors de l'acceptation");
      } else {
        toast.success("Rendez-vous confirmé !");
        setIsSuccessful(true);
      }
    } catch {
      toast.error("Erreur serveur");
    }
  }

  // Fonction pour décliner la proposition
  async function handleDecline() {
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/appointment-request-response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            action: "decline",
            reason: declineReason,
          }),
        }
      );
      const result = await res.json();
      if (result.error) {
        toast.error(result.message || "Erreur lors du refus");
      } else {
        toast.success("Proposition déclinée !");
        setIsSuccessful(true);
      }
    } catch {
      toast.error("Erreur serveur");
    }
  }

  //! Validation du token au chargement
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValidation({
          isLoading: false,
          isValid: false,
          error: "Token manquant dans l'URL",
        });
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/validate-appointment-request-token/${token}`
        );

        const data = await response.json();

        if (data.error) {
          let errorMessage = data.message || "Token invalide";

          // Messages d'erreur personnalisés selon le code
          switch (data.code) {
            case "INVALID_TOKEN":
              errorMessage = "Lien invalide ou expiré";
              break;
            case "APPOINTMENT_NOT_FOUND":
              errorMessage = "Rendez-vous introuvable";
              break;
            case "APPOINTMENT_NOT_RESCHEDULING":
              errorMessage =
                "Ce rendez-vous n'est plus en cours de reprogrammation";
              break;
            default:
              errorMessage = data.message || "Erreur de validation";
          }

          setTokenValidation({
            isLoading: false,
            isValid: false,
            error: errorMessage,
          });
        } else {
          setTokenValidation({
            isLoading: false,
            isValid: true,
            error: null,
            appointmentRequest: data.appointmentRequest,
          });
        }
      } catch (error) {
        console.error("Erreur lors de la validation du token:", error);
        setTokenValidation({
          isLoading: false,
          isValid: false,
          error: "Erreur de connexion",
        });
      }
    };

    validateToken();
  }, [token]);

  if (tokenValidation.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-noir-700 to-noir-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary-400 mx-auto mb-4"></div>
          <p className="text-white font-one">Vérification du lien...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!tokenValidation.isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-noir-700 to-noir-500 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white/5 rounded-2xl p-8 border border-red-500/30">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white font-one mb-4">
            Accès refusé
          </h1>
          <p className="text-red-300 font-one mb-6">{tokenValidation.error}</p>
          <div className="text-white/70 text-sm font-one">
            <p>Ce lien n&apos;est plus valide.</p>
            <p className="mt-2">
              Contactez le salon pour obtenir un nouveau lien.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state (affiché après acceptation ou refus)
  if (isSuccessful) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-noir-700 to-noir-500 flex items-center justify-center">
        <div className="my-8 max-w-2xl mx-auto text-center bg-gradient-to-br from-noir-500/20 to-noir-500/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-400"
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
          <h1 className="text-xl font-bold text-white font-one tracking-wide mb-4">
            {declineReason ? "Proposition déclinée" : "Rendez-vous confirmé !"}
          </h1>
          <p className="text-white/80 font-one text-base mb-4">
            {declineReason
              ? "Vous avez décliné la proposition. Le salon a été notifié."
              : "Merci d'avoir confirmé votre rendez-vous. Vous recevrez un email de confirmation sous peu."}
          </p>
        </div>
      </div>
    );
  }

  // Helper pour parser les détails
  function getDetails(appointmentRequest?: ProposeRdvInfo) {
    if (!appointmentRequest?.details) return null;
    try {
      return JSON.parse(appointmentRequest.details);
    } catch {
      return null;
    }
  }

  function getAvailability(appointmentRequest?: ProposeRdvInfo) {
    if (!appointmentRequest || !(appointmentRequest as any).availability)
      return null;
    try {
      return JSON.parse((appointmentRequest as any).availability);
    } catch {
      return null;
    }
  }

  function formatDateJour(dateStr: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatDateSimple(dateStr: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatHeure(dateStr: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-noir-700 to-noir-500 z-[9999]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white font-one tracking-wide mb-4">
              📅 Confirmation de rendez-vous
            </h1>
            <p className="text-white/70 text-base font-one">
              Vérifiez les détails et acceptez ou déclinez la proposition
              ci-dessous.
            </p>
          </div>

          {/* Informations du rendez-vous */}
          {tokenValidation.appointmentRequest && (
            <div>
              {/* Salon */}
              <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.06] p-3 flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-white/10 bg-white/10">
                  {tokenValidation.appointmentRequest.salonImage ? (
                    <Image
                      src={tokenValidation.appointmentRequest.salonImage}
                      alt={tokenValidation.appointmentRequest.salonName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-white/40 text-[10px]">
                      N/A
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-white/90 text-base font-one truncate font-semibold">
                    {tokenValidation.appointmentRequest.salonName}
                  </div>
                  <div className="text-white/55 text-xs">
                    {[
                      tokenValidation.appointmentRequest.salonAddress,
                      tokenValidation.appointmentRequest.salonPostalCode,
                      tokenValidation.appointmentRequest.salonCity,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                  <div className="text-white/70 text-xs mt-1">
                    {tokenValidation.appointmentRequest.salonPhone}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-noir-500/20 to-noir-500/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-2xl mb-8">
                {/* Carte RDV */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-3">
                    <div>
                      <span className="text-white/60 text-xs font-one">
                        Vous
                      </span>
                      <div className="text-white font-one font-semibold">
                        {tokenValidation.appointmentRequest.clientFirstname}{" "}
                        {tokenValidation.appointmentRequest.clientLastname}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-white/60 text-xs font-one">Type</span>
                    <div className="text-white font-one">
                      {tokenValidation.appointmentRequest.prestation}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-white/60 text-xs font-one">
                        Statut
                      </span>
                      <div className="text-white font-one">
                        {tokenValidation.appointmentRequest.status ===
                        "PROPOSED" ? (
                          <span className="text-white">En cours</span>
                        ) : (
                          <span className="text-green-500">Confirmé</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Détails du projet */}
                  {getDetails(tokenValidation.appointmentRequest) && (
                    <div className="border-t border-white/5 pt-4 col-span-3">
                      <h2 className="flex gap-2 items-center text-lg font-semibold text-white font-one mb-2">
                        <BiDetail
                          size={25}
                          className="bg-gradient-to-br from-tertiary-500/70 to-tertiary-400/80 p-1 rounded"
                        />
                        Détails du projet
                      </h2>
                      <div className="space-y-2 text-white/80 font-one text-sm">
                        {(() => {
                          const details = getDetails(
                            tokenValidation.appointmentRequest
                          );
                          return (
                            <>
                              {details.description && (
                                <div>
                                  <span className="text-white/60 text-xs">
                                    Description
                                  </span>
                                  <div>{details.description}</div>
                                </div>
                              )}
                              {details.zone && (
                                <div>
                                  <span className="text-white/60 text-xs">
                                    Zone
                                  </span>
                                  <div>{details.zone}</div>
                                </div>
                              )}
                              {details.size && (
                                <div>
                                  <span className="text-white/60 text-xs">
                                    Taille
                                  </span>
                                  <div>{details.size}</div>
                                </div>
                              )}
                              {details.colorStyle && (
                                <div>
                                  <span className="text-white/60 text-xs">
                                    Style/Couleur
                                  </span>
                                  <div>{details.colorStyle}</div>
                                </div>
                              )}
                              {/* Affichage des images sketch et reference */}
                              <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl">
                                {details.sketch && (
                                  <div className="mt-2">
                                    <div className="w-full max-w-xs rounded-lg overflow-hidden border border-white/10 bg-white/10">
                                      <Image
                                        src={details.sketch}
                                        alt="Croquis"
                                        width={300}
                                        height={300}
                                        className="object-contain w-full h-auto"
                                      />
                                    </div>
                                  </div>
                                )}
                                {details.reference && (
                                  <div className="mt-2">
                                    <div className="w-full max-w-xs rounded-lg overflow-hidden border border-white/10 bg-white/10">
                                      <Image
                                        src={details.reference}
                                        alt="Référence"
                                        width={300}
                                        height={300}
                                        className="object-contain w-full h-auto"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </>
                          );
                        })()}

                        <div className="border-t border-white/5 pt-4 mt-8 col-span-3">
                          <h2 className="flex gap-2 items-center text-lg font-semibold text-white font-one mb-2">
                            <TbClockHour4
                              size={25}
                              className="bg-gradient-to-br from-tertiary-500/80 to-tertiary-400/80 p-1 rounded"
                            />
                            Disponibilités indiquées
                          </h2>
                          <div className="space-y-2 grid grid-cols-2 text-white/80 font-one text-sm">
                            {(() => {
                              const availability = getAvailability(
                                tokenValidation.appointmentRequest
                              );
                              return (
                                <>
                                  {availability.primary && (
                                    <div>
                                      <span className="text-white/60 text-xs">
                                        Principale
                                      </span>
                                      <div>
                                        {formatDateSimple(
                                          availability.primary.date
                                        )}
                                        <br />
                                        De {availability.primary.from} à{" "}
                                        {availability.primary.to}
                                      </div>
                                    </div>
                                  )}
                                  {availability.alternative && (
                                    <div>
                                      <span className="text-white/60 text-xs">
                                        Alternative
                                      </span>
                                      <div>
                                        {formatDateSimple(
                                          availability.alternative.date
                                        )}
                                        <br />
                                        De {
                                          availability.alternative.from
                                        } à {availability.alternative.to}
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Proposition du salon */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
                <h2 className="flex gap-2 items-center text-lg font-semibold text-white font-one mb-4">
                  <MdOutlineDateRange
                    size={25}
                    className="bg-gradient-to-br from-tertiary-500/80 to-tertiary-400/80 p-1 rounded"
                  />
                  Propositions du salon
                </h2>

                {!tokenValidation.appointmentRequest?.proposedSlots?.length ? (
                  <p className="text-white/70 text-sm font-one">
                    Aucun créneau pour le moment.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tokenValidation.appointmentRequest.proposedSlots.map(
                      (slot) => (
                        <label
                          key={slot.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="slot"
                            className="accent-tertiary-500"
                            checked={selectedSlotId === slot.id}
                            onChange={() => setSelectedSlotId(slot.id)}
                          />
                          <div className="text-white/90 font-one">
                            <div className="font-semibold">
                              {formatDateJour(slot.from)}
                            </div>
                            <div className="text-white/70 text-sm">
                              De {formatHeure(slot.from)} à{" "}
                              {formatHeure(slot.to)}
                            </div>
                          </div>
                        </label>
                      )
                    )}
                  </div>
                )}
              </div>

              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Si vous souhaitez décliner, vous pouvez préciser votre motif ici. (optionnel)"
                className=" w-full p-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-one"
              />

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-4">
                <button
                  disabled={!selectedSlotId}
                  className="cursor-pointer w-[175px] flex justify-center items-center gap-2 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg"
                  onClick={handleAccept}
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Accepter la proposition</span>
                </button>
                <div className="flex flex-col items-center">
                  <button
                    className="cursor-pointer w-[175px] flex justify-center items-center gap-2 py-2 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg"
                    onClick={handleDecline}
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span>Décliner</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Informations importantes */}
          <div className="mt-8 bg-tertiary-500/10 border border-tertiary-500/20 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <FaCircleInfo size={25} className=" p-1 rounded" />

              <div>
                <h3 className="text-white font-semibold font-one mb-3">
                  Informations importantes
                </h3>
                <ul className="text-white/70 text-xs space-y-2 font-one">
                  <li>• Vérifiez bien la date et l'heure proposées</li>
                  <li>• Vous pouvez accepter ou décliner la proposition</li>
                  <li>• En cas de question, contactez directement le salon</li>
                  <li>
                    • Vous recevrez un email de confirmation après votre choix
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component that wraps the content in Suspense
export default function RdvRequestPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RdvRequestContent />
    </Suspense>
  );
}
