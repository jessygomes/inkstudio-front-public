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
