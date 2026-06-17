export interface PiercingService {
  id: string;
  price: number;
  description?: string;
  piercingZoneOreille?: string;
  piercingZoneVisage?: string;
  piercingZoneBouche?: string;
  piercingZoneCorps?: string;
  piercingZoneMicrodermal?: string;
}

export interface PiercingZone {
  id: string;
  piercingZone: string;
  services: PiercingService[];
}

export type SkinToneValue =
  | "tres_claire"
  | "claire"
  | "claire_moyenne"
  | "mate"
  | "foncee"
  | "tres_foncee";

export interface SkinToneOption {
  value: SkinToneValue;
  label: string;
  previewHex: string;
}

export interface BookingMoodboardOption {
  id: string;
  name: string;
  description?: string | null;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface SalonSummary {
  id: string;
  name: string;
  city: string;
  postalCode: string;
  prestations: string[];
  tatoueurs?: Array<{
    id: string;
    name: string;
    rdvBookingEnabled: boolean;
    isLinkedUser?: boolean | null;
    profileUserId?: string | null;
    salonName?: string | null;
    city?: string | null;
    postalCode?: string | null;
    bookingHref?: string | null;
  }>;
  appointmentBookingEnabled?: boolean;
  addConfirmationEnabled?: boolean;
  agendaMode?: string | null;
}
