import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Check, ChevronDown, Images, PenLine, UserRound } from "lucide-react";
import FilterSelect from "@/components/Shared/FilterSelect";
import TextInput from "./TextInput";
import TextArea from "./TextArea";
import SkinToneSelect from "./SkinToneSelect";
import ProjectPreferences from "./ProjectPreferences";
import InspirationUpload from "./InspirationUpload";
import { BookingMoodboardOption, SkinToneOption } from "./types";
import { focusRing, iconBadge, inset, label as labelClass, surface } from "./ui";

interface ClientInfoFormProps {
  prestation: string;
  hasSelectedFlash: boolean;
  sketchFile: File | null;
  referenceFile: File | null;
  onSketchChange: (file: File | null) => void;
  onReferenceChange: (file: File | null) => void;
  skinToneOptions?: SkinToneOption[];
  isLoadingSkinTones?: boolean;
  moodboards?: BookingMoodboardOption[];
  selectedMoodboardId?: string;
  onMoodboardChange?: (moodboardId: string) => void;
  isAuthenticated?: boolean;
  isLoadingMoodboards?: boolean;
}

const CONTACT_FIELDS = ["firstName", "lastName", "email", "phone", "birthDate"] as const;

function CardTitle({ icon, title, hint }: { icon: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span aria-hidden="true" className={iconBadge}>{icon}</span>
      <div><h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>{hint && <p className="mt-0.5 text-xs leading-5 text-white/45">{hint}</p>}</div>
    </div>
  );
}

