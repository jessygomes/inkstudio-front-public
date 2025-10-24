/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentRequestSchema } from "@/lib/zod/validator-schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toSlug } from "@/lib/utils";
import ImageUploader from "../Shared/ImageUploader";
import { uploadFiles } from "@/lib/utils/uploadthing";
import imageCompression from "browser-image-compression";

// --- Types
type Tatoueur = {
  id: string;
  name: string;
  img?: string | null;
  instagram?: string | null;
  rdvBookingEnabled: boolean;
};

type SalonSummary = {
  id: string; // = userId du salon
  name: string;
  image?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  tatoueurs?: Tatoueur[] | null;
  prestations: string[];
  appointmentBookingEnabled?: boolean; // Changé de requireConfirmation à appointmentBookingEnabled
};

type Props = {
  salon: SalonSummary; // salon courant (obligatoire)
  apiBase?: string; // override si besoin
  defaultTatoueurId?: string | null; // préférence optionnelle
};

// --- Utils
const classNames = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

type AppointmentRequestForm = z.infer<typeof appointmentRequestSchema>;

// --- UI helpers
const StepBadge = ({ n, active }: { n: number; active: boolean }) => (
  <div
    className={classNames(
      "w-8 h-8 rounded-full grid place-items-center text-xs font-one border-2 transition-all duration-300",
      active
        ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white border-tertiary-400/50 shadow-lg shadow-tertiary-400/25"
        : "bg-noir-600/50 text-white/50 border-white/20 backdrop-blur-sm"
    )}
  >
    {n}
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 sm:p-8 backdrop-blur-lg shadow-2xl">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-white/95 font-one text-sm tracking-[0.2em] uppercase font-semibold">
        {title}
      </h2>
    </div>
    {children}
  </div>
);

