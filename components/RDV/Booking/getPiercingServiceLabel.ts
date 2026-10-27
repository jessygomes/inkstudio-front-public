import type { PiercingService } from "@/lib/type";

export function getPiercingServiceLabel(
    service: PiercingService,
    parentZoneName?: string,
  ): string {
    const serviceWithAliases = service as PiercingService & {
      name?: string;
      label?: string;
      title?: string;
      specificZone?: string | boolean;
      specificZoneName?: string;
      specificZoneLabel?: string;
      zone?: string;
      zoneName?: string;
    };

    if (service.description && service.description.trim()) {
      return service.description.trim();
    }

    if (service.piercingZoneOreille) return service.piercingZoneOreille;
    if (service.piercingZoneVisage) return service.piercingZoneVisage;
    if (service.piercingZoneBouche) return service.piercingZoneBouche;
    if (service.piercingZoneCorps) return service.piercingZoneCorps;
    if (service.piercingZoneMicrodermal) return service.piercingZoneMicrodermal;
    const specificZoneValue = serviceWithAliases.specificZone as unknown;
    if (
      typeof specificZoneValue === "string" &&
      specificZoneValue.trim()
    ) {
      return specificZoneValue.trim();
    }
    if (serviceWithAliases.specificZoneName) return serviceWithAliases.specificZoneName;
    if (serviceWithAliases.specificZoneLabel) return serviceWithAliases.specificZoneLabel;
    if (serviceWithAliases.zoneName) return serviceWithAliases.zoneName;
    if (serviceWithAliases.zone) return serviceWithAliases.zone;
    if (serviceWithAliases.label) return serviceWithAliases.label;
    if (serviceWithAliases.name) return serviceWithAliases.name;
    if (serviceWithAliases.title) return serviceWithAliases.title;
    if (parentZoneName) return parentZoneName;
    return "Zone non spécifiée";
  }