export default function ClientInfoForm({
  prestation,
  hasSelectedFlash,
  sketchFile,
  referenceFile,
  onSketchChange,
  onReferenceChange,
  skinToneOptions = [],
  isLoadingSkinTones = false,
  moodboards = [],
  selectedMoodboardId = "",
  onMoodboardChange,
  isAuthenticated = false,
  isLoadingMoodboards = false,
}: ClientInfoFormProps) {
  const { watch, getFieldState, formState } = useFormContext();
  const client = watch("client") ?? {};
  const contactComplete = CONTACT_FIELDS.every(field => typeof client[field] === "string" && client[field].trim());
  const contactHasError = CONTACT_FIELDS.some(field => getFieldState(`client.${field}`, formState).invalid);
  const [editContact, setEditContact] = useState(false);
  // Client connecté avec un profil complet : un résumé suffit, la modification reste possible.
  const showContactFields = !isAuthenticated || editContact || !contactComplete || contactHasError;

  const needsSkin = prestation === "PROJET" || prestation === "TATTOO" || prestation === "RETOUCHE";
  const canAddImages = (prestation === "PROJET" || prestation === "RETOUCHE" || prestation === "TATTOO") && !hasSelectedFlash;
  const hasExtras = !!selectedMoodboardId || !!sketchFile || !!referenceFile || !!watch("message");

  return (
    <div className="space-y-4 font-one">
      {prestation !== "PIERCING" && (
        <section className={surface}>
          <CardTitle icon={<PenLine size={17} />} title={prestation === "PROJET" ? "Votre idée" : prestation === "RETOUCHE" ? "Votre retouche" : "Pour préparer votre séance"} hint={prestation === "PROJET" ? "Quelques mots suffisent, vous en parlerez en détail avec l’artiste." : undefined} />
          <div className="space-y-5">
            {prestation === "PROJET" && <TextArea name="details.description" label="Décrivez votre projet" placeholder="Le motif, le style, ce qu’il représente pour vous…" />}
            {prestation === "RETOUCHE" && <TextArea name="details.description" label="Quel tatouage souhaitez-vous retoucher ?" placeholder="Son emplacement, ce que vous aimeriez corriger ou raviver…" />}
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput name="details.zone" label="Où sur le corps ?" placeholder="Ex. : avant-bras droit" />
              {prestation === "PROJET" && <TextInput name="details.size" label="Taille approximative" placeholder="Ex. : 10 × 15 cm" />}
            </div>
            {needsSkin && <div className="pt-2"><SkinToneSelect name="details.skin" label="Votre teinte de peau" options={skinToneOptions} loading={isLoadingSkinTones} helperText="Elle aide l’artiste à adapter les encres." /></div>}
          </div>
        </section>
      )}

      {prestation === "PROJET" && <section className={surface}><ProjectPreferences /></section>}

      <section className={surface}>
        <CardTitle icon={<UserRound size={17} />} title="Vos coordonnées" hint={showContactFields ? "Pour que le salon puisse vous confirmer le rendez-vous." : undefined} />
        {showContactFields ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput name="client.firstName" label="Prénom" placeholder="Votre prénom" required autoComplete="given-name" />
            <TextInput name="client.lastName" label="Nom" placeholder="Votre nom" required autoComplete="family-name" />
            <TextInput name="client.email" label="Email" placeholder="vous@exemple.fr" type="email" required autoComplete="email" />
            <TextInput name="client.phone" label="Téléphone" placeholder="06 12 34 56 78" type="tel" required autoComplete="tel" />
            <TextInput name="client.birthDate" label="Date de naissance" type="date" required autoComplete="bday" />
          </div>
        ) : (
          <div className={`flex flex-wrap items-center justify-between gap-3 ${inset} p-4`}>
            <div className="flex min-w-0 items-center gap-3">
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-tertiary-400 to-tertiary-500 text-noir-900"><Check size={15} strokeWidth={3} /></span>
              <div className="min-w-0 text-xs leading-5">
                <p className="font-medium text-white">{client.firstName} {client.lastName}</p>
                <p className="truncate text-white/50">{client.email} · {client.phone}</p>
              </div>
            </div>
            <button type="button" onClick={() => setEditContact(true)} className={`rounded-xl bg-white/6 px-3.5 py-1.5 text-xs text-white/80 transition hover:bg-white/10 hover:text-white ${focusRing}`}>Modifier</button>
          </div>
        )}
      </section>

      <details open={hasExtras || undefined} className="group rounded-3xl bg-noir-500">
        <summary className={`flex cursor-pointer list-none items-center gap-3 rounded-3xl p-5 text-sm text-white/85 sm:px-6 [&::-webkit-details-marker]:hidden ${focusRing}`}>
          <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/6 text-white/60"><Images size={17} /></span>
          <span className="flex-1"><span className="block font-semibold text-white">Inspirations et message</span><span className="block text-xs text-white/40">Facultatif · images, moodboard, mot pour le salon</span></span>
          <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-white/5 text-white/60 transition-transform group-open:rotate-180"><ChevronDown size={16} /></span>
        </summary>
        <div className="space-y-6 px-5 pb-6 sm:px-6">
          {isAuthenticated && (
            isLoadingMoodboards ? <p role="status" className="text-xs text-white/45">Chargement de vos moodboards…</p> : moodboards.length > 0 && (
              <div>
                <p className={labelClass}>Joindre un de vos moodboards</p>
                <FilterSelect label="Joindre un moodboard" placeholder="Aucun moodboard" unit="moodboard" icon={<Images size={14} />} selected={selectedMoodboardId ? [selectedMoodboardId] : []} options={moodboards.map(board => ({ value: board.id, label: board.name }))} multiple={false} onApply={values => onMoodboardChange?.(values[0] || "")} align="left"
                  buttonClassName="flex h-12 w-full min-w-0 items-center gap-2 rounded-2xl bg-white/5 px-4 text-left text-sm text-white/80 outline-none transition hover:bg-white/7 focus-visible:ring-2 focus-visible:ring-tertiary-400/40" />
              </div>
            )
          )}
          {canAddImages && (
            <div>
              <p className={labelClass}>Images d’inspiration <span className="font-normal text-white/35">(2 maximum)</span></p>
              <div className="grid gap-3 sm:grid-cols-2">
                <InspirationUpload file={referenceFile} onChange={onReferenceChange} label="Image de référence" />
                <InspirationUpload file={sketchFile} onChange={onSketchChange} label="Croquis ou 2ᵉ image" />
              </div>
            </div>
          )}
          <TextArea name="message" label="Un message pour le salon" placeholder="Une question, une contrainte, une précision…" />
        </div>
      </details>
    </div>
  );
}
