/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { getBookingSlotRange } from "./slotRange";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { toast } from "sonner";
import { appointmentRequestSchema } from "@/lib/zod/validator-schema";
import {
  getTimeslots,
  getResidencySlots,
  getOccupiedSlots,
  getBlockedSlots,
  getTimeslotBySalon,
  getOccupiedSlotsBySalon,
  getBlockedSlotsBySalon,
} from "@/lib/actions/timeslot.action";
import { getPiercingPrice } from "@/lib/actions/piercingPrice.action";
import { createAppointmentByClient, getSkinTones } from "@/lib/actions/appointment.action";
import { getMyMoodboardsAction } from "@/lib/actions/moodboard.action";
import { getClientProfile } from "@/lib/actions/user.action";
import { toDateInputValue } from "@/lib/utils/date";
import { uploadFiles } from "@/lib/utils/uploadthing";
import imageCompression from "browser-image-compression";
import { FlashProps, PiercingService, PiercingZone, Tatoueur } from "@/lib/type";
import { BookingMoodboardOption, SkinToneOption } from "./types";

type AppointmentRequestForm = z.infer<typeof appointmentRequestSchema>;

//! Types pour les props du hook
interface UseBookingLogicProps {
  salon: any;
  defaultTatoueurId?: string | null;
  defaultPrestation?: "TATTOO" | "PIERCING" | "PROJET" | "RETOUCHE";
  flashes?: FlashProps[];
  defaultFlashId?: string | null;
}

