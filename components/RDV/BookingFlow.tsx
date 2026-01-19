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
import { getPiercingPrice } from "@/lib/actions/piercingPrice.action";
import {
  getTimeslots,
  getOccupiedSlots,
  getBlockedSlots,
} from "@/lib/actions/timeslot.action";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { PiercingService, PiercingZone, Props, SalonSummary } from "@/lib/type";

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
        : "bg-noir-600/50 text-white/50 border-white/20 backdrop-blur-sm",
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
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const sessionUser = (session?.user || {}) as {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    clientProfile?: { birthDate?: string | null };
  };
  const {
    firstName: sessionFirstName,
    lastName: sessionLastName,
    email: sessionEmail,
    phone: sessionPhone,
    birthDate: sessionBirthDate,
    clientProfile,
  } = sessionUser;
  const clientProfileBirthDate = clientProfile?.birthDate || undefined;
  const effectiveBirthDate = sessionBirthDate || clientProfileBirthDate;

  //! FORM SETUP avec préremplissage si utilisateur connecté
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
        firstName: isAuthenticated && sessionUser ? sessionUser.firstName : "",
        lastName: isAuthenticated && sessionUser ? sessionUser.lastName : "",
        email: isAuthenticated && sessionUser ? sessionUser.email : "",
        phone: isAuthenticated && sessionUser ? sessionUser.phone : "",
        birthDate:
          isAuthenticated && effectiveBirthDate
            ? new Date(effectiveBirthDate).toISOString().split("T")[0]
            : "",
      },
      details: {},
      message: "",
    },
  });

  // Préremplir dès que la session est disponible (cas où le rendu est client-side)
  useEffect(() => {
    if (!isAuthenticated) return;

    methods.setValue("client.firstName", sessionFirstName || "");
    methods.setValue("client.lastName", sessionLastName || "");
    methods.setValue("client.email", sessionEmail || "");
    methods.setValue("client.phone", sessionPhone || "");
    methods.setValue(
      "client.birthDate",
      effectiveBirthDate
        ? new Date(effectiveBirthDate).toISOString().split("T")[0]
        : "",
    );
  }, [
    isAuthenticated,
    effectiveBirthDate,
    sessionEmail,
    sessionFirstName,
    sessionLastName,
    sessionPhone,
    methods,
  ]);

  const {
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const router = useRouter();

  //! Étapes (ne pas inclure l'étape 5 dans l'affichage)
  const steps = ["Prestation", "Infos", "Disponibilité", "Récap"];
  const [step, setStep] = useState(1);
  const [confirmDisabled, setConfirmDisabled] = useState(false);
  const [appointmentCreated, setAppointmentCreated] = useState(false);

  const prestation = watch("prestation");
  const artists = useMemo(
    () =>
      (salon.tatoueurs ?? []).filter((tatoueur) => tatoueur.rdvBookingEnabled),
    [salon.tatoueurs],
  );

  useEffect(() => {
    if (defaultTatoueurId) setValue("tatoueurId", defaultTatoueurId);
  }, [defaultTatoueurId, setValue]);

  //! États pour la gestion des créneaux
  const [selectedTatoueur, setSelectedTatoueur] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>(
    [],
  );
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);

  //! États pour la gestion des zones de piercing
  const [piercingZones, setPiercingZones] = useState<PiercingZone[]>([]);
  const [selectedPiercingZone, setSelectedPiercingZone] = useState<string>("");
  const [selectedPiercingService, setSelectedPiercingService] =
    useState<string>("");
  const [isLoadingPiercingZones, setIsLoadingPiercingZones] = useState(false);

  //! Navigation
  const goNext = async () => {
    const fieldsByStep: Record<
      number,
      (keyof AppointmentRequestForm | string)[]
    > = {
      1: ["prestation"],
      2: [
        "client.firstName",
        "client.lastName",
        "client.email",
        "client.phone",
        "client.birthDate",
      ],
      3: [], // Validation custom pour la disponibilité
      4: [],
    };

    if (step === 3) {
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

  //! FETCH CRENEAUX quand tatoueur ou date changent
  useEffect(() => {
    if (!selectedDate || !selectedTatoueur) return;

    const fetchAllSlotData = async () => {
      try {
        setIsLoadingSlots(true);

        // Utiliser les server actions
        const [timeslotsResult, occupiedResult, blockedResult] =
          await Promise.all([
            getTimeslots(selectedDate, selectedTatoueur),
            getOccupiedSlots(selectedDate, selectedTatoueur),
            getBlockedSlots(selectedTatoueur),
          ]);

        // Gérer les résultats des créneaux disponibles
        if (timeslotsResult.ok) {
          setTimeSlots(timeslotsResult.data);
        } else {
          setTimeSlots([]);
          console.error(
            "Erreur lors du fetch des créneaux :",
            timeslotsResult.message,
          );
        }

        // Gérer les résultats des créneaux occupés
        if (occupiedResult.ok) {
          setOccupiedSlots(occupiedResult.data);
        } else {
          setOccupiedSlots([]);
          console.error(
            "Erreur lors du fetch des créneaux occupés :",
            occupiedResult.message,
          );
        }

        // Gérer les résultats des créneaux bloqués
        if (blockedResult.ok) {
          setBlockedSlots(blockedResult.data);
        } else {
          setBlockedSlots([]);
          console.error(
            "Erreur lors du fetch des créneaux bloqués :",
            blockedResult.message,
          );
        }
      } catch (err) {
        console.error(
          "Erreur générale lors du fetch des données de créneaux :",
          err,
        );
        setTimeSlots([]);
        setOccupiedSlots([]);
        setBlockedSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAllSlotData();
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
        (t, i) => i === 0 || t - times[i - 1] === 30 * 60 * 1000,
      );
      if (consecutive || newSelection.length <= 1) {
        setSelectedSlots(newSelection);
      } else {
        alert("Les créneaux restants ne sont plus consécutifs.");
      }
      return;
    }

    //! Vérification spéciale pour la prestation PROJET
    if (prestation === "PROJET") {
      if (selectedSlots.length >= 1) {
        toast.error(
          "Pour un rendez-vous projet, vous ne pouvez sélectionner qu'un seul créneau de 30 minutes.",
        );
        return;
      }
      // Pour PROJET, on sélectionne directement ce créneau unique
      setSelectedSlots([slotStart]);
      return;
    }

    const newSelection = [...selectedSlots, slotStart]
      .filter((s, i, arr) => arr.indexOf(s) === i)
      .sort(); // ISO → OK

    const nums = newSelection.map((s: string | number | Date) =>
      new Date(s).getTime(),
    );
    const consecutive = nums.every(
      (t, i) => i === 0 || t - nums[i - 1] === 30 * 60 * 1000,
    );

    if (consecutive) {
      setSelectedSlots(newSelection);
    } else {
      alert("Les créneaux doivent être consécutifs.");
    }
  };

  //! Submit → POST /appointment-request
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

    // Validation supplémentaire des champs obligatoires
    if (!data.prestation) {
      throw new Error("Veuillez sélectionner une prestation");
    }
    if (!data.client.firstName || !data.client.lastName) {
      throw new Error("Veuillez renseigner votre nom et prénom");
    }
    if (!data.client.email) {
      throw new Error("Veuillez renseigner votre email");
    }
    if (!data.client.phone) {
      throw new Error("Veuillez renseigner votre téléphone");
    }
    if (!data.client.birthDate) {
      throw new Error("Veuillez renseigner votre date de naissance");
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
      setValue("details.reference", referenceUrl);
    }

    // Calculer start et end en format ISO à partir des créneaux sélectionnés
    const sortedSlots = selectedSlots.sort();
    const startDateTime = new Date(sortedSlots[0]).toISOString();
    const endDateTime = new Date(
      new Date(sortedSlots[sortedSlots.length - 1]).getTime() + 30 * 60 * 1000,
    ).toISOString();

    // Créer le titre automatiquement
    const title = `${data.prestation} - ${data.client.firstName} ${data.client.lastName}`;

    // Construire le rdvBody selon l'interface attendue par le backend
    const rdvBody: any = {
      title: title,
      prestation: data.prestation,
      start: startDateTime,
      end: endDateTime,
      clientFirstname: data.client.firstName.trim(),
      clientLastname: data.client.lastName.trim(),
      clientEmail: data.client.email.trim(),
      clientPhone: data.client.phone.trim(),
      clientBirthdate: data.client.birthDate, // Garder en string format ISO
      tatoueurId: selectedTatoueur,
      visio: data.visio || false,
      // Détails communs à toutes les prestations
      description: (data as any).details?.description?.trim() || "",
      zone: (data as any).details?.zone?.trim() || "",
      size: (data as any).details?.size?.trim() || "",
      colorStyle: (data as any).details?.colorStyle?.trim() || "",
      reference: referenceUrl || "",
      sketch: sketchUrl || "",
      estimatedPrice: 0,
      price: 0,
    };

    // Ajouter les champs spécifiques aux piercings si c'est une prestation PIERCING
    if (data.prestation === "PIERCING" && selectedPiercingService) {
      const selectedService = selectedZoneServices.find(
        (s) => s.id === selectedPiercingService,
      );
      const selectedZone = piercingZones.find(
        (z) => z.id === selectedPiercingZone,
      );

      if (selectedService && selectedZone) {
        // Définir le prix du piercing
        rdvBody.estimatedPrice = selectedService.price;
        rdvBody.price = selectedService.price;

        // Ajouter la zone principale
        rdvBody.piercingZone = selectedZone.piercingZone;

        // Mapper les zones spécifiques selon la logique backend
        const zoneLower = selectedZone.piercingZone?.toLowerCase();

        // Réinitialiser tous les champs de zone à null
        rdvBody.piercingZoneOreille = null;
        rdvBody.piercingZoneVisage = null;
        rdvBody.piercingZoneBouche = null;
        rdvBody.piercingZoneCorps = null;
        rdvBody.piercingZoneMicrodermal = null;

        // Assigner le bon champ selon la zone
        switch (zoneLower) {
          case "oreille":
          case "oreilles":
            rdvBody.piercingZoneOreille = selectedService.id;
            break;
          case "visage":
            rdvBody.piercingZoneVisage = selectedService.id;
            break;
          case "bouche":
          case "langue":
          case "lèvre":
          case "lèvres":
            rdvBody.piercingZoneBouche = selectedService.id;
            break;
          case "corps":
          case "torse":
          case "ventre":
          case "nombril":
            rdvBody.piercingZoneCorps = selectedService.id;
            break;
          case "microdermal":
          case "micro-dermal":
          case "implant":
            rdvBody.piercingZoneMicrodermal = selectedService.id;
            break;
          default:
            // Par défaut, considérer comme piercing corps
            rdvBody.piercingZoneCorps = selectedService.id;
            break;
        }
      }
    }

    console.log("Données envoyées au backend:", { userId: salon.id, rdvBody });

    // Appel à l'API de création de rendez-vous avec le userId
    const res = await fetch(`${BACK}/appointments/by-client`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: salon.id,
        rdvBody: rdvBody,
      }),
    });

    const json = await res.json();
    console.log("Réponse du backend:", json);

    if (!res.ok || (json && json.error)) {
      throw new Error(json?.message || "Échec de la création du rendez-vous");
    }
    return json;
  };

  // Charger les zones de piercing quand la prestation PIERCING est sélectionnée
  useEffect(() => {
    if (prestation === "PIERCING") {
      const fetchPiercingZones = async () => {
        try {
          setIsLoadingPiercingZones(true);
          console.log("Fetching piercing zones for salon:", salon.id);

          // Utiliser le server action pour récupérer toutes les configurations
          const result = await getPiercingPrice({ salonId: salon.id });
          console.log("Piercing zones result received:", result);

          if (result.ok && result.data) {
            // Si on a des données, les utiliser
            const zones = Array.isArray(result.data) ? result.data : [];
            console.log("Setting piercing zones:", zones);
            setPiercingZones(zones);
          } else {
            // Gestion des erreurs
            console.error(
              "Erreur lors du fetch des zones de piercing:",
              result.message || "Erreur inconnue",
            );
            setPiercingZones([]);

            // Optionnel: afficher un toast d'erreur pour informer l'utilisateur
            // toast.error(`Impossible de charger les zones de piercing: ${result.message}`);
          }
        } catch (err) {
          console.error(
            "Erreur catch lors du fetch des zones de piercing:",
            err,
          );
          setPiercingZones([]);

          // Optionnel: toast d'erreur réseau
          // toast.error("Erreur réseau lors du chargement des zones de piercing");
        } finally {
          setIsLoadingPiercingZones(false);
        }
      };

      fetchPiercingZones();
    } else {
      // Reset quand on change de prestation
      setPiercingZones([]);
      setSelectedPiercingZone("");
      setSelectedPiercingService("");
    }
  }, [prestation, salon.id]);

  const selectedZoneServices = useMemo(() => {
    const zone = piercingZones.find((z) => z.id === selectedPiercingZone);
    return zone?.services || [];
  }, [piercingZones, selectedPiercingZone]);

  const selectedServicePrice = useMemo(() => {
    const service = selectedZoneServices.find(
      (s) => s.id === selectedPiercingService,
    );
    return service?.price || 0;
  }, [selectedZoneServices, selectedPiercingService]);

  // Fonction pour extraire le nom détaillé de la zone selon les champs de service
  const getServiceZoneName = (service: PiercingService): string => {
    if (service.piercingZoneOreille) return service.piercingZoneOreille;
    if (service.piercingZoneVisage) return service.piercingZoneVisage;
    if (service.piercingZoneBouche) return service.piercingZoneBouche;
    if (service.piercingZoneCorps) return service.piercingZoneCorps;
    if (service.piercingZoneMicrodermal) return service.piercingZoneMicrodermal;
    return service.description || "Zone non spécifiée";
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
                        step >= i + 1 ? "text-white/90" : "text-white/50",
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
                            : "bg-white/15",
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
                      : "border-white/20 bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:border-white/30 hover:bg-white/[0.12] backdrop-blur-sm",
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

        {/* Étape 2 : Infos client & détails */}
        {step === 2 && (
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
                      {prestation === "PIERCING" ? (
                        <>
                          {/* Sélection zone de piercing */}
                          <div className="sm:col-span-3 space-y-4">
                            <div>
                              <label className="text-sm text-white/90 font-one font-semibold mb-3 block">
                                Zone de piercing
                              </label>
                              {isLoadingPiercingZones ? (
                                <div className="flex items-center justify-center p-4 bg-white/5 rounded-xl border border-white/10">
                                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-tertiary-400 border-t-transparent mr-3"></div>
                                  <span className="text-white/70 text-sm">
                                    Chargement des zones...
                                  </span>
                                </div>
                              ) : piercingZones.length > 0 ? (
                                <select
                                  className="w-full p-3 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20 transition-all duration-300 backdrop-blur-sm"
                                  value={selectedPiercingZone}
                                  onChange={(e) => {
                                    setSelectedPiercingZone(e.target.value);
                                    setValue(
                                      "details.piercingZone",
                                      e.target.value,
                                    );
                                  }}
                                >
                                  <option value="" className="bg-noir-500">
                                    -- Choisissez une zone --
                                  </option>
                                  {piercingZones.map((zone) => (
                                    <option
                                      key={zone.id}
                                      value={zone.id}
                                      className="bg-noir-500"
                                    >
                                      {zone.piercingZone} ({zone.servicesCount}{" "}
                                      option{zone.servicesCount > 1 ? "s" : ""})
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                                  <p className="text-orange-300 text-sm font-one">
                                    Aucune zone de piercing configurée pour ce
                                    salon.
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Sélection du service spécifique */}
                            {selectedPiercingZone &&
                              selectedZoneServices.length > 0 && (
                                <div>
                                  <label className="text-sm text-white/90 font-one font-semibold mb-3 block">
                                    Zone détaillée et prix
                                  </label>
                                  <div className="grid gap-3">
                                    {selectedZoneServices.map((service) => (
                                      <label
                                        key={service.id}
                                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
                                          selectedPiercingService === service.id
                                            ? "border-tertiary-500/70 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/10 shadow-lg shadow-tertiary-500/25"
                                            : "border-white/20 bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:border-white/30 hover:bg-white/[0.12] backdrop-blur-sm"
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <input
                                            type="radio"
                                            name="piercingService"
                                            value={service.id}
                                            checked={
                                              selectedPiercingService ===
                                              service.id
                                            }
                                            onChange={(e) => {
                                              setSelectedPiercingService(
                                                e.target.value,
                                              );
                                              setValue(
                                                "details.piercingServiceId",
                                                e.target.value,
                                              );
                                            }}
                                            className="w-4 h-4 text-tertiary-500 focus:ring-tertiary-400 bg-transparent border-white/30"
                                          />
                                          <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                              <div className="flex flex-col">
                                                <span className="text-white font-one font-semibold">
                                                  {getServiceZoneName(service)}
                                                </span>
                                                {service.description && (
                                                  <span className="text-xs text-white/60 font-one mt-1">
                                                    {service.description}
                                                  </span>
                                                )}
                                              </div>
                                              <span className="text-tertiary-400 font-one font-bold text-lg">
                                                {service.price}€
                                              </span>
                                            </div>
                                            {service.specificZone && (
                                              <span className="text-xs text-white/50 font-one mt-1">
                                                Zone spécifique
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {/* Prix total affiché */}
                            {selectedServicePrice > 0 && (
                              <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/5 border border-tertiary-500/30 rounded-2xl p-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="text-tertiary-300 font-semibold font-one text-lg">
                                      Prix du piercing
                                    </h4>
                                    <p className="text-white/70 text-sm font-one">
                                      Prix indicatif, peut varier selon les
                                      bijoux choisis
                                    </p>
                                  </div>
                                  <div className="text-3xl font-bold text-tertiary-400 font-two">
                                    {selectedServicePrice}€
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upload d'images - seulement pour TATTOO, PROJET, RETOUCHE */}
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

        {/* Étape 3 : Choix tatoueur + créneaux */}
        {step === 3 && (
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
                          {prestation === "PROJET" ? (
                            <p className="text-xs text-white/50 mb-3">
                              Pour un rendez-vous projet, sélectionnez un seul
                              créneau de 30 minutes.
                            </p>
                          ) : (
                            <p className="text-xs text-white/50 mb-3">
                              Cliquez sur les créneaux pour les sélectionner.
                              Ils doivent être consécutifs.
                            </p>
                          )}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {timeSlots.map((slot) => {
                              const slotStart = new Date(slot.start);
                              const slotEnd = new Date(slot.end);
                              const startTime = slotStart.toLocaleTimeString(
                                "fr-FR",
                                { hour: "2-digit", minute: "2-digit" },
                              );
                              const endTime = slotEnd.toLocaleTimeString(
                                "fr-FR",
                                { hour: "2-digit", minute: "2-digit" },
                              );

                              const isSelected = selectedSlots.includes(
                                slot.start,
                              );

                              const isOccupied = occupiedSlots.some(
                                (occupied) => {
                                  const oStart = new Date(occupied.start);
                                  const oEnd = new Date(occupied.end);
                                  return slotStart < oEnd && slotEnd > oStart;
                                },
                              );

                              const blocked = isSlotBlocked(
                                slot.start,
                                slot.end,
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
                                  {prestation === "PROJET"
                                    ? "Créneau sélectionné"
                                    : "Créneaux sélectionnés"}
                                </h4>
                                <div className="space-y-2">
                                  <p className="text-white font-one text-sm">
                                    {prestation === "PROJET" ? (
                                      <>
                                        <span className="font-semibold">
                                          1 créneau
                                        </span>{" "}
                                        •
                                        <span className="font-semibold">
                                          {" "}
                                          30 minutes
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="font-semibold">
                                          {selectedSlots.length}
                                        </span>{" "}
                                        créneau
                                        {selectedSlots.length > 1 ? "x" : ""} •
                                        <span className="font-semibold">
                                          {" "}
                                          {selectedSlots.length * 30} minutes
                                        </span>
                                      </>
                                    )}
                                  </p>
                                  <p className="text-white/70 font-one text-sm">
                                    {prestation === "PROJET" ? (
                                      <>
                                        Horaire:{" "}
                                        <span className="font-semibold text-tertiary-300">
                                          {new Date(
                                            selectedSlots[0],
                                          ).toLocaleTimeString("fr-FR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>{" "}
                                        -{" "}
                                        <span className="font-semibold text-tertiary-300">
                                          {new Date(
                                            new Date(
                                              selectedSlots[0],
                                            ).getTime() +
                                              30 * 60 * 1000,
                                          ).toLocaleTimeString("fr-FR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        De{" "}
                                        <span className="font-semibold text-tertiary-300">
                                          {new Date(
                                            selectedSlots[0],
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
                                              ],
                                            ).getTime() +
                                              30 * 60 * 1000,
                                          ).toLocaleTimeString("fr-FR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      </>
                                    )}
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

        {/* Étape 4 : Récap */}
        {step === 4 && (
          <Section title="Récapitulatif">
            <Recap
              salon={salon}
              selectedPiercingZone={selectedPiercingZone}
              selectedPiercingService={selectedPiercingService}
              piercingZones={piercingZones}
            />
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
                  : "border-white/20 bg-gradient-to-br from-white/[0.08] to-white/[0.02] text-white/90 hover:border-white/30 hover:bg-white/[0.12] backdrop-blur-sm",
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
  const pathParts = Array.isArray(name) ? name : String(name).split(".");
  const err = pathParts.reduce((acc: any, key: string) => acc?.[key], errors);
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
            : "border-white/20 focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20",
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

// Composant Recap amélioré pour les piercings
function Recap({
  salon,
  selectedPiercingZone,
  selectedPiercingService,
  piercingZones,
}: {
  salon: SalonSummary;
  selectedPiercingZone?: string;
  selectedPiercingService?: string;
  piercingZones?: PiercingZone[];
}) {
  const { watch } = useFormContext<AppointmentRequestForm>();
  const prestation = watch("prestation");
  const client = watch("client");
  const details = watch("details") as any;

  // Trouver la zone principale sélectionnée
  const selectedZone = piercingZones?.find(
    (z) => z.id === selectedPiercingZone,
  );

  // Trouver la zone détaillée sélectionnée
  const selectedService = selectedZone?.services.find(
    (s) => s.id === selectedPiercingService,
  );

  // Ta fonction pour obtenir le vrai nom de la zone détaillée
  const getServiceZoneName = (service: PiercingService): string => {
    if (service.piercingZoneOreille) return service.piercingZoneOreille;
    if (service.piercingZoneVisage) return service.piercingZoneVisage;
    if (service.piercingZoneBouche) return service.piercingZoneBouche;
    if (service.piercingZoneCorps) return service.piercingZoneCorps;
    if (service.piercingZoneMicrodermal) return service.piercingZoneMicrodermal;
    return service.description || "Zone non spécifiée";
  };

  // Helper pour afficher une image si présente
  const RecapImage = ({ url, label }: { url?: string; label: string }) =>
    url ? (
      <div className="flex flex-col items-start gap-2">
        <span className="text-xs text-white/60 font-one uppercase tracking-wider">
          {label}
        </span>
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden border border-white/20 bg-white/5 backdrop-blur-sm shadow-lg">
          <Image
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
        <div className="bg-gradient-to-br from-white/[0.05] to-transparent rounded-xl border border-white/10 p-5 backdrop-blur-sm">
          <div className="text-white/90 font-one grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-white/60 mb-1 uppercase tracking-wider">
                Nom complet
              </p>
              <p className="font-semibold">
                {client.firstName} {client.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-1 uppercase tracking-wider">
                Email
              </p>
              <p>{client.email}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-1 uppercase tracking-wider">
                Téléphone
              </p>
              <p>{client.phone}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-1 uppercase tracking-wider">
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

      {/* Détails piercing / tattoo */}
      <div>
        <div className="text-xs text-white/60 font-one mb-3 uppercase tracking-wider">
          Détails du projet
        </div>

        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5 backdrop-blur-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 🔥 Affichage piercings CORRIGÉ */}
            {prestation === "PIERCING" && selectedService && (
              <div className="sm:col-span-2">
                <span className="text-xs text-white/60 font-one mb-2 block uppercase tracking-wider">
                  Piercing sélectionné
                </span>

                <div className="bg-tertiary-500/10 border border-tertiary-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-one font-semibold text-lg">
                        {selectedZone?.piercingZone}
                      </div>
                      <div className="text-white/70 font-one text-sm">
                        Zone détaillée :{" "}
                        <span className="font-semibold text-tertiary-300">
                          {getServiceZoneName(selectedService)}
                        </span>
                      </div>
                    </div>

                    <div className="text-tertiary-400 font-one font-bold text-2xl">
                      {selectedService.price}€
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Autres détails communs */}
            {details?.description && (
              <div className="sm:col-span-2">
                <span className="text-xs text-white/60 block uppercase tracking-wider">
                  Description
                </span>
                <div className="text-white bg-white/[0.03] p-3 rounded-lg border border-white/10 leading-relaxed">
                  {details.description}
                </div>
              </div>
            )}

            {details?.zone && (
              <div>
                <span className="text-xs text-white/60 block uppercase tracking-wider">
                  Zone du corps
                </span>
                <div className="text-white">{details.zone}</div>
              </div>
            )}

            {details?.size && (
              <div>
                <span className="text-xs text-white/60 block uppercase tracking-wider">
                  Taille
                </span>
                <div className="text-white">{details.size}</div>
              </div>
            )}

            {details?.colorStyle && (
              <div>
                <span className="text-xs text-white/60 block uppercase tracking-wider">
                  Style
                </span>
                <div className="text-white">{details.colorStyle}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Images */}
      {(details?.sketch || details?.reference) && (
        <div>
          <div className="text-xs text-white/60 font-one mb-3 uppercase tracking-wider">
            Images de référence
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RecapImage url={details.reference} label="Image de référence" />
            <RecapImage url={details.sketch} label="Croquis" />
          </div>
        </div>
      )}

      {/* Message */}
      {watch("message") && (
        <div>
          <div className="text-xs text-white/60 font-one mb-3 uppercase tracking-wider">
            Message complémentaire
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-white">
            {watch("message")}
          </div>
        </div>
      )}
    </div>
  );
}
