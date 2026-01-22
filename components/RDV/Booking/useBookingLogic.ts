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
import { PiercingZone } from "@/lib/type";

type AppointmentRequestForm = z.infer<typeof appointmentRequestSchema>;

interface UseBookingLogicProps {
  salon: any;
  defaultTatoueurId?: string | null;
}

export function useBookingLogic({
  salon,
  defaultTatoueurId,
}: UseBookingLogicProps) {
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

  // États pour les images
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [placementImageUrl, setPlacementImageUrl] = useState<string>("");

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

    // Vérification pour prestation PROJET
    if (prestation === "PROJET") {
      if (selectedSlots.length >= 1) {
        toast.error(
          "Pour un rendez-vous projet, vous ne pouvez sélectionner qu'un seul créneau de 30 minutes.",
        );
        return;
      }
      setSelectedSlots([slotStart]);
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
          console.error("Erreur compression:", error);
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
        description: data.details?.description || data.message || "",
        zone: data.details?.zone || "",
        size: data.details?.size || "",
        colorStyle: data.details?.colorStyle || "",
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
    setExistingImages([]);
    setPlacementImageUrl("");
    setSketchFile(null);
    setReferenceFile(null);
    setSelectedPiercingZone("");
    setSelectedPiercingService("");
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

    // Images
    sketchFile,
    setSketchFile,
    referenceFile,
    setReferenceFile,
    existingImages,
    setExistingImages,
    placementImageUrl,
    setPlacementImageUrl,

    // Handlers
    goNext,
    goPrev,
    handleSlotSelection,
    handleTatoueurChange,
    handleDateChange,
    handlePrestationChange,
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
