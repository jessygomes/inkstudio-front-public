/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { toast } from "sonner";
import { appointmentRequestSchema } from "@/lib/zod/validator-schema";
import {
  getTimeslots,
  getOccupiedSlots,
  getBlockedSlots,
  getTimeslotBySalon,
  getOccupiedSlotsBySalon,
  getBlockedSlotsBySalon,
} from "@/lib/actions/timeslot.action";
import { getPiercingPrice } from "@/lib/actions/piercingPrice.action";
import { createAppointmentByClient } from "@/lib/actions/appointment.action";
import { uploadFiles } from "@/lib/utils/uploadthing";
import imageCompression from "browser-image-compression";
import { FlashProps, PiercingZone } from "@/lib/type";
import { SkinToneOption } from "./types";

type AppointmentRequestForm = z.infer<typeof appointmentRequestSchema>;

interface UseBookingLogicProps {
  salon: any;
  defaultTatoueurId?: string | null;
  defaultPrestation?: "TATTOO" | "PIERCING" | "PROJET" | "RETOUCHE";
  flashes?: FlashProps[];
  defaultFlashId?: string | null;
}

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

export function useBookingLogic({
  salon,
  defaultTatoueurId,
  defaultPrestation,
  flashes = [],
  defaultFlashId,
}: UseBookingLogicProps) {
  const MAX_CLIENT_SLOTS = 2;
  const initialPrestation =
    defaultPrestation &&
    ["TATTOO", "PIERCING", "PROJET", "RETOUCHE"].includes(defaultPrestation)
      ? (defaultPrestation as "TATTOO" | "PIERCING" | "PROJET" | "RETOUCHE")
      : undefined;

  const router = useRouter();
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

  const effectiveBirthDate =
    sessionBirthDate || clientProfile?.birthDate || undefined;

  // Form setup
  const methods = useForm<AppointmentRequestForm>({
    resolver: zodResolver(appointmentRequestSchema),
    mode: "onBlur",
    defaultValues: {
      prestation: (initialPrestation as never) ?? (undefined as never),
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

  // Préremplir quand la session est disponible
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

  // États
  const [step, setStep] = useState(1);
  const [confirmDisabled, setConfirmDisabled] = useState(false);
  const [appointmentCreated, setAppointmentCreated] = useState(false);

  // Prestation et artistes
  const prestation = watch("prestation");
  const artists = useMemo(
    () =>
      (salon.tatoueurs ?? []).filter(
        (tatoueur: any) => tatoueur.rdvBookingEnabled,
      ),
    [salon.tatoueurs],
  );

  useEffect(() => {
    if (defaultTatoueurId) setValue("tatoueurId", defaultTatoueurId);
  }, [defaultTatoueurId, setValue]);

  useEffect(() => {
    let isMounted = true;

    const fetchSkinTones = async () => {
      try {
        setIsLoadingSkinTones(true);
        const backUrl = process.env.NEXT_PUBLIC_BACK_URL || "";
        const response = await fetch(`${backUrl}/appointments/skin-tones`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Erreur lors du chargement (${response.status})`);
        }

        const data = (await response.json()) as SkinToneOption[];
        if (isMounted) {
          setSkinToneOptions(Array.isArray(data) ? data : []);
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

  // États pour les créneaux
  const [selectedTatoueur, setSelectedTatoueur] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>(
    [],
  );
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<any[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // États pour piercing
  const [piercingZones, setPiercingZones] = useState<PiercingZone[]>([]);
  const [selectedPiercingZone, setSelectedPiercingZone] = useState<string>("");
  const [selectedPiercingService, setSelectedPiercingService] =
    useState<string>("");
  const [isLoadingPiercingZones, setIsLoadingPiercingZones] = useState(false);
  const [piercingPrice, setPiercingPrice] = useState<number | null>(null);
  const [skinToneOptions, setSkinToneOptions] = useState<SkinToneOption[]>([]);
  const [isLoadingSkinTones, setIsLoadingSkinTones] = useState(false);

  // États pour les images
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [placementImageUrl, setPlacementImageUrl] = useState<string>("");
  const [selectedFlashId, setSelectedFlashId] = useState<string>("");

  const availableFlashes = useMemo(
    () =>
      (flashes ?? []).filter(
        (f) => f && (f.available === undefined || f.available || f.isAvailable),
      ),
    [flashes],
  );

  useEffect(() => {
    if (!defaultFlashId) return;
    if (initialPrestation !== "TATTOO") return;
    const hasFlash = availableFlashes.some((f) => f.id === defaultFlashId);
    if (!hasFlash) return;

    setSelectedFlashId(defaultFlashId);
  }, [defaultFlashId, availableFlashes, initialPrestation]);

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

  // Navigation entre étapes
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
        "details.skin",
      ],
      3: [],
      4: [],
    };

    if (step === 3) {
      if (!salon.appointmentBookingEnabled && !selectedTatoueur) {
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

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrev = () => {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fetch des créneaux
  useEffect(() => {
    if (!selectedDate) return;
    if (!salon.appointmentBookingEnabled && !selectedTatoueur) return;

    const fetchAllSlotData = async () => {
      try {
        setIsLoadingSlots(true);

        let timeslotsResult, occupiedResult, blockedResult;

        if (salon.appointmentBookingEnabled) {
          [timeslotsResult, occupiedResult, blockedResult] = await Promise.all([
            getTimeslotBySalon(selectedDate, salon.id),
            getOccupiedSlotsBySalon(selectedDate, salon.id),
            getBlockedSlotsBySalon(salon.id),
          ]);
        } else {
          [timeslotsResult, occupiedResult, blockedResult] = await Promise.all([
            getTimeslots(selectedDate, selectedTatoueur!),
            getOccupiedSlots(selectedDate, selectedTatoueur!),
            getBlockedSlots(selectedTatoueur!),
          ]);
        }

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
        setTimeSlots([]);
        setOccupiedSlots([]);
        setBlockedSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAllSlotData();
  }, [
    selectedDate,
    selectedTatoueur,
    salon.appointmentBookingEnabled,
    salon.id,
  ]);

  // Vérifier si un créneau est bloqué
  const isSlotBlocked = (slotStart: string, slotEnd?: string) => {
    if (!selectedTatoueur && !salon.appointmentBookingEnabled) return false;

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
        blocked.tatoueurId === selectedTatoueur || blocked.tatoueurId === null;

      return (
        hasOverlap && (salon.appointmentBookingEnabled || concernsTatoueur)
      );
    });
  };

  // Vérifier si un créneau est occupé
  const isSlotOccupied = (start: string) => {
    const sStart = new Date(start);
    const sEnd = new Date(sStart.getTime() + 30 * 60 * 1000);

    return occupiedSlots.some((occ) => {
      const oStart = new Date(occ.start);
      const oEnd = new Date(occ.end);
      return sStart < oEnd && sEnd > oStart;
    });
  };

  // Sélection de créneaux
  const handleSlotSelection = (slotStart: string) => {
    if (isSlotBlocked(slotStart)) {
      toast.error("Ce créneau est indisponible (période bloquée)");
      return;
    }

    if (isSlotOccupied(slotStart)) {
      toast.error("Ce créneau est déjà occupé");
      return;
    }

    // Toggle
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

    if (selectedSlots.length >= MAX_CLIENT_SLOTS) {
      toast.error(
        "Vous pouvez sélectionner au maximum 1h (2 créneaux de 30 minutes).",
      );
      return;
    }

    // Ajouter le créneau
    const newSelection = [...selectedSlots, slotStart]
      .filter((s, i, arr) => arr.indexOf(s) === i)
      .sort();

    const nums = newSelection.map((s) => new Date(s).getTime());
    const consecutive = nums.every(
      (t, i) => i === 0 || t - nums[i - 1] === 30 * 60 * 1000,
    );

    if (consecutive) {
      setSelectedSlots(newSelection);
    } else {
      alert("Les créneaux doivent être consécutifs.");
    }
  };

  // Gestion des fichiers images
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

  // Gestion du prix du piercing
  useEffect(() => {
    if (prestation === "PIERCING" && selectedPiercingService) {
      const fetchPrice = async () => {
        const result = await getPiercingPrice({ salonId: salon.id });
        if (result.ok && result.data) {
          setPiercingPrice(result.data.price);
        } else {
          setPiercingPrice(null);
        }
      };
      fetchPrice();
    } else {
      setPiercingPrice(null);
    }
  }, [prestation, selectedPiercingService, selectedPiercingZone, salon.id]);

  // Soumission du formulaire
  const onSubmit = async (data: AppointmentRequestForm) => {
    if (selectedSlots.length === 0) {
      toast.error("Veuillez sélectionner au moins un créneau");
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
        });
        if (urls.length > 0) uploadedFileUrls.sketch = urls[0].url;
      }

      if (referenceFile) {
        const compressed = await compressImage(referenceFile);
        const urls = await uploadFiles("imageUploader", {
          files: [compressed],
        });
        if (urls.length > 0) uploadedFileUrls.reference = urls[0].url;
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

      const payload = {
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
        tatoueurId: salon.appointmentBookingEnabled
          ? ""
          : selectedTatoueur || "",
        visio: data.visio || false,
        description: `${baseDescription}${flashNote}`.trim(),
        zone: data.details?.zone || "",
        size: data.details?.size || "",
        colorStyle: data.details?.colorStyle || "",
        skin: shouldSendSkin ? data.details?.skin || undefined : undefined,
        reference: uploadedFileUrls.reference || data.details?.reference || "",
        sketch: uploadedFileUrls.sketch || data.details?.sketch || "",
        piercingZone: selectedPiercingZone || undefined,
      };

      const result = await createAppointmentByClient(salon.id, payload);

      if (result.ok) {
        toast.success("Demande de rendez-vous envoyée !");
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

  const clearSelectedSlots = () => {
    setSelectedSlots([]);
  };

  // Handler pour changement de tatoueur
  const handleTatoueurChange = (tatoueurId: string) => {
    setSelectedTatoueur(tatoueurId);
    setValue("tatoueurId", tatoueurId);
    setSelectedSlots([]);
  };

  // Handler pour changement de date
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedSlots([]);
  };

  // Handler pour changement de prestation
  const handlePrestationChange = (prestation: string) => {
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

  return {
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
