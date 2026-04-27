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
  }>;
  appointmentBookingEnabled?: boolean;
  addConfirmationEnabled?: boolean;
}