//! Fonction utilitaire pour obtenir les dimensions d'un flash
function getFlashDimensions(flash?: FlashProps): string {
  if (!flash) return "";

  const raw = flash.dimension || flash.dimensions || flash.size;
  if (typeof raw === "string" && raw.trim()) return raw.trim();

  if (typeof flash.width === "number" && typeof flash.height === "number") {
    const unit = (flash.unit || "cm").trim();
    return `${flash.width} x ${flash.height} ${unit}`;
  }

  return "";
}
//! Fonction utilitaire pour extraire les zones de piercing d'une réponse API
function extractPiercingZones(payload: unknown): PiercingZone[] {
  const normalizeService = (service: unknown, index: number) => {
    if (!service || typeof service !== "object") return null;
    const source = service as Record<string, unknown>;

    return {
      id:
        (typeof source.id === "string" && source.id) ||
        (typeof source.serviceId === "string" && source.serviceId) ||
        `service-${index}`,
      price:
        typeof source.price === "number"
          ? source.price
          : Number(source.price) || 0,
      description:
        (typeof source.description === "string" && source.description) ||
        (typeof source.name === "string" && source.name) ||
        (typeof source.label === "string" && source.label) ||
        (typeof source.title === "string" && source.title) ||
        null,
      piercingZoneOreille:
        (typeof source.piercingZoneOreille === "string" &&
          source.piercingZoneOreille) ||
        null,
      piercingZoneVisage:
        (typeof source.piercingZoneVisage === "string" &&
          source.piercingZoneVisage) ||
        null,
      piercingZoneBouche:
        (typeof source.piercingZoneBouche === "string" &&
          source.piercingZoneBouche) ||
        null,
      piercingZoneCorps:
        (typeof source.piercingZoneCorps === "string" &&
          source.piercingZoneCorps) ||
        null,
      piercingZoneMicrodermal:
        (typeof source.piercingZoneMicrodermal === "string" &&
          source.piercingZoneMicrodermal) ||
        null,
      name:
        (typeof source.name === "string" && source.name) ||
        (typeof source.label === "string" && source.label) ||
        (typeof source.title === "string" && source.title) ||
        undefined,
      label:
        (typeof source.label === "string" && source.label) ||
        (typeof source.name === "string" && source.name) ||
        undefined,
      specificZone:
        typeof source.specificZone === "boolean" ? source.specificZone : false,
      specificZoneLabel:
        (typeof source.specificZoneName === "string" && source.specificZoneName) ||
        (typeof source.zone === "string" && source.zone) ||
        (typeof source.zoneName === "string" && source.zoneName) ||
        undefined,
    };
  };

  const normalizeZone = (zone: unknown, index: number): PiercingZone | null => {
    if (!zone || typeof zone !== "object") return null;
    const source = zone as Record<string, unknown>;
    const servicesRaw =
      (Array.isArray(source.services) && source.services) ||
      (Array.isArray(source.items) && source.items) ||
      (Array.isArray(source.types) && source.types) ||
      [];

    const services = servicesRaw
      .map((service, serviceIndex) => normalizeService(service, serviceIndex))
      .filter(Boolean) as unknown as PiercingZone["services"];

    return {
      id:
        (typeof source.id === "string" && source.id) ||
        (typeof source.zoneId === "string" && source.zoneId) ||
        `zone-${index}`,
      piercingZone:
        (typeof source.piercingZone === "string" && source.piercingZone) ||
        (typeof source.zoneName === "string" && source.zoneName) ||
        (typeof source.name === "string" && source.name) ||
        (typeof source.label === "string" && source.label) ||
        "Zone non spécifiée",
      services,
    } as PiercingZone;
  };

  if (Array.isArray(payload)) {
    return payload
      .map((zone, index) => normalizeZone(zone, index))
      .filter(Boolean) as PiercingZone[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const source = payload as Record<string, unknown>;
  const candidates = [
    source.data,
    source.zones,
    source.piercingZones,
    source.configurations,
    source.items,
    source.overview,
    source.result,
    source.payload,
  ];

  const firstArray = candidates.find((value) => Array.isArray(value));
  if (Array.isArray(firstArray)) {
    return firstArray
      .map((zone, index) => normalizeZone(zone, index))
      .filter(Boolean) as PiercingZone[];
  }

  const nestedArray = candidates
    .filter((value) => value && typeof value === "object")
    .map((value) => {
      const nested = value as Record<string, unknown>;
      return (
        (Array.isArray(nested.zones) && nested.zones) ||
        (Array.isArray(nested.piercingZones) && nested.piercingZones) ||
        null
      );
    })
    .find((value) => Array.isArray(value));

  return Array.isArray(nestedArray)
    ? (nestedArray
        .map((zone, index) => normalizeZone(zone, index))
        .filter(Boolean) as PiercingZone[])
    : [];
}

//! -------------------------------------------------
//! HOOK PRINCIPAL POUR LA LOGIQUE DE RÉSERVATION
//! -------------------------------------------------
export function useBookingLogic({
  salon,
  defaultTatoueurId,
  defaultPrestation,
  flashes = [],
  defaultFlashId,
}: UseBookingLogicProps) {
  const initialPrestation =
    defaultPrestation &&
    ["TATTOO", "PIERCING", "PROJET", "RETOUCHE"].includes(defaultPrestation)
      ? (defaultPrestation as "TATTOO" | "PIERCING" | "PROJET" | "RETOUCHE")
      : undefined;

  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  console.log("SALON BOOKING LOGIC", salon);

  const sessionUser = (session?.user || {}) as {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    clientProfile?: { birthDate?: string | null; phone?: string | null };
  };

  const {
    id: sessionUserId,
    firstName: sessionFirstName,
    lastName: sessionLastName,
    email: sessionEmail,
    phone: sessionPhone,
    birthDate: sessionBirthDate,
    clientProfile,
  } = sessionUser;

  const effectivePhone = sessionPhone || clientProfile?.phone || "";
  const effectiveBirthDate =
    sessionBirthDate || clientProfile?.birthDate || undefined;

  //! Form setup
  const methods = useForm<AppointmentRequestForm>({
    resolver: zodResolver(appointmentRequestSchema),
    mode: "onBlur",
    defaultValues: {
      prestation: (initialPrestation as never) ?? (undefined as never),
      tatoueurId: defaultTatoueurId || "",
      availability: {
        date: toDateInputValue(new Date()),
        from: "11:00",
        to: "15:00",
        alt: { date: "", from: "", to: "" },
      },
      client: {
        firstName: isAuthenticated && sessionUser ? sessionUser.firstName : "",
        lastName: isAuthenticated && sessionUser ? sessionUser.lastName : "",
        email: isAuthenticated && sessionUser ? sessionUser.email : "",
        phone: isAuthenticated ? effectivePhone : "",
        birthDate:
          isAuthenticated && effectiveBirthDate
            ? toDateInputValue(effectiveBirthDate)
            : "",
      },
      details: {},
      moodboardId: "",
      message: "",
    },
  });

  //! Préremplir quand la session est disponible
  useEffect(() => {
    if (!isAuthenticated) return;

    methods.setValue("client.firstName", sessionFirstName || "");
    methods.setValue("client.lastName", sessionLastName || "");
    methods.setValue("client.email", sessionEmail || "");
    if (!methods.getFieldState("client.phone").isDirty && !methods.getValues("client.phone")) {
      methods.setValue("client.phone", effectivePhone);
    }
    methods.setValue(
      "client.birthDate",
      effectiveBirthDate ? toDateInputValue(effectiveBirthDate) : "",
    );
  }, [
    isAuthenticated,
    effectiveBirthDate,
    sessionEmail,
    sessionFirstName,
    sessionLastName,
    effectivePhone,
    methods,
  ]);

  // The full profile can contain a newer phone number than the login session.
  useEffect(() => {
    if (!isAuthenticated || !sessionUserId) return;
    let active = true;
    const prefillPhone = async () => {
      try {
        const result = await getClientProfile();
        if (!active || !result.ok || !result.data) return;
        const phone = result.data.phone || result.data.clientProfile?.phone;
        if (typeof phone === "string" && phone.trim() && !methods.getFieldState("client.phone").isDirty) {
          methods.setValue("client.phone", phone.trim(), { shouldValidate: true });
        }
      } catch {
        // A profile fetch must not interrupt booking or clear a number already entered.
      }
    };
    void prefillPhone();
    return () => { active = false; };
  }, [isAuthenticated, sessionUserId, methods]);

  //! Déstructurer les méthodes du formulaire
  const {
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const searchParams = useSearchParams();
  const linkedVenues: any[] = salon.role === "user_tatoueur" ? salon.linkedSalons || [] : [];
  const [venueSalonId, setVenueSalonId] = useState(() => { const id = searchParams.get("venueSalonId") || ""; return linkedVenues.some(v => v.id === id && v.publicBookingEnabled) ? id : ""; });
  const selectedVenue = linkedVenues.find(v => v.id === venueSalonId);
  const [createdStatus, setCreatedStatus] = useState<string | null>(null);
  const bookingConfirmationEnabled = createdStatus ? createdStatus === "PENDING" : salon.role === "user_tatoueur" && salon.saasPlan === "FREE" && selectedVenue ? selectedVenue.addConfirmationEnabled === true : salon.addConfirmationEnabled;
  //! États
  const [step, setStep] = useState(1);
  const confirmDisabled = false;
  const [navigationError, setNavigationError] = useState("");
  const [appointmentCreated, setAppointmentCreated] = useState(false);

  //! Prestation et artistes
  const prestation = watch("prestation");
  const normalizedAgendaMode =
    typeof salon.agendaMode === "string" ? salon.agendaMode.toUpperCase() : null;
  const isParTatoueurMode = salon.role === "user_tatoueur" ? false :
    normalizedAgendaMode !== null
      ? normalizedAgendaMode === "PAR_TATOUEUR"
      : !salon.appointmentBookingEnabled;
  const artists = useMemo<Tatoueur[]>(
    () =>
      (salon.tatoueurs ?? []).filter(
        (tatoueur: any) =>
          tatoueur.rdvBookingEnabled === true,
      ),
    [salon.tatoueurs],
  );
  const isStandaloneTatoueurAccount = useMemo(
    () =>
      !isParTatoueurMode &&
      artists.length === 0 &&
      typeof salon.id === "string" &&
      salon.id.trim() !== "",
    [isParTatoueurMode, artists.length, salon.id],
  );
  const projectAppointmentDurationMinutes = useMemo(() => {
    const raw = Number(salon?.projectAppointmentDurationMinutes);
    if (Number.isFinite(raw) && raw > 0) return raw;
    return 60;
  }, [salon?.projectAppointmentDurationMinutes]);
  const requiredProjectSlots = useMemo(
    () => Math.max(1, Math.ceil(projectAppointmentDurationMinutes / 30)),
    [projectAppointmentDurationMinutes],
  );
  const projectAppointmentIsFree =
    typeof salon?.projectAppointmentIsFree === "boolean"
      ? salon.projectAppointmentIsFree
      : true;
  const projectAppointmentResolvedPrice = projectAppointmentIsFree
    ? 0
    : typeof salon?.projectAppointmentPrice === "number"
      ? salon.projectAppointmentPrice
      : 0;

  // Préremplir le tatoueur par défaut si fourni
  useEffect(() => {
    if (defaultTatoueurId) setValue("tatoueurId", defaultTatoueurId);
  }, [defaultTatoueurId, setValue]);

  //! Fetch des teintes de peau disponibles pour le salon
  useEffect(() => {
    let isMounted = true;

    const fetchSkinTones = async () => {
      try {
        setIsLoadingSkinTones(true);
        const response = await getSkinTones();

        if (!response.ok) {
          throw new Error(`Erreur lors du chargement (${response.status})`);
        }

        const data = response.data as SkinToneOption[];
        if (isMounted) {
          const labels: Record<SkinToneOption["value"], string> = {
            tres_claire: "Très claire", claire: "Claire", claire_moyenne: "Claire à moyenne",
            mate: "Mate", foncee: "Foncée", tres_foncee: "Très foncée",
          };
          setSkinToneOptions(Array.isArray(data) ? data.map(option => ({ ...option, label: labels[option.value] || option.label })) : []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des teintes de peau:", error);
        if (isMounted) {
          setSkinToneOptions([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingSkinTones(false);
        }
      }
    };

    fetchSkinTones();

    return () => {
      isMounted = false;
    };
  }, []);

  //! États pour les créneaux
  const [selectedTatoueur, setSelectedTatoueur] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    toDateInputValue(new Date()),
  );
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>(
    [],
  );
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<any[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    if (selectedTatoueur) return;
    if (artists.length === 0) {
      if (isStandaloneTatoueurAccount) {
        setSelectedTatoueur(salon.id);
        setValue("tatoueurId", salon.id, { shouldValidate: false });
      }
      return;
    }

    const defaultArtistExists =
      typeof defaultTatoueurId === "string" &&
      artists.some((artist: any) => artist.id === defaultTatoueurId);

    const nextTatoueurId = defaultArtistExists
      ? (defaultTatoueurId as string)
      : artists[0].id;

    // Linked accounts must be explicitly chosen so the change handler redirects.
    if (artists.find((artist: any) => artist.id === nextTatoueurId)?.isLinkedUser) return;

    setSelectedTatoueur(nextTatoueurId);
    setValue("tatoueurId", nextTatoueurId, { shouldValidate: false });
  }, [
    artists,
    defaultTatoueurId,
    isStandaloneTatoueurAccount,
    salon.id,
    selectedTatoueur,
    setValue,
  ]);

  //! États pour piercing
  const [piercingZones, setPiercingZones] = useState<PiercingZone[]>([]);
  const [selectedPiercingZone, setSelectedPiercingZone] = useState<string>("");
  const [selectedPiercingService, setSelectedPiercingService] =
    useState<string>("");
  const [isLoadingPiercingZones, setIsLoadingPiercingZones] = useState(false);
  const [piercingPrice, setPiercingPrice] = useState<number | null>(null);
  const [skinToneOptions, setSkinToneOptions] = useState<SkinToneOption[]>([]);
  const [isLoadingSkinTones, setIsLoadingSkinTones] = useState(false);
  const [moodboards, setMoodboards] = useState<BookingMoodboardOption[]>([]);
  const [selectedMoodboardId, setSelectedMoodboardId] = useState("");
  const [isLoadingMoodboards, setIsLoadingMoodboards] = useState(false);

  //! États pour les images
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [placementImageUrl, setPlacementImageUrl] = useState<string>("");
  const [selectedFlashId, setSelectedFlashId] = useState<string>("");

  //! Fetch des moodboards de l'utilisateur
  useEffect(() => {
    let active = true;

    const fetchMoodboards = async () => {
      if (!isAuthenticated) {
        setMoodboards([]);
        setSelectedMoodboardId("");
        setValue("moodboardId", "", { shouldValidate: false });
        return;
      }

      try {
        setIsLoadingMoodboards(true);
        const result = await getMyMoodboardsAction();

        if (!active) return;

        if (!result.ok || !result.data) {
          setMoodboards([]);
          return;
        }

        const nextMoodboards = result.data.map((moodboard) => ({
          id: moodboard.id,
          name: moodboard.name,
          description: moodboard.description,
        }));

        setMoodboards(nextMoodboards);

        if (
          selectedMoodboardId &&
          !nextMoodboards.some((moodboard) => moodboard.id === selectedMoodboardId)
        ) {
          setSelectedMoodboardId("");
          setValue("moodboardId", "", { shouldValidate: false });
        }
      } catch (error) {
        if (!active) return;
        console.error("Erreur chargement moodboards:", error);
        setMoodboards([]);
      } finally {
        if (active) {
          setIsLoadingMoodboards(false);
        }
      }
    };

    fetchMoodboards();

    return () => {
      active = false;
    };
  }, [isAuthenticated, selectedMoodboardId, setValue]);

  //! flashes disponibles
  const availableFlashes = useMemo(
    () =>
      (flashes ?? []).filter(
        (f) => f && (f.available === undefined || f.available || f.isAvailable),
      ),
    [flashes],
  );
  const selectedFlash = useMemo(
    () => availableFlashes.find((f) => f.id === selectedFlashId),
    [availableFlashes, selectedFlashId],
  );
  const selectedFlashDurationMinutes = useMemo(() => {
    const raw = Number(selectedFlash?.appointmentDurationMinutes);
    if (Number.isFinite(raw) && raw > 0) return Math.max(60, raw);
    return 60;
  }, [selectedFlash?.appointmentDurationMinutes]);
  const requiredTattooSlots = useMemo(
    () => Math.max(1, Math.ceil(selectedFlashDurationMinutes / 30)),
    [selectedFlashDurationMinutes],
  );

  //! Préremplir le flash par défaut si fourni ET disponible
  // Ce useEffect s'exécute lorsqu'un defaultFlashId est passé en props
  useEffect(() => {
    if (!defaultFlashId) return;
    if (initialPrestation !== "TATTOO") return;
    const hasFlash = availableFlashes.some((f) => f.id === defaultFlashId);
    if (!hasFlash) return;

    setSelectedFlashId(defaultFlashId);
  }, [defaultFlashId, availableFlashes, initialPrestation]);

  // Mettre à jour les dimensions du formulaire quand le flash change
  useEffect(() => {
    if (prestation !== "TATTOO") return;

    if (!selectedFlashId) {
      return;
    }

    const selectedFlash = availableFlashes.find(
      (f) => f.id === selectedFlashId,
    );
    const dimensions = getFlashDimensions(selectedFlash);
    if (dimensions) {
      setValue("details.size", dimensions, { shouldValidate: true });
    }
  }, [selectedFlashId, prestation, availableFlashes, setValue]);

  //! Navigation entre étapes
  const goNext = async () => {
    setNavigationError("");
    const reportNavigationError = (message: string) => setNavigationError(message);
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
        "details.skin",
      ],
      3: [],
      4: [],
    };

    if (step === 1 && !prestation) { reportNavigationError("Choisissez une prestation pour continuer."); return; }
    if (step === 3 && linkedVenues.length && !selectedVenue?.publicBookingEnabled) { reportNavigationError("Choisissez un salon disponible."); return; }
    if (step === 1 && isParTatoueurMode && !selectedTatoueur) {
      reportNavigationError("Veuillez sélectionner un tatoueur avant de continuer.");
      return;
    }

    if (step === 3) {
      if (!selectedDate || selectedDate < toDateInputValue(new Date())) {
        reportNavigationError("Choisissez une date à partir d’aujourd’hui.");
        return;
      }
      if (isParTatoueurMode && !selectedTatoueur) {
        reportNavigationError("Veuillez sélectionner un tatoueur");
        return;
      }
      if (prestation === "RETOUCHE" && selectedSlots.length < 2) {
        reportNavigationError("Un rendez-vous de retouche nécessite au minimum une heure.");
        return;
      }
      if (selectedSlots.length === 0) {
        reportNavigationError("Veuillez sélectionner au moins un créneau");
        return;
      }

      if (prestation === "PROJET" && selectedSlots.length !== requiredProjectSlots) {
        reportNavigationError(
          `Pour un rendez-vous projet, vous devez sélectionner exactement ${requiredProjectSlots} créneau(x), soit ${projectAppointmentDurationMinutes} minutes.`,
        );
        return;
      }

      if (prestation === "TATTOO" && selectedSlots.length !== requiredTattooSlots) {
        reportNavigationError(
          `Pour ce flash, vous devez sélectionner exactement ${requiredTattooSlots} créneau(x), soit ${selectedFlashDurationMinutes} minutes.`,
        );
        return;
      }
    }

    if (step === 2 && prestation === "TATTOO" && !selectedFlashId) {
      reportNavigationError(
        "Pour une prestation tattoo, veuillez sélectionner un flash avant de continuer.",
      );
      return;
    }

    if (step === 2 && prestation === "PIERCING" && (!selectedPiercingZone || !selectedPiercingService)) {
      reportNavigationError("Choisissez une zone et un type de piercing pour continuer.");
      return;
    }
    const ok = await trigger(fieldsByStep[step] as any, { shouldFocus: true });
    if (!ok) { setNavigationError("Vérifiez les champs indiqués avant de continuer."); return; }

    if (step === 3) {
      setStep(4);

    } else {
      setStep((s) => Math.min(4, s + 1));
    }

  };

  const goPrev = () => {
    setNavigationError("");
    setStep((s) => Math.max(1, s - 1));
  };

  //! -------------------------------------------------
  //! Fetch des créneaux
  //! -------------------------------------------------
  useEffect(() => {
    const effectiveTatoueurId =
      selectedTatoueur || (isStandaloneTatoueurAccount ? salon.id : null);
    const shouldFetchBySalon =
      salon.appointmentBookingEnabled && !isStandaloneTatoueurAccount;

    if (linkedVenues.length && !selectedVenue?.publicBookingEnabled) { setTimeSlots([]); setOccupiedSlots([]); setBlockedSlots([]); return; }
    if (!selectedDate) return;
    if (!shouldFetchBySalon && !effectiveTatoueurId) return;

    let cancelled = false;
    const fetchAllSlotData = async () => {
      try {
        setIsLoadingSlots(true);

        let timeslotsResult, occupiedResult, blockedResult;

        if (selectedVenue) {
          timeslotsResult = await getResidencySlots(selectedDate, salon.id, venueSalonId); occupiedResult = { ok: true, data: [] }; blockedResult = { ok: true, data: [] };
        } else if (shouldFetchBySalon || isStandaloneTatoueurAccount) {
          [timeslotsResult, occupiedResult, blockedResult] = await Promise.all([
            getTimeslotBySalon(selectedDate, salon.id),
            getOccupiedSlotsBySalon(selectedDate, salon.id),
            getBlockedSlotsBySalon(salon.id),
          ]);
        } else {
          [timeslotsResult, occupiedResult, blockedResult] = await Promise.all([
            getTimeslots(selectedDate, effectiveTatoueurId!),
            getOccupiedSlots(selectedDate, effectiveTatoueurId!),
            getBlockedSlots(effectiveTatoueurId!),
          ]);
        }

        if (cancelled) return;
        if (timeslotsResult.ok) {
          setTimeSlots(timeslotsResult.data);
        } else {
          setTimeSlots([]);
          console.error("Erreur créneaux:", timeslotsResult.message);
        }

        if (occupiedResult.ok) {
          setOccupiedSlots(occupiedResult.data);
        } else {
          setOccupiedSlots([]);
          console.error("Erreur créneaux occupés:", occupiedResult.message);
        }

        if (blockedResult.ok) {
          setBlockedSlots(blockedResult.data);
        } else {
          setBlockedSlots([]);
          console.error("Erreur créneaux bloqués:", blockedResult.message);
        }
      } catch (err) {
        console.error("Erreur fetch créneaux:", err);
        if (cancelled) return;
        setTimeSlots([]);
        setOccupiedSlots([]);
        setBlockedSlots([]);
      } finally {
        if (!cancelled) setIsLoadingSlots(false);
      }
    };

    fetchAllSlotData();
    return () => { cancelled = true; };
  }, [
    linkedVenues.length,
    selectedVenue,
    venueSalonId,
    selectedDate,
    selectedTatoueur,
    isStandaloneTatoueurAccount,
    salon.id,
    salon.appointmentBookingEnabled,
  ]);

  //! Vérifier si un créneau est bloqué
  const isSlotBlocked = (slotStart: string, slotEnd?: string) => {
    const effectiveTatoueurId =
      selectedTatoueur || (isStandaloneTatoueurAccount ? salon.id : null);
    const shouldFetchBySalon =
      salon.appointmentBookingEnabled && !isStandaloneTatoueurAccount;

    if (!effectiveTatoueurId && !shouldFetchBySalon) return false;

    const slotStartDate = new Date(slotStart);
    const slotEndDate = slotEnd
      ? new Date(slotEnd)
      : new Date(slotStartDate.getTime() + 30 * 60 * 1000);

    return blockedSlots.some((blocked) => {
      const blockedStart = new Date(blocked.startDate);
      const blockedEnd = new Date(blocked.endDate);

      const hasOverlap =
        slotStartDate.getTime() < blockedEnd.getTime() &&
        slotEndDate.getTime() > blockedStart.getTime();

      const concernsTatoueur =
        blocked.tatoueurId === effectiveTatoueurId || blocked.tatoueurId === null;

      return hasOverlap && (shouldFetchBySalon || concernsTatoueur);
    });
  };

  //! Vérifier si un créneau est occupé
  const isSlotOccupied = (start: string) => {
    const sStart = new Date(start);
    const sEnd = new Date(sStart.getTime() + 30 * 60 * 1000);

    return occupiedSlots.some((occ) => {
      const oStart = new Date(occ.start);
      const oEnd = new Date(occ.end);
      return sStart < oEnd && sEnd > oStart;
    });
  };

  //! Sélection de créneaux
  const handleSlotSelection = (slotStart: string, durationSlots = 1) => {
    setNavigationError("");
    const count = prestation === "PROJET" ? requiredProjectSlots : prestation === "TATTOO" ? requiredTattooSlots : prestation === "RETOUCHE" ? 2 : Math.min(2, Math.max(1, durationSlots));
    const range = getBookingSlotRange(slotStart, count, timeSlots.map(slot => slot.start), value => isSlotBlocked(value) || isSlotOccupied(value));
    if (!range) {
      setNavigationError("Cet horaire ne permet pas de réserver toute la durée du rendez-vous. Choisissez un autre départ.");
      return;
    }
    setSelectedSlots(selectedSlots[0] === slotStart && selectedSlots.length === count ? [] : range);
  };

  //! -------------------------------------------------
  //! Gestion des fichiers images
  //! -------------------------------------------------
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

  useEffect(() => {
    if (prestation !== "TATTOO" && selectedFlashId) {
      setSelectedFlashId("");
    }
  }, [prestation, selectedFlashId]);

  useEffect(() => {
    if (prestation === "PIERCING") {
      setValue("details.skin", undefined, { shouldValidate: true });
    }
  }, [prestation, setValue]);

  //! -------------------------------------------------
  //! Charger les zones de piercing configurées pour le salon.
  //! -------------------------------------------------
  useEffect(() => {
    if (prestation !== "PIERCING") {
      setPiercingZones([]);
      setSelectedPiercingZone("");
      setSelectedPiercingService("");
      setIsLoadingPiercingZones(false);
      return;
    }

    let isMounted = true;

    //! Fetch des zones de piercing
    const fetchPiercingZones = async () => {
      try {
        setIsLoadingPiercingZones(true);
        const result = await getPiercingPrice({ salonId: salon.id });

        if (!isMounted) return;

        if (result.ok) {
          const zones = extractPiercingZones(result.data);
          setPiercingZones(zones);
          return;
        }

        console.error(
          "Erreur lors du chargement des zones de piercing:",
          result.message || "Erreur inconnue",
        );
        setPiercingZones([]);
      } catch (error) {
        if (!isMounted) return;
        console.error("Erreur réseau chargement zones piercing:", error);
        setPiercingZones([]);
      } finally {
        if (isMounted) {
          setIsLoadingPiercingZones(false);
        }
      }
    };

    fetchPiercingZones();

    return () => {
      isMounted = false;
    };
  }, [prestation, salon.id]);

  //! Nettoyer le service choisi si la zone change ou n'existe plus.
  useEffect(() => {
    const zone = piercingZones.find((z) => z.id === selectedPiercingZone);

    if (!zone) {
      if (selectedPiercingService) {
        setSelectedPiercingService("");
      }
      return;
    }

    const serviceExists = zone.services.some(
      (service) => service.id === selectedPiercingService,
    );

    if (!serviceExists && selectedPiercingService) {
      setSelectedPiercingService("");
    }
  }, [piercingZones, selectedPiercingZone, selectedPiercingService]);

  //! Gestion du prix du piercing
  useEffect(() => {
    if (prestation !== "PIERCING") {
      setPiercingPrice(null);
      return;
    }

    const zone = piercingZones.find((z) => z.id === selectedPiercingZone);
    const service = zone?.services.find(
      (item: PiercingService) => item.id === selectedPiercingService,
    );

    setPiercingPrice(typeof service?.price === "number" ? service.price : null);
  }, [
    prestation,
    piercingZones,
    selectedPiercingZone,
    selectedPiercingService,
  ]);

  //! -------------------------------------------------
  //! Soumission du formulaire
  //! -------------------------------------------------
  const onSubmit = async (data: AppointmentRequestForm) => {
    if (data.prestation === "RETOUCHE" && selectedSlots.length < 2) {
      toast.error("Un rendez-vous de retouche nécessite au minimum une heure.");
      return;
    }
    if (selectedSlots.length === 0) {
      toast.error("Veuillez sélectionner au moins un créneau");
      return;
    }

    if (data.prestation === "TATTOO" && !selectedFlashId) {
      toast.error(
        "La réservation tattoo via client est disponible uniquement avec un flash sélectionné.",
      );
      return;
    }

    if (data.prestation === "TATTOO" && selectedSlots.length !== requiredTattooSlots) {
      toast.error(
        `Le rendez-vous tattoo avec flash doit contenir exactement ${requiredTattooSlots} créneau(x) (${selectedFlashDurationMinutes} min).`,
      );
      return;
    }

    if (data.prestation === "PROJET" && selectedSlots.length !== requiredProjectSlots) {
      toast.error(
        `Le rendez-vous projet doit contenir exactement ${requiredProjectSlots} créneau(x) (${projectAppointmentDurationMinutes} min).`,
      );
      return;
    }

    try {
      // Upload des fichiers
      const uploadedFileUrls: { sketch?: string; reference?: string } = {};

      const compressImage = async (file: File) => {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        try {
          return await imageCompression(file, options);
        } catch (error) {
          console.error("Erreur compression image:", error);
          return file;
        }
      };

      if (sketchFile) {
        const compressed = await compressImage(sketchFile);
        const urls = await uploadFiles("imageUploader", {
          files: [compressed],
          input: { bookingSalonId: salon.id },
        });
        if (urls.length > 0)
          uploadedFileUrls.sketch =
            (urls[0] as { ufsUrl?: string; url?: string }).ufsUrl ||
            (urls[0] as { ufsUrl?: string; url?: string }).url;
      }

      if (referenceFile) {
        const compressed = await compressImage(referenceFile);
        const urls = await uploadFiles("imageUploader", {
          files: [compressed],
          input: { bookingSalonId: salon.id },
        });
        if (urls.length > 0)
          uploadedFileUrls.reference =
            (urls[0] as { ufsUrl?: string; url?: string }).ufsUrl ||
            (urls[0] as { ufsUrl?: string; url?: string }).url;
      }

      // Préparer les données
      const finalSlots = selectedSlots.map((slotStart) => {
        const startDate = new Date(slotStart);
        const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
        return {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        };
      });

      // Calculer le start et end basés sur les créneaux sélectionnés
      const startDateTime = finalSlots[0].start;
      const endDateTime = finalSlots[finalSlots.length - 1].end;

      // Construire le payload selon le type RdvBody
      const selectedFlash =
        data.prestation === "TATTOO"
          ? availableFlashes.find((f) => f.id === selectedFlashId)
          : undefined;
      const selectedFlashLabel = selectedFlash
        ? selectedFlash.title ||
          selectedFlash.name ||
          `Flash ${selectedFlash.id}`
        : "";
      const flashNote = selectedFlashLabel
        ? `\n\nFlash sélectionné: ${selectedFlashLabel}`
        : "";
      const baseDescription = data.details?.description || data.message || "";
      const shouldSendSkin = ["TATTOO", "PROJET", "RETOUCHE"].includes(
        data.prestation,
      );
      const selectedArtist = artists.find(
        (artist: any) => artist.id === selectedTatoueur,
      );
      const isUserTatoueurAccount = isStandaloneTatoueurAccount;
      const performerTatoueurId =
        typeof selectedArtist?.profileUserId === "string" &&
        selectedArtist.profileUserId.trim() !== ""
          ? selectedArtist.profileUserId
          : selectedTatoueur ||
            defaultTatoueurId ||
            (isUserTatoueurAccount ? salon.id : "");

      if (!performerTatoueurId) {
        toast.error(
          "Veuillez sélectionner un tatoueur avant de confirmer votre rendez-vous.",
        );
        return;
      }

      if (linkedVenues.length && !selectedVenue?.publicBookingEnabled) { toast.error("Choisissez un salon disponible."); return; }
      const payload = {
        venueSalonId: venueSalonId || undefined,
        title: `${data.prestation} - ${data.client.firstName} ${data.client.lastName}`,
        prestation: data.prestation,
        start: startDateTime,
        end: endDateTime,
        clientFirstname: data.client.firstName,
        clientLastname: data.client.lastName,
        clientEmail: data.client.email,
        clientPhone: data.client.phone,
        clientBirthdate: data.client.birthDate
          ? new Date(data.client.birthDate).toISOString()
          : "",
        tatoueurId: performerTatoueurId,
        visio: false,
        description: `${baseDescription}${flashNote}`.trim(),
        zone: data.details?.zone || "",
        size: data.details?.size || "",
        colorStyle: data.details?.colorStyle || "",
        skin: shouldSendSkin ? data.details?.skin || undefined : undefined,
        moodboardId:
          isAuthenticated && sessionUserId
            ? selectedMoodboardId || undefined
            : undefined,
        reference: uploadedFileUrls.reference || data.details?.reference || "",
        sketch: uploadedFileUrls.sketch || data.details?.sketch || "",
        piercingZone: selectedPiercingZone || undefined,
        price:
          data.prestation === "PROJET"
            ? projectAppointmentResolvedPrice
            : undefined,
        estimatedPrice:
          data.prestation === "PROJET"
            ? projectAppointmentResolvedPrice
            : undefined,
      };

      const result = await createAppointmentByClient(
        salon.id,
        payload,
      );

      if (
        result.error === true &&
        result.code === "LINKED_BOOKING_REDIRECT"
      ) {
        const linkedArtist = artists.find(
          (artist: any) => artist.profileUserId === result.performerUserId,
        );
        const redirectHref =
          linkedArtist && typeof linkedArtist.bookingHref === "string"
            ? linkedArtist.bookingHref
            : result.performerUserId
              ? `/mon-profil/${encodeURIComponent(result.performerUserId)}`
              : "";

        toast.info(
          result.message ||
            "Ce tatoueur est réservable uniquement depuis son profil personnel.",
        );

        if (redirectHref) {
          router.push(redirectHref + (redirectHref.includes("?") ? "&" : "?") + "venueSalonId=" + encodeURIComponent(salon.id));
        }
        return;
      }

      if (result.error === false) {
        toast.success(
          result.message ||
            ((result.data as any)?.status === "PENDING"
              ? "Demande de rendez-vous envoyée !"
              : "Rendez-vous confirmé !"),
        );
        setCreatedStatus((result.data as any)?.status || (result.data as any)?.appointment?.status || null);
        setAppointmentCreated(true);
        setStep(5);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(
          result.message || "Erreur lors de la création du rendez-vous",
        );
      }
    } catch (err) {
      console.error("Erreur:", err);
      toast.error("Une erreur s'est produite");
    }
  };

  //! -------------------------------------------------
  const clearSelectedSlots = () => {
    setSelectedSlots([]);
  };

  // Handler pour changement de tatoueur
  const handleTatoueurChange = (tatoueurId: string) => {
    const selectedArtist = artists.find(
      (artist: any) => artist.id === tatoueurId,
    );

    if (
      selectedArtist?.isLinkedUser === true &&
      typeof selectedArtist.bookingHref === "string" &&
      selectedArtist.bookingHref.trim() !== ""
    ) {
      toast.info(
        "Ce tatoueur possède son propre compte. Redirection vers sa page de réservation.",
      );
      const destination = new URL(selectedArtist.bookingHref, window.location.origin);
      destination.searchParams.set("venueSalonId", salon.id);
      if (prestation) destination.searchParams.set("prestation", prestation);
      router.push(destination.pathname + destination.search);
      return;
    }

    setSelectedTatoueur(tatoueurId);
    setValue("tatoueurId", tatoueurId);
    setSelectedSlots([]);
  };

  // Handler pour changement de date
  const handleDateChange = (date: string) => {
    setNavigationError("");
    setTimeSlots([]);
    setOccupiedSlots([]);
    setBlockedSlots([]);
    setSelectedDate(date);
    setSelectedSlots([]);
  };

  // Handler pour changement de prestation
  const handlePrestationChange = (prestation: string) => {
    setNavigationError("");
    setValue("prestation", prestation as any);
    setSelectedSlots([]);
    if (prestation !== "TATTOO") {
      setSelectedFlashId("");
    }
    setExistingImages([]);
    setPlacementImageUrl("");
    setSketchFile(null);
    setReferenceFile(null);
    setSelectedPiercingZone("");
    setSelectedPiercingService("");
  };

  const handleFlashChange = (flashId: string) => {
    setSelectedSlots([]);
    setNavigationError("");
    setSelectedFlashId(flashId);
    const selectedFlash = availableFlashes.find((f) => f.id === flashId);
    const dimensions = getFlashDimensions(selectedFlash);
    setValue("details.size", dimensions, { shouldValidate: true });

    if (flashId) {
      setValue("details.description", "", { shouldValidate: true });
      setSketchFile(null);
      setReferenceFile(null);
    }
  };

  const handleMoodboardChange = (moodboardId: string) => {
    setSelectedMoodboardId(moodboardId);
    setValue("moodboardId", moodboardId, { shouldValidate: false });
  };

  return {
    navigationError,
    setNavigationError,
    bookingConfirmationEnabled,
    linkedVenues, venueSalonId, selectedVenue,
    handleVenueChange: (id: string) => { setVenueSalonId(id); setIsLoadingSlots(false); setSelectedSlots([]); setTimeSlots([]); setOccupiedSlots([]); setBlockedSlots([]); setSelectedDate(""); },
    // Form methods
    methods,
    watch,
    setValue,
    trigger,
    handleSubmit,
    errors,
    isSubmitting,

    // États
    step,
    setStep,
    confirmDisabled,
    appointmentCreated,
    prestation,
    artists,
    isParTatoueurMode,
    projectAppointmentDurationMinutes,
    projectAppointmentIsFree,
    projectAppointmentResolvedPrice,
    selectedFlashDurationMinutes,
    requiredTattooSlots,

    // Créneaux
    selectedTatoueur,
    selectedDate,
    timeSlots,
    selectedSlots,
    occupiedSlots,
    blockedSlots,
    isLoadingSlots,

    // Piercing
    piercingZones,
    setPiercingZones,
    selectedPiercingZone,
    setSelectedPiercingZone,
    selectedPiercingService,
    setSelectedPiercingService,
    isLoadingPiercingZones,
    setIsLoadingPiercingZones,
    piercingPrice,
    skinToneOptions,
    isLoadingSkinTones,
    moodboards,
    selectedMoodboardId,
    isLoadingMoodboards,

    // Images
    sketchFile,
    setSketchFile,
    referenceFile,
    setReferenceFile,
    existingImages,
    setExistingImages,
    placementImageUrl,
    setPlacementImageUrl,
    selectedFlashId,
    availableFlashes,

    // Handlers
    goNext,
    goPrev,
    handleSlotSelection,
    clearSelectedSlots,
    handleTatoueurChange,
    handleDateChange,
    handlePrestationChange,
    handleFlashChange,
    handleMoodboardChange,
    onSubmit,
    isSlotBlocked,
    isSlotOccupied,

    // Session
    isAuthenticated,
    sessionUser,

    // Router
    router,
  };
}