// --- Composant principal
export default function BookingFlow({
  salon,
  apiBase,
  defaultTatoueurId,
}: Props) {
  const BACK = apiBase || process.env.NEXT_PUBLIC_BACK_URL || "";

  const methods = useForm<AppointmentRequestForm>({
    resolver: zodResolver(appointmentRequestSchema),
    mode: "onBlur",
    defaultValues: {
      prestation: undefined as never,
      tatoueurId: defaultTatoueurId || "",
      availability: {
        date: new Date().toISOString().slice(0, 10),
        from: "11:00",
        to: "15:00",
        alt: { date: "", from: "", to: "" },
      },
      client: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        birthDate: "",
      },
      details: {},
      message: "",
    },
  });

  const {
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const router = useRouter();

  // Étapes (ne pas inclure l'étape 5 dans l'affichage)
  const steps = ["Prestation", "Disponibilité", "Infos", "Récap"];
  const [step, setStep] = useState(1);
  const [confirmDisabled, setConfirmDisabled] = useState(false);
  const [appointmentCreated, setAppointmentCreated] = useState(false);

  const prestation = watch("prestation");
  const artists = useMemo(
    () =>
      (salon.tatoueurs ?? []).filter((tatoueur) => tatoueur.rdvBookingEnabled),
    [salon.tatoueurs]
  );

  useEffect(() => {
    if (defaultTatoueurId) setValue("tatoueurId", defaultTatoueurId);
  }, [defaultTatoueurId, setValue]);

  // États pour la gestion des créneaux
  const [selectedTatoueur, setSelectedTatoueur] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>(
    []
  );
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);

  // Navigation
  const goNext = async () => {
    const fieldsByStep: Record<
      number,
      (keyof AppointmentRequestForm | string)[]
    > = {
      1: ["prestation"],
      2: [], // Validation custom
      3: [
        "client.firstName",
        "client.lastName",
        "client.email",
        "client.phone",
        "client.birthDate",
      ],
      4: [],
    };

    if (step === 2) {
      if (!selectedTatoueur) {
        alert("Veuillez sélectionner un tatoueur");
        return;
      }
      if (selectedSlots.length === 0) {
        alert("Veuillez sélectionner au moins un créneau");
        return;
      }
    }

    const ok = await trigger(fieldsByStep[step] as any);
    if (!ok) return;

    if (step === 3) {
      setStep(4);
      setConfirmDisabled(true);
      setTimeout(() => setConfirmDisabled(false), 3000);
    } else {
      setStep((s) => Math.min(4, s + 1));
    }

    // Remonter en haut de la page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrev = () => {
    setStep((s) => Math.max(1, s - 1));
    // Remonter en haut de la page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!selectedDate || !selectedTatoueur) return;

    const fetchTimeSlots = async () => {
      try {
        setIsLoadingSlots(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/timeslots/tatoueur?date=${selectedDate}&tatoueurId=${selectedTatoueur}`
        );
        const data = await res.json();
        setTimeSlots(data);
      } catch (err) {
        setTimeSlots([]);
        console.error("Erreur lors du fetch des créneaux :", err);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    const fetchOccupied = async () => {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACK_URL
        }/appointments/tatoueur-range?tatoueurId=${selectedTatoueur}&start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`
      );
      const data = await res.json();
      setOccupiedSlots(data);
    };

    const fetchBlockedSlots = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/blocked-slots/tatoueur/${selectedTatoueur}`
        );
        const data = await res.json();
        if (!data.error) {
          setBlockedSlots(data.blockedSlots || []);
        }
      } catch (err) {
        console.error("Erreur lors du fetch des créneaux bloqués :", err);
        setBlockedSlots([]);
      }
    };

    fetchTimeSlots();
    fetchOccupied();
    fetchBlockedSlots();
  }, [selectedDate, selectedTatoueur]);

  // Fonction pour vérifier si un créneau chevauche une période bloquée
  const isSlotBlocked = (slotStart: string, slotEnd?: string) => {
    if (!selectedTatoueur) return false;

    const slotStartDate = new Date(slotStart);
    const slotEndDate = slotEnd
      ? new Date(slotEnd)
      : new Date(slotStartDate.getTime() + 30 * 60 * 1000);

    const isBlocked = blockedSlots.some((blocked) => {
      const blockedStart = new Date(blocked.startDate);
      const blockedEnd = new Date(blocked.endDate);

      const slotStartUTC = slotStartDate.getTime();
      const slotEndUTC = slotEndDate.getTime();
      const blockedStartUTC = blockedStart.getTime();
      const blockedEndUTC = blockedEnd.getTime();

      const hasOverlap =
        slotStartUTC < blockedEndUTC && slotEndUTC > blockedStartUTC;

      const concernsTatoueur =
        blocked.tatoueurId === selectedTatoueur || blocked.tatoueurId === null;

      return hasOverlap && concernsTatoueur;
    });
    return isBlocked;
  };

  // Sélection / désélection de créneaux consécutifs + vérifs (bloqué / occupé / proposé)
  const handleSlotSelection = (slotStart: string) => {
    // Bloqué ?
    if (isSlotBlocked(slotStart)) {
      toast.error("Ce créneau est indisponible (période bloquée)");
      return;
    }

    // Occupé ?
    const isOccupied = (start: string) => {
      return occupiedSlots.some((occ) => {
        const sStart = new Date(start);
        const sEnd = new Date(sStart.getTime() + 30 * 60 * 1000);
        const oStart = new Date(occ.start);
        const oEnd = new Date(occ.end);
        return sStart < oEnd && sEnd > oStart;
      });
    };
    if (isOccupied(slotStart)) {
      toast.error("Ce créneau est déjà occupé");
      return;
    }

    // Toggle & consécutivité
    if (selectedSlots.includes(slotStart)) {
      const newSelection = selectedSlots.filter((s) => s !== slotStart);
      const times = newSelection
        .map((s) => new Date(s).getTime())
        .sort((a, b) => a - b);
      const consecutive = times.every(
        (t, i) => i === 0 || t - times[i - 1] === 30 * 60 * 1000
      );
      if (consecutive || newSelection.length <= 1) {
        setSelectedSlots(newSelection);
      } else {
        alert("Les créneaux restants ne sont plus consécutifs.");
      }
      return;
    }

    const newSelection = [...selectedSlots, slotStart]
      .filter((s, i, arr) => arr.indexOf(s) === i)
      .sort(); // ISO → OK

    const nums = newSelection.map((s) => new Date(s).getTime());
    const consecutive = nums.every(
      (t, i) => i === 0 || t - nums[i - 1] === 30 * 60 * 1000
    );

    if (consecutive) {
      setSelectedSlots(newSelection);
    } else {
      alert("Les créneaux doivent être consécutifs.");
    }
  };

  // Submit → POST /appointment-request
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);

  // Mettre à jour les URLs des images dans le formulaire quand les fichiers changent
  useEffect(() => {
    if (sketchFile) {
      const url = URL.createObjectURL(sketchFile);
      setValue("details.sketch", url);
      return () => URL.revokeObjectURL(url);
    } else {
      setValue("details.sketch", "");
    }
  }, [sketchFile, setValue]);

  useEffect(() => {
    if (referenceFile) {
      const url = URL.createObjectURL(referenceFile);
      setValue("details.reference", url);
      return () => URL.revokeObjectURL(url);
    } else {
      setValue("details.reference", "");
    }
  }, [referenceFile, setValue]);

  const onSubmit = async (data: AppointmentRequestForm) => {
    // Vérifier que nous avons un tatoueur et des créneaux sélectionnés
    if (!selectedTatoueur) {
      throw new Error("Veuillez sélectionner un tatoueur");
    }
    if (selectedSlots.length === 0) {
      throw new Error("Veuillez sélectionner au moins un créneau");
    }

    // Upload images si fichiers présents (avec compression)
    let sketchUrl = "";
    let referenceUrl = "";

    if (sketchFile) {
      const compressedSketch = await imageCompression(sketchFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.8,
      });
      const res = await uploadFiles("imageUploader", {
        files: [compressedSketch],
      });
      sketchUrl = res?.[0]?.url || "";
      // Mettre à jour le formulaire pour le récap
      setValue("details.sketch", sketchUrl);
    }
    if (referenceFile) {
      const compressedReference = await imageCompression(referenceFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.8,
      });
      const res = await uploadFiles("imageUploader", {
        files: [compressedReference],
      });
      referenceUrl = res?.[0]?.url || "";
      // Mettre à jour le formulaire pour le récap
      setValue("details.reference", referenceUrl);
    }

    // Calculer start et end en format ISO à partir des créneaux sélectionnés
    const sortedSlots = selectedSlots.sort();
    const startDateTime = new Date(sortedSlots[0]).toISOString();
    const endDateTime = new Date(
      new Date(sortedSlots[sortedSlots.length - 1]).getTime() + 30 * 60 * 1000
    ).toISOString();

    // Créer le titre automatiquement
    const title = `${data.prestation} - ${data.client.firstName} ${data.client.lastName}`;

    // Construire le rdvBody selon l'interface attendue par le backend
    const rdvBody = {
      userId: salon.id,
      title,
      prestation: data.prestation,
      start: startDateTime,
      end: endDateTime,
      visio: data.visio || false,
      clientFirstname: data.client.firstName,
      clientLastname: data.client.lastName,
      clientEmail: data.client.email,
      clientPhone: data.client.phone || "",
      clientBirthdate: new Date(data.client.birthDate), // Convertir en Date
      tatoueurId: selectedTatoueur,
      // Détails du tatouage pour certaines prestations
      description: (data as any).details?.description || "",
      zone: (data as any).details?.zone || "",
      size: (data as any).details?.size || "",
      colorStyle: (data as any).details?.colorStyle || "",
      reference: referenceUrl || "",
      sketch: sketchUrl || "",
      estimatedPrice: 0, // Peut être ajouté plus tard
      price: 0, // Peut être ajouté plus tard
    };

    // Appel à l'API de création de rendez-vous
    const res = await fetch(`${BACK}/appointments/by-client`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rdvBody),
    });

    const json = await res.json();
    if (!res.ok || (json && json.error)) {
      throw new Error(json?.message || "Échec de la création du rendez-vous");
    }
    return json;
  };

  //! Construire une URL à 2 segments lisibles et uniques
  const nameSlug = toSlug(salon.name || "salon");
  const locSource = [salon.city, salon.postalCode] // city-75001
    .filter((v) => typeof v === "string" && v.trim() !== "")
    .join("-");
  const locSlug = toSlug(locSource) || "localisation";
  const salonHref = `/salon/${nameSlug}/${locSlug}`;

  //! FORMS
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(async (data) => {
          try {
            await onSubmit(data);
            setAppointmentCreated(true);
            setStep(5); // Aller à l'étape de confirmation
            toast.success("Rendez-vous créé avec succès !");
          } catch (e: any) {
            toast.error(e?.message || "Erreur serveur");
          }
        })}
        className="w-full"
      >
        {/* Header étapes - seulement si pas à l'étape 5 */}
        {step < 5 && (
          <div className="mb-8 px-4 sm:px-0">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {steps.map((label, i) => (
                <div key={label} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center gap-3">
                    <StepBadge
                      n={i + 1}
                      active={step === i + 1 || step > i + 1}
                    />
                    <span
                      className={classNames(
                        "text-xs font-one text-center tracking-wide transition-colors duration-300",
                        step >= i + 1 ? "text-white/90" : "text-white/50"
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex-1 mx-4 sm:mx-8">
                      <div
                        className={classNames(
                          "h-[2px] rounded-full transition-all duration-500",
                          step > i + 1
                            ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500"
                            : "bg-white/15"
                        )}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Étape 1 : Prestation */}
        {step === 1 && (
          <Section title="Choisir la prestation">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(salon.prestations || []).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    methods.setValue("prestation", p as any, {
                      shouldValidate: true,
                    })
                  }
                  className={classNames(
                    "group relative cursor-pointer rounded-2xl border-2 px-6 py-6 text-center transition-all duration-300 transform hover:scale-105",
                    prestation === p
                      ? "border-tertiary-500/70 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/10 shadow-lg shadow-tertiary-500/25"
                      : "border-white/20 bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:border-white/30 hover:bg-white/[0.12] backdrop-blur-sm"
                  )}
                >
                  <div className="text-sm font-one font-semibold text-white/90 tracking-wide">
                    {p}
                  </div>
                  {prestation === p && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-tertiary-500 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {(errors as any).prestation && (
              <p className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {String((errors as any).prestation?.message)}
              </p>
            )}
          </Section>
        )}

        {/* Étape 2 : Choix tatoueur + créneaux */}
        {step === 2 && (
          <Section title="Choisir le tatoueur et les créneaux">
            {/* Champ Visio pour prestation PROJET */}
            {prestation === "PROJET" && (
              <div className="mb-6 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <h3 className="text-white font-one font-semibold text-lg mb-4">
                  Type de rendez-vous
                </h3>
                <div className="space-y-4">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <input
                      type="checkbox"
                      {...methods.register("visio")}
                      className="w-5 h-5 bg-white/10 border-2 border-white/20 rounded focus:outline-none focus:border-tertiary-400 transition-colors accent-tertiary-400 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-white/90 font-one font-semibold block mb-1">
                        Rendez-vous en visioconférence
                      </span>
                      <p className="text-xs text-white/60 font-one leading-relaxed">
                        Cochez cette case si vous souhaitez que ce rendez-vous
                        de projet se déroule en ligne via visioconférence
                        (Teams, Zoom, etc.)
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Vérification si des tatoueurs sont disponibles */}
            {artists.length === 0 ? (
              <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/30 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-orange-300 text-lg font-one font-semibold mb-2">
                  Aucun tatoueur disponible
                </h3>
                <p className="text-orange-300/80 text-sm font-one">
                  Les réservations en ligne ne sont pas activées pour ce salon
                  actuellement. Contactez directement le salon pour rendez-vous.
                </p>
              </div>
            ) : (
              <>
                {/* Sélection du tatoueur */}
                <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:gap-6">
                  <div className="mb-6">
                    <label className="text-sm text-white/90 font-one mb-3 block font-semibold">
                      Tatoueur souhaité
                    </label>
                    <select
                      className="w-full max-w-md p-3 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20 transition-all duration-300 backdrop-blur-sm"
                      value={selectedTatoueur || ""}
                      onChange={(e) => {
                        setSelectedTatoueur(e.target.value);
                        setValue("tatoueurId", e.target.value);
                        setSelectedSlots([]);
                      }}
                    >
                      <option value="" className="bg-noir-500">
                        -- Choisissez un tatoueur --
                      </option>
                      {artists.map((tatoueur) => (
                        <option
                          key={tatoueur.id}
                          value={tatoueur.id}
                          className="bg-noir-500"
                        >
                          {tatoueur.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Sélection de date */}
                  {selectedTatoueur && (
                    <div className="mb-6">
                      <label className="text-sm text-white/90 font-one mb-3 block font-semibold">
                        Date souhaitée
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setSelectedSlots([]);
                        }}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full max-w-xs p-3 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20 transition-all duration-300 backdrop-blur-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Créneaux disponibles */}
                {selectedDate && selectedTatoueur && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white font-one font-semibold text-lg mb-2">
                        Créneaux disponibles
                      </h3>
                      <p className="text-sm text-white/60 font-one">
                        Sélectionnez les créneaux consécutifs que vous souhaitez
                        réserver
                      </p>
                    </div>

                    {/* Légende améliorée */}
                    <div className="bg-gradient-to-br from-white/[0.05] to-transparent rounded-2xl border border-white/10 p-4">
                      <h4 className="text-white font-one font-semibold text-sm mb-3">
                        Légende
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/20 rounded" />
                          <span className="text-white/70 font-one">
                            Disponible
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gradient-to-br from-tertiary-500/30 to-tertiary-600/20 border border-tertiary-400/60 rounded" />
                          <span className="text-white/70 font-one">
                            Sélectionné
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gradient-to-br from-gray-500/20 to-gray-600/10 border border-gray-500/40 rounded" />
                          <span className="text-white/70 font-one">
                            Occupé{" "}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/40 rounded" />
                          <span className="text-white/70 font-one">Bloqué</span>
                        </div>
                      </div>
                    </div>

                    {isLoadingSlots ? (
                      <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white/[0.05] to-transparent rounded-2xl border border-white/10">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-tertiary-400 border-t-transparent mb-4"></div>
                        <span className="text-white font-one text-sm">
                          Chargement des créneaux disponibles...
                        </span>
                      </div>
                    ) : timeSlots.length > 0 ? (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs text-white/70 font-one">
                            Sélectionnez les créneaux (30 min chacun)
                          </label>
                          <p className="text-xs text-white/50 mb-3">
                            Cliquez sur les créneaux pour les sélectionner. Ils
                            doivent être consécutifs.
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {timeSlots.map((slot) => {
                              const slotStart = new Date(slot.start);
                              const slotEnd = new Date(slot.end);
                              const startTime = slotStart.toLocaleTimeString(
                                "fr-FR",
                                { hour: "2-digit", minute: "2-digit" }
                              );
                              const endTime = slotEnd.toLocaleTimeString(
                                "fr-FR",
                                { hour: "2-digit", minute: "2-digit" }
                              );

                              const isSelected = selectedSlots.includes(
                                slot.start
                              );

                              const isOccupied = occupiedSlots.some(
                                (occupied) => {
                                  const oStart = new Date(occupied.start);
                                  const oEnd = new Date(occupied.end);
                                  return slotStart < oEnd && slotEnd > oStart;
                                }
                              );

                              const blocked = isSlotBlocked(
                                slot.start,
                                slot.end
                              );

                              // Déterminer la couleur et l'état du bouton
                              let buttonClass =
                                "cursor-pointer px-2 py-2 sm:py-1 rounded text-xs text-white font-one transition-all duration-200 border text-center ";
                              let buttonText = `${startTime}-${endTime}`;
                              let isDisabled = false;
                              let buttonTitle = "";

                              if (blocked) {
                                buttonClass +=
                                  "bg-red-900/50 text-red-300 border-red-700/50 cursor-not-allowed";
                                buttonText += " 🚫";
                                isDisabled = true;
                                buttonTitle = "Créneau bloqué - indisponible";
                              } else if (isOccupied) {
                                buttonClass +=
                                  "bg-gray-700/50 text-gray-400 border-gray-600/50 cursor-not-allowed";
                                buttonText += " ❌";
                                isDisabled = true;
                                buttonTitle = "Créneau déjà réservé";
                              } else if (isSelected) {
                                buttonClass +=
                                  "bg-green-600/30 text-green-300 border-green-500/50 hover:bg-green-600/50";
                                buttonTitle =
                                  "Créneau sélectionné - cliquer pour désélectionner";
                              } else {
                                buttonClass +=
                                  "bg-tertiary-600/20 text-tertiary-300 border-tertiary-500/30 hover:bg-tertiary-600/40 hover:text-white";
                                buttonTitle =
                                  "Créneau disponible - cliquer pour sélectionner";
                              }

                              return (
                                <button
                                  key={`${slot.start}-${slot.end}`}
                                  type="button"
                                  onClick={() =>
                                    !isDisabled &&
                                    handleSlotSelection(slot.start)
                                  }
                                  disabled={isDisabled}
                                  className={buttonClass}
                                  title={buttonTitle}
                                >
                                  {buttonText}
                                </button>
                              );
                            })}
                          </div>

                          {/* Légende des créneaux - responsive */}
                          <div className="mt-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-tertiary-600/20 border border-tertiary-500/30 rounded"></div>
                              <span className="text-white/70 font-one">
                                Libre
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-600/30 border border-green-500/50 rounded"></div>
                              <span className="text-white/70 font-one">
                                Sélectionné
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-gray-700/50 border border-gray-600/50 rounded"></div>
                              <span className="text-white/70 font-one">
                                Occupé ❌
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-900/50 border border-red-700/50 rounded"></div>
                              <span className="text-white/70 font-one">
                                Bloqué 🚫
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-900/40 border border-blue-700/50 rounded"></div>
                              <span className="text-white/70 font-one">
                                Proposé ⏳
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Récapitulatif amélioré */}
                        {selectedSlots.length > 0 && (
                          <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/5 border border-tertiary-500/30 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-tertiary-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg
                                  className="w-5 h-5 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-tertiary-300 font-semibold font-one mb-2 text-lg">
                                  Créneaux sélectionnés
                                </h4>
                                <div className="space-y-2">
                                  <p className="text-white font-one text-sm">
                                    <span className="font-semibold">
                                      {selectedSlots.length}
                                    </span>{" "}
                                    créneau{selectedSlots.length > 1 ? "x" : ""}{" "}
                                    •
                                    <span className="font-semibold">
                                      {" "}
                                      {selectedSlots.length * 30} minutes
                                    </span>
                                  </p>
                                  <p className="text-white/70 font-one text-sm">
                                    De{" "}
                                    <span className="font-semibold text-tertiary-300">
                                      {new Date(
                                        selectedSlots[0]
                                      ).toLocaleTimeString("fr-FR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>{" "}
                                    à{" "}
                                    <span className="font-semibold text-tertiary-300">
                                      {new Date(
                                        new Date(
                                          selectedSlots[
                                            selectedSlots.length - 1
                                          ]
                                        ).getTime() +
                                          30 * 60 * 1000
                                      ).toLocaleTimeString("fr-FR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/30 rounded-2xl p-6 text-center">
                        <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg
                            className="w-6 h-6 text-orange-400"
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
                        </div>
                        <h3 className="text-orange-300 text-lg font-one font-semibold mb-2">
                          Aucun créneau disponible
                        </h3>
                        <p className="text-orange-300/80 text-sm font-one">
                          Essayez une autre date ou un autre tatoueur
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </Section>
        )}

        {/* Étape 3 : Infos client & détails */}
        {step === 3 && (
          <Section title="Vos informations">
            {/* Infos client */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <TextInput
                name="client.lastName"
                label="Nom"
                placeholder="Dupont"
                errors={errors}
              />
              <TextInput
                name="client.firstName"
                label="Prénom"
                placeholder="Marie"
                errors={errors}
              />
              <TextInput
                name="client.email"
                label="Email"
                placeholder="marie@email.fr"
                errors={errors}
              />
              <TextInput
                name="client.phone"
                label="Téléphone"
                placeholder="06 12 34 56 78"
                errors={errors}
              />
              <TextInput
                name="client.birthDate"
                label="Date de naissance"
                type="date"
                errors={errors}
              />
            </div>

            {/* Détails du projet (conditionnels) */}
            {(prestation === "PROJET" ||
              prestation === "TATTOO" ||
              prestation === "RETOUCHE" ||
              prestation === "PIERCING") && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-white/[0.05] to-transparent rounded-2xl border border-white/10 p-6">
                  <h3 className="text-white font-one font-semibold text-lg mb-4">
                    Détails du projet
                  </h3>

                  <div className="space-y-4">
                    <TextArea
                      name="details.description"
                      label="Description du projet"
                      placeholder="Décrivez votre projet : style souhaité, inspirations, contraintes particulières..."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <TextInput
                        name="details.zone"
                        label="Zone du corps"
                        placeholder="Ex: Avant-bras droit"
                      />
                      {(prestation === "PROJET" ||
                        prestation === "TATTOO" ||
                        prestation === "RETOUCHE") && (
                        <>
                          <TextInput
                            name="details.size"
                            label="Taille approximative"
                            placeholder="Ex: 15cm x 20cm"
                          />
                          <TextInput
                            name="details.colorStyle"
                            label="Style/Couleurs"
                            placeholder="Ex: Blackwork, réalisme"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upload d'images */}
                {(prestation === "PROJET" ||
                  prestation === "TATTOO" ||
                  prestation === "RETOUCHE") && (
                  <div className="bg-gradient-to-br from-white/[0.05] to-transparent rounded-2xl border border-white/10 p-6">
                    <h3 className="text-white font-one font-semibold text-lg mb-4">
                      Images de référence
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm text-white/90 font-one font-semibold">
                          Image de référence principale
                        </label>
                        <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-xl p-4 border border-white/20 backdrop-blur-sm">
                          <ImageUploader
                            file={referenceFile}
                            onFileSelect={setReferenceFile}
                            compact={true}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm text-white/90 font-one font-semibold">
                          Croquis ou référence secondaire
                        </label>
                        <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-xl p-4 border border-white/20 backdrop-blur-sm">
                          <ImageUploader
                            file={sketchFile}
                            onFileSelect={setSketchFile}
                            compact={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Message optionnel */}
            <div className="mt-6">
              <TextArea
                name="message"
                label="Message complémentaire (optionnel)"
                placeholder="Ajoutez toute information utile pour le salon : allergies, expérience précédente, questions particulières..."
              />
            </div>
          </Section>
        )}

        {/* Étape 4 : Récap */}
        {step === 4 && (
          <Section title="Récapitulatif">
            <Recap salon={salon} />
            <div className="mt-4 text-[11px] text-white/50 font-one">
              {salon.appointmentBookingEnabled
                ? "En validant, votre demande de rendez-vous sera envoyée au salon pour confirmation."
                : " En validant, votre rendez-vous sera créé et confirmé directement."}
            </div>
          </Section>
        )}

        {/* Étape 5 : Confirmation */}
        {step === 5 && appointmentCreated && (
          <Section title="Rendez-vous créé">
            <div className="text-center space-y-6">
              {/* Icône de succès */}
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <svg
                  className="w-10 h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* Message principal */}
              <div className="space-y-4">
                <h2 className="text-2xl font-one font-bold text-white">
                  {salon.appointmentBookingEnabled
                    ? "Demande de rendez-vous envoyée !"
                    : "Rendez-vous confirmé !"}
                </h2>

                {salon.appointmentBookingEnabled ? (
                  <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/30 rounded-2xl p-6">
                    <div className="space-y-4 text-left">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
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
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-orange-300 font-one font-semibold text-lg mb-2">
                            En attente de confirmation
                          </h3>
                          <p className="text-orange-300/90 font-one text-sm leading-relaxed">
                            Votre demande de rendez-vous a été transmise à{" "}
                            <span className="font-semibold">{salon.name}</span>.
                            Le salon va examiner votre demande et vous envoyer
                            un email de confirmation sous 24-48h.
                          </p>
                        </div>
                      </div>

                      <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
                        <div className="flex items-center gap-2 mb-2">
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
                              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-orange-300 font-one font-semibold text-sm">
                            Vérifiez vos emails
                          </span>
                        </div>
                        <p className="text-orange-300/80 font-one text-xs">
                          N'oubliez pas de vérifier votre dossier spam/courriers
                          indésirables. L'email de confirmation pourrait s'y
                          trouver.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 rounded-2xl p-6">
                    <div className="space-y-4 text-left">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <svg
                            className="w-4 h-4 text-emerald-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-emerald-300 font-one font-semibold text-lg mb-2">
                            Rendez-vous confirmé
                          </h3>
                          <p className="text-emerald-300/90 font-one text-sm leading-relaxed">
                            Votre rendez-vous chez{" "}
                            <span className="font-semibold">{salon.name}</span>{" "}
                            est automatiquement confirmé. Vous recevrez un email
                            de confirmation avec tous les détails.
                          </p>
                        </div>
                      </div>

                      <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
                        <p className="text-emerald-300/90 font-one text-sm">
                          <span className="font-semibold">
                            Prochaines étapes :
                          </span>{" "}
                          Préparez-vous pour votre rendez-vous et n'hésitez pas
                          à contacter le salon si vous avez des questions.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton de retour */}
              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => router.push(salonHref)}
                  className="cursor-pointer group px-8 py-4 rounded-xl text-sm font-one font-semibold bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white transition-all duration-300 shadow-lg shadow-tertiary-500/25 hover:shadow-tertiary-500/40 transform hover:scale-105"
                >
                  <div className="flex items-center gap-2">
                    Retour au salon
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
                </button>
              </div>
            </div>
          </Section>
        )}

        {/* Footer navigation - seulement si pas à l'étape 5 */}
        {step < 5 && (
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrev}
              disabled={step === 1}
              className={classNames(
                "cursor-pointer group px-6 py-3 rounded-xl text-sm font-one font-semibold transition-all duration-300 border-2",
                step === 1
                  ? "border-white/10 bg-white/5 text-white/40 cursor-not-allowed"
                  : "border-white/20 bg-gradient-to-br from-white/[0.08] to-white/[0.02] text-white/90 hover:border-white/30 hover:bg-white/[0.12] backdrop-blur-sm"
              )}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Retour
              </div>
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={goNext}
                className="cursor-pointer group px-8 py-3 rounded-xl text-sm font-one font-semibold bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white transition-all duration-300 shadow-lg shadow-tertiary-500/25 hover:shadow-tertiary-500/40 transform hover:scale-105"
              >
                <div className="flex items-center gap-2">
                  Continuer
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || confirmDisabled}
                className="cursor-pointer group px-8 py-3 rounded-xl text-sm font-one font-semibold bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white transition-all duration-300 shadow-lg shadow-tertiary-500/25 hover:shadow-tertiary-500/40 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                <div className="flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Création en cours...
                    </>
                  ) : confirmDisabled ? (
                    "Veuillez patienter..."
                  ) : (
                    <>
                      Créer le rendez-vous
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            )}
          </div>
        )}
      </form>
    </FormProvider>
  );
}

/* =========================
   Champs & sous-composants
   ========================= */

function TextInput({
  name,
  label,
  placeholder,
  type = "text",
  errors,
}: {
  name: any;
  label: string;
  placeholder?: string;
  type?: string;
  errors?: any;
}) {
  const { register } = useFormContext();
  const rootKey = Array.isArray(name) ? name[0] : String(name).split(".")[0];
  const err = errors?.[rootKey];
  return (
    <div className="space-y-2">
      <label className="text-sm text-white/90 font-one font-semibold">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={classNames(
          "w-full p-3 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border rounded-xl text-white text-sm focus:outline-none transition-all duration-300 placeholder-white/50 backdrop-blur-sm",
          err
            ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            : "border-white/20 focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20"
        )}
      />
      {err && (
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
          {String(err?.message)}
        </p>
      )}
    </div>
  );
}

function TextArea({
  name,
  label,
  placeholder,
}: {
  name: any;
  label: string;
  placeholder?: string;
}) {
  const { register } = useFormContext();
  return (
    <div className="space-y-2">
      <label className="text-sm text-white/90 font-one font-semibold">
        {label}
      </label>
      <textarea
        rows={4}
        placeholder={placeholder}
        {...register(name)}
        className="w-full p-3 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20 transition-all duration-300 resize-y placeholder-white/50 backdrop-blur-sm"
      />
    </div>
  );
}

function Recap({ salon }: { salon: SalonSummary }) {
  const { watch } = useFormContext<AppointmentRequestForm>();
  const prestation = watch("prestation");
  const client = watch("client");
  const details = watch("details") as any;

  // Helper pour afficher une image si présente
  const RecapImage = ({ url, label }: { url?: string; label: string }) =>
    url ? (
      <div className="flex flex-col items-start gap-2">
        <span className="text-xs text-white/60 font-one uppercase tracking-wider">
          {label}
        </span>
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden border border-white/20 bg-white/5 backdrop-blur-sm shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={label}
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    ) : null;

  return (
    <div className="grid gap-6 text-sm">
      {/* Salon & prestation */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="text-xs text-white/60 font-one mb-2 uppercase tracking-wider">
            Salon
          </div>
          <div className="text-white/90 font-one font-semibold text-base">
            {salon.name}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-xs text-white/60 font-one mb-2 uppercase tracking-wider">
            Prestation
          </div>
          <div className="text-white/90 font-one text-base">
            {prestation || "—"}
          </div>
        </div>
      </div>

      {/* Infos client */}
      <div>
        <div className="text-xs text-white/60 font-one mb-3 uppercase tracking-wider">
          Mes informations
        </div>
        <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5 border border-white/10 rounded-xl backdrop-blur-sm">
          <div className="text-white/90 font-one grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-white/60 font-one mb-1 uppercase tracking-wider">
                Nom complet
              </p>
              <p className="font-semibold">
                {client.firstName} {client.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/60 font-one mb-1 uppercase tracking-wider">
                Email
              </p>
              <p>{client.email}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 font-one mb-1 uppercase tracking-wider">
                Téléphone
              </p>
              <p>{client.phone}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 font-one mb-1 uppercase tracking-wider">
                Date de naissance
              </p>
              <p>
                {client.birthDate
                  ? new Date(client.birthDate).toLocaleDateString("fr-FR")
                  : "Non renseignée"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Détails projet/tatouage */}
      {(details?.description ||
        details?.zone ||
        details?.size ||
        details?.colorStyle) && (
        <div>
          <div className="text-xs text-white/60 font-one mb-3 uppercase tracking-wider">
            Détails du projet
          </div>
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5 backdrop-blur-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {details?.description && (
                <div className="sm:col-span-2">
                  <span className="text-xs text-white/60 font-one mb-2 block uppercase tracking-wider">
                    Description
                  </span>
                  <div className="text-white/90 font-one leading-relaxed bg-white/[0.03] p-3 rounded-lg border border-white/10">
                    {details.description}
                  </div>
                </div>
              )}
              {details?.zone && (
                <div>
                  <span className="text-xs text-white/60 font-one mb-2 block uppercase tracking-wider">
                    Zone du corps
                  </span>
                  <div className="text-white/90 font-one font-semibold">
                    {details.zone}
                  </div>
                </div>
              )}
              {details?.size && (
                <div>
                  <span className="text-xs text-white/60 font-one mb-2 block uppercase tracking-wider">
                    Taille approximative
                  </span>
                  <div className="text-white/90 font-one font-semibold">
                    {details.size}
                  </div>
                </div>
              )}
              {details?.colorStyle && (
                <div className="sm:col-span-2">
                  <span className="text-xs text-white/60 font-one mb-2 block uppercase tracking-wider">
                    Style et couleurs
                  </span>
                  <div className="text-white/90 font-one font-semibold">
                    {details.colorStyle}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Images uploadées */}
      {(details?.reference || details?.sketch) && (
        <div>
          <div className="text-xs text-white/60 font-one mb-3 uppercase tracking-wider">
            Images de référence
          </div>
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5 backdrop-blur-sm">
            <div className="flex flex-wrap gap-6">
              <RecapImage url={details?.reference} label="Image principale" />
              <RecapImage url={details?.sketch} label="Croquis/Sketch" />
            </div>
            {!details?.reference && !details?.sketch && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-white/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-white/50 font-one text-sm">
                  Aucune image uploadée
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message */}
      {watch("message") && (
        <div>
          <div className="text-xs text-white/60 font-one mb-3 uppercase tracking-wider">
            Message complémentaire
          </div>
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5 backdrop-blur-sm">
            <div className="text-white/90 font-one whitespace-pre-wrap leading-relaxed bg-white/[0.03] p-4 rounded-lg border border-white/10">
              {watch("message")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
