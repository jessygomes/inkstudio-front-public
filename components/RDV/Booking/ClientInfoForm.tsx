import React from "react";
import Section from "./Section";
import TextInput from "./TextInput";
import TextArea from "./TextArea";
import ImageUploader from "../../Shared/ImageUploader";
import { PiercingZone, PiercingService } from "@/lib/type";

interface ClientInfoFormProps {
  prestation: string;
  errors: Record<string, unknown>;
  sketchFile: File | null;
  referenceFile: File | null;
  onSketchChange: (file: File | null) => void;
  onReferenceChange: (file: File | null) => void;
  piercingZones?: PiercingZone[];
  selectedPiercingZone: string;
  selectedPiercingService: string;
  onPiercingZoneChange: (zoneId: string) => void;
  onPiercingServiceChange: (serviceId: string) => void;
  isLoadingPiercingZones: boolean;
}

export default function ClientInfoForm({
  prestation,
  errors,
  sketchFile,
  referenceFile,
  onSketchChange,
  onReferenceChange,
  piercingZones = [],
  selectedPiercingZone,
  selectedPiercingService,
  onPiercingZoneChange,
  onPiercingServiceChange,
  isLoadingPiercingZones,
}: ClientInfoFormProps) {
  const selectedZone = piercingZones.find((z) => z.id === selectedPiercingZone);
  const selectedZoneServices = selectedZone?.services || [];
  const selectedService = selectedZoneServices.find(
    (s) => s.id === selectedPiercingService,
  );

  const getServiceZoneName = (service: PiercingService): string => {
    if (service.piercingZoneOreille) return service.piercingZoneOreille;
    if (service.piercingZoneVisage) return service.piercingZoneVisage;
    if (service.piercingZoneBouche) return service.piercingZoneBouche;
    if (service.piercingZoneCorps) return service.piercingZoneCorps;
    if (service.piercingZoneMicrodermal) return service.piercingZoneMicrodermal;
    return service.description || "Zone non spécifiée";
  };

  const showProjectDetails =
    prestation === "PROJET" ||
    prestation === "TATTOO" ||
    prestation === "RETOUCHE" ||
    prestation === "PIERCING";

  const showImageUploaders =
    prestation === "PROJET" ||
    prestation === "TATTOO" ||
    prestation === "RETOUCHE";

  return (
    <Section title="Vos informations">
      {/* Infos client - grille compacte */}
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
      </div>

      {/* Détails du projet */}
      {showProjectDetails && (
        <div className="space-y-4">
          <div className="space-y-3">
            <TextArea
              name="details.description"
              label="Description du projet"
              placeholder="Décrivez votre projet : style souhaité, inspirations..."
            />

            {prestation === "PIERCING" ? (
              // Piercing: zone et service
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs text-white/80 font-one font-semibold uppercase tracking-wide">
                    Zone du piercing
                  </label>
                  {isLoadingPiercingZones ? (
                    <div className="w-full p-2.5 bg-white/[0.05] border border-white/10 rounded-lg text-white/50 text-sm">
                      Chargement...
                    </div>
                  ) : piercingZones.length === 0 ? (
                    <div className="w-full p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
                      Aucune zone configurée
                    </div>
                  ) : (
                    <select
                      value={selectedPiercingZone}
                      onChange={(e) => {
                        onPiercingZoneChange(e.target.value);
                        onPiercingServiceChange("");
                      }}
                      className="w-full p-2.5 bg-white/[0.05] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-1 focus:ring-tertiary-400/30 transition-all"
                    >
                      <option value="">Sélectionnez une zone</option>
                      {piercingZones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.piercingZone}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {selectedPiercingZone && selectedZoneServices.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs text-white/80 font-one font-semibold uppercase tracking-wide">
                      Type de piercing
                    </label>
                    <select
                      value={selectedPiercingService}
                      onChange={(e) => onPiercingServiceChange(e.target.value)}
                      className="w-full p-2.5 bg-white/[0.05] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-1 focus:ring-tertiary-400/30 transition-all"
                    >
                      <option value="">Sélectionnez un type</option>
                      {selectedZoneServices.map((service: PiercingService) => (
                        <option key={service.id} value={service.id}>
                          {getServiceZoneName(service)} -{" "}
                          {service.price
                            ? `${service.price}€`
                            : "Prix non défini"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              // Tattoo/Projet: zone, taille, style
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <TextInput
                  name="details.zone"
                  label="Zone du corps"
                  placeholder="Ex: Avant-bras droit"
                />
                <TextInput
                  name="details.size"
                  label="Taille souhaitée"
                  placeholder="Ex: 10cm x 15cm"
                />
                <TextInput
                  name="details.colorStyle"
                  label="Style et couleurs"
                  placeholder="Ex: Noir et gris"
                />
              </div>
            )}

            {/* Affichage prix du piercing */}
            {selectedService && selectedService.price && (
              <div className="p-3 bg-tertiary-500/10 border border-tertiary-500/20 rounded-lg flex items-center justify-between">
                <span className="text-white/80 text-sm font-one">
                  {getServiceZoneName(selectedService)}
                </span>
                <span className="text-tertiary-400 font-one font-semibold text-lg">
                  {selectedService.price}€
                </span>
              </div>
            )}
          </div>

          {/* Upload d'images */}
          {showImageUploaders && (
            <div className="space-y-3">
              <h3 className="text-white/90 text-sm font-one font-semibold">
                Images de référence
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs text-white/70 font-one">
                    Référence principale
                  </label>
                  <div className="bg-white/[0.02] rounded-lg p-3 border border-white/10">
                    <ImageUploader
                      file={referenceFile}
                      onFileSelect={onReferenceChange}
                      compact={true}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-white/70 font-one">
                    Croquis / Référence secondaire
                  </label>
                  <div className="bg-white/[0.02] rounded-lg p-3 border border-white/10">
                    <ImageUploader
                      file={sketchFile}
                      onFileSelect={onSketchChange}
                      compact={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message optionnel - compact */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <TextArea
          name="message"
          label="Message complémentaire (optionnel)"
          placeholder="Informations utiles : allergies, expérience précédente..."
        />
      </div>
    </Section>
  );
}
