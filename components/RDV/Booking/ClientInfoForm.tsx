import React from "react";
import { UserRound, PenTool, Images, MessageSquare, Check, ChevronDown } from "lucide-react";
import Image from "next/image";
import AppButton from "@/components/Shared/AppButton";
import Section from "./Section";
import { getPiercingServiceLabel } from "./getPiercingServiceLabel";
import TextInput from "./TextInput";
import TextArea from "./TextArea";
import SkinToneSelect from "./SkinToneSelect";
import ImageUploader from "../../Shared/ImageUploader";
import { FlashProps, PiercingZone } from "@/lib/type";
import { BookingMoodboardOption, SkinToneOption } from "./types";

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
  flashes?: FlashProps[];
  selectedFlashId?: string;
  onFlashChange?: (flashId: string) => void;
  skinToneOptions?: SkinToneOption[];
  isLoadingSkinTones?: boolean;
  moodboards?: BookingMoodboardOption[];
  selectedMoodboardId?: string;
  onMoodboardChange?: (moodboardId: string) => void;
  isAuthenticated?: boolean;
  isLoadingMoodboards?: boolean;
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
  flashes = [],
  selectedFlashId = "",
  onFlashChange,
  skinToneOptions = [],
  isLoadingSkinTones = false,
  moodboards = [],
  selectedMoodboardId = "",
  onMoodboardChange,
  isAuthenticated = false,
  isLoadingMoodboards = false,
}: ClientInfoFormProps) {
  const selectedZone = piercingZones.find((z) => z.id === selectedPiercingZone);
  const selectedZoneServices = selectedZone?.services || [];
  const selectedService = selectedZoneServices.find(
    (s) => s.id === selectedPiercingService,
  );

  const getFlashDimensions = (flash?: FlashProps): string => {
    if (!flash) return "";

    const raw = flash.dimension || flash.dimensions || flash.size;
    if (typeof raw === "string" && raw.trim()) return raw.trim();

    if (typeof flash.width === "number" && typeof flash.height === "number") {
      const unit = (flash.unit || "cm").trim();
      return `${flash.width} x ${flash.height} ${unit}`;
    }

    return "";
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

  const showFlashSelector = prestation === "TATTOO";
  const showSkinToneField =
    prestation === "PROJET" ||
    prestation === "TATTOO" ||
    prestation === "RETOUCHE";
  const selectedFlash = flashes.find((f) => f.id === selectedFlashId);
  const hasSelectedFlash = showFlashSelector && !!selectedFlashId;

  return (
    <div className="space-y-4">
      {showProjectDetails && (
        <Section title={prestation === "PIERCING" ? "Choisissez votre piercing" : prestation === "TATTOO" ? "Le dessin qui vous ressemble" : "Parlez-nous de votre idée"}
          description={prestation === "TATTOO" ? "La réservation d’un tatouage se fait à partir des flashs disponibles du salon." : "Quelques détails pour aider votre artiste à préparer votre rendez-vous."} icon={<PenTool size={17} />}>
          <div className="space-y-5">
            {showFlashSelector && (
              <fieldset>
                <legend className="mb-3 text-xs text-white/70">Choisissez un flash <span className="text-tertiary-400">*</span></legend>
                {flashes.length ? <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto p-0.5 sm:grid-cols-3 xl:grid-cols-4">
                  {flashes.map(flash => {
                    const active = flash.id === selectedFlashId;
                    return <button key={flash.id} type="button" aria-pressed={active} onClick={() => onFlashChange?.(active ? "" : flash.id)} className={`group relative overflow-hidden rounded-xl border text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/50 ${active ? "border-tertiary-400/60 bg-tertiary-400/5" : "border-white/10 bg-noir-700/50 hover:border-white/30"}`}>
                      <div className="relative aspect-[3/2] overflow-hidden bg-white/3">
                        {flash.imageUrl ? <Image src={flash.imageUrl} alt={flash.title || flash.name || "Flash"} fill sizes="(max-width: 640px) 45vw, (max-width: 1280px) 25vw, 160px" className="object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transform-none" /> : <span className="absolute inset-0 grid place-items-center text-white/20"><PenTool size={24} /></span>}
                        <span className={`absolute right-2 top-2 flex size-5 items-center justify-center rounded-full border ${active ? "border-tertiary-400 bg-tertiary-400 text-noir-700" : "border-white/40 bg-black/30"}`}>{active && <Check size={12} />}</span>
                      </div>
                      <div className="space-y-1 p-2"><p className="truncate text-xs font-medium text-white/90">{flash.title || flash.name || "Flash"}</p><div className="flex flex-wrap justify-between gap-1 text-[10px] text-white/45"><span>{getFlashDimensions(flash) || "Dimensions à préciser"}</span>{typeof flash.price === "number" && <span className="font-medium text-tertiary-400">{flash.price} €</span>}</div></div>
                    </button>;
                  })}
                </div> : <div role="status" className="rounded-xl border border-white/10 bg-white/3 p-4 text-xs leading-6 text-white/55">Aucun flash disponible pour le moment. Contactez le salon pour préparer votre projet.</div>}
                {selectedFlash && <p className="mt-3 flex items-center gap-1.5 text-[11px] text-tertiary-400"><Check size={12} />{selectedFlash.title || selectedFlash.name || "Flash"} sélectionné · Cliquez à nouveau pour le désélectionner.</p>}
              </fieldset>
            )}

            {prestation === "PIERCING" ? <div className="space-y-4">
              <fieldset><legend className="mb-2 text-xs text-white/70">Zone du piercing <span className="text-tertiary-400">*</span></legend>
                {isLoadingPiercingZones ? <p role="status" className="text-xs text-white/45">Chargement des zones…</p> : piercingZones.length ? <div className="flex flex-wrap gap-2">{piercingZones.map(zone => <button key={zone.id} type="button" aria-pressed={zone.id === selectedPiercingZone} onClick={() => { onPiercingZoneChange(zone.id); onPiercingServiceChange(""); }} className={`rounded-xl border px-3.5 py-2.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/40 ${zone.id === selectedPiercingZone ? "border-tertiary-400/50 bg-tertiary-400/8 text-white" : "border-white/10 bg-noir-700/60 text-white/60 hover:border-white/25"}`}>{zone.piercingZone}</button>)}</div> : <p className="text-xs text-white/45">Aucune zone disponible. Contactez le salon.</p>}
              </fieldset>
              {selectedPiercingZone && <fieldset><legend className="mb-2 text-xs text-white/70">Type de piercing <span className="text-tertiary-400">*</span></legend><div className="grid gap-2 sm:grid-cols-2">{selectedZoneServices.map(service => <button key={service.id} type="button" aria-pressed={service.id === selectedPiercingService} onClick={() => onPiercingServiceChange(service.id)} className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/40 ${service.id === selectedPiercingService ? "border-tertiary-400/50 bg-tertiary-400/8 text-white" : "border-white/10 bg-noir-700/60 text-white/65 hover:border-white/25"}`}><span>{getPiercingServiceLabel(service, selectedZone?.piercingZone)}</span><span className="shrink-0 text-tertiary-400">{typeof service.price === "number" ? service.price + " €" : "Sur demande"}</span></button>)}</div>{!selectedZoneServices.length && <p className="text-xs text-white/45">Aucune prestation disponible pour cette zone.</p>}</fieldset>}
              {selectedService && <p className="flex items-center gap-2 rounded-lg bg-tertiary-400/5 px-3 py-2 text-[11px] text-white/65"><Check size={13} className="text-tertiary-400" />{getPiercingServiceLabel(selectedService, selectedZone?.piercingZone)}{typeof selectedService.price === "number" && <span className="ml-auto text-tertiary-400">{selectedService.price} €</span>}</p>}
            </div> : <>
              {!hasSelectedFlash && <TextArea name="details.description" label="Votre idée en quelques mots" placeholder="Le style qui vous plaît, l’histoire du projet, vos inspirations…" />}
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput name="details.zone" label="Emplacement sur le corps" placeholder="Ex. : avant-bras droit" />
                <TextInput name="details.size" label="Dimensions souhaitées" placeholder="Ex. : 10 × 15 cm" />
              </div>
              {!hasSelectedFlash && <TextInput name="details.colorStyle" label="Style et couleurs" placeholder="Ex. : floral, noir et gris…" />}
            </>}
            {showSkinToneField && <SkinToneSelect name="details.skin" label="Votre teinte de peau" options={skinToneOptions} errors={errors} loading={isLoadingSkinTones} helperText="Cette information aide l’artiste à préparer votre séance." />}

          </div>
        </Section>
      )}

      <Section title="Relier un moodboard" description="Partagez vos inspirations avec le salon. Ce moodboard sera associé à votre rendez-vous." icon={<Images size={17} />}>
        {isAuthenticated ? isLoadingMoodboards ? <p role="status" className="text-xs text-white/45">Chargement de vos moodboards…</p> : moodboards.length ? <div className="space-y-3">
          <label htmlFor="booking-moodboard" className="block text-xs text-white/65">Votre moodboard <span className="ml-1 text-[10px] text-white/35">Facultatif</span></label>
          <select id="booking-moodboard" value={selectedMoodboardId} onChange={event => onMoodboardChange?.(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-noir-700 px-3 text-sm text-white outline-none focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 [color-scheme:dark]"><option value="">Ne pas associer de moodboard</option>{moodboards.map(board => <option key={board.id} value={board.id}>{board.name}</option>)}</select>
          {selectedMoodboardId && <div className="flex items-start gap-2 rounded-xl border border-tertiary-400/20 bg-tertiary-400/5 p-3"><Check size={14} className="mt-0.5 shrink-0 text-tertiary-400" /><div><p className="text-xs text-white/80">{moodboards.find(board => board.id === selectedMoodboardId)?.name}</p><p className="mt-1 text-[11px] leading-5 text-white/45">Le salon pourra consulter vos inspirations depuis le rendez-vous.</p></div></div>}
        </div> : <p className="text-xs leading-6 text-white/45">Vous n’avez pas encore de moodboard. Vous pouvez continuer sans en associer.</p> : <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs leading-6 text-white/45">Connectez-vous pour retrouver et partager vos moodboards.</p><AppButton href="/se-connecter" variant="secondary" className="px-3! py-2! text-xs! shadow-none!">Se connecter</AppButton></div>}
        {showImageUploaders && !hasSelectedFlash && <div className="mt-5 border-t border-white/8 pt-4">
          <div className="mb-3 flex items-center gap-2"><Images size={15} className="text-tertiary-400" /><h3 className="text-xs font-medium text-white/75">Ajouter des images d’inspiration</h3><span className="ml-auto text-[10px] text-white/30">Facultatif</span></div>
          <p className="mb-4 text-xs leading-6 text-white/45">Pas de moodboard ? Vous pouvez ajouter jusqu’à deux images d’inspiration pour partager vos idées avec le salon.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><p className="mb-2 text-[11px] text-white/50">Première inspiration</p><ImageUploader file={referenceFile} onFileSelect={onReferenceChange} compact /></div>
            <div><p className="mb-2 text-[11px] text-white/50">Seconde inspiration</p><ImageUploader file={sketchFile} onFileSelect={onSketchChange} compact /></div>
          </div>
        </div>}

      </Section>

      <Section title="Comment vous contacter ?" description="Le salon utilisera ces informations pour votre rendez-vous. Les champs marqués d’un * sont obligatoires." icon={<UserRound size={17} />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput name="client.firstName" label="Prénom" placeholder="Votre prénom" required autoComplete="given-name" />
          <TextInput name="client.lastName" label="Nom" placeholder="Votre nom" required autoComplete="family-name" />
          <TextInput name="client.email" label="Adresse email" placeholder="vous@exemple.fr" type="email" required autoComplete="email" />
          <TextInput name="client.phone" label="Téléphone" placeholder="06 12 34 56 78" type="tel" required autoComplete="tel" />
          <TextInput name="client.birthDate" label="Date de naissance" type="date" required autoComplete="bday" />
        </div>
        {isAuthenticated && <p className="mt-4 flex items-center gap-2 text-[11px] text-white/40"><Check size={12} className="text-tertiary-400" />Vos coordonnées sont préremplies depuis votre profil. Vous pouvez les ajuster.</p>}
      </Section>

      <details className="group rounded-2xl border border-white/8 bg-white/[0.02]">
        <summary className="flex cursor-pointer list-none items-center gap-2.5 p-4 text-xs text-white/65 [&::-webkit-details-marker]:hidden"><MessageSquare size={15} className="text-white/40" />Une précision à ajouter ?<span className="ml-auto text-[10px] text-white/30">Facultatif</span><ChevronDown size={14} className="transition-transform group-open:rotate-180" /></summary>
        <div className="space-y-4 border-t border-white/8 p-4"><TextArea name="message" label="Votre message au salon" placeholder="Une question, une contrainte ou une information utile pour votre séance…" />

        </div>
      </details>
    </div>
  );
}