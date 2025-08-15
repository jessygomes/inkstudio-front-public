/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentRequestSchema } from "@/lib/zod/validator-schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toSlug } from "@/lib/utils";
import ImageUploader from "../Shared/ImageUploader";
import { uploadFiles } from "@/lib/utils/uploadthing";
import imageCompression from "browser-image-compression";

// --- Types
type Tatoueur = {
  id: string;
  name: string;
  img?: string | null;
  instagram?: string | null;
};

type SalonSummary = {
  id: string; // = userId du salon
  name: string;
  image?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  tatoueurs?: Tatoueur[] | null;
  prestations: string[];
};

type Props = {
  salon: SalonSummary; // salon courant (obligatoire)
  apiBase?: string; // override si besoin
  defaultTatoueurId?: string | null; // préférence optionnelle
};

// --- Utils
const classNames = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const frFmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    ...opts,
  }).format(d);

type AppointmentRequestForm = z.infer<typeof appointmentRequestSchema>;

// --- UI helpers
const StepBadge = ({ n, active }: { n: number; active: boolean }) => (
  <div
    className={
      "w-6 h-6 rounded-full grid place-items-center text-[11px] font-one border " +
      (active
        ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white border-tertiary-400/50 shadow"
        : "bg-white/5 text-white/70 border-white/15")
    }
  >
    {n}
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 sm:p-5">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-white/95 font-one text-xs tracking-[0.22em] uppercase">
        {title}
      </h2>
    </div>
    {children}
  </div>
);

// --- Composant principal
export default function BookingFlow({
  salon,
  apiBase,
  defaultTatoueurId,
}: Props) {
  const BACK = apiBase || process.env.NEXT_PUBLIC_BACK_URL || "";

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
      client: { firstName: "", lastName: "", email: "", phone: "" },
      details: {},
      message: "",
    },
  });

  const {
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const router = useRouter();

  // Étapes
  const steps = ["Prestation", "Disponibilité", "Vos infos", "Récap"];
  const [step, setStep] = useState(1);
  const [confirmDisabled, setConfirmDisabled] = useState(false);

  const prestation = watch("prestation");
  const artists = useMemo(() => salon.tatoueurs ?? [], [salon.tatoueurs]);

  useEffect(() => {
    if (defaultTatoueurId) setValue("tatoueurId", defaultTatoueurId);
  }, [defaultTatoueurId, setValue]);

  const goNext = async () => {
    const fieldsByStep: Record<
      number,
      (keyof AppointmentRequestForm | string)[]
    > = {
      1: ["prestation"],
      2: ["availability.date", "availability.from", "availability.to"],
      3: ["client.firstName", "client.lastName", "client.email"],
      4: [],
    };
    const ok = await trigger(fieldsByStep[step] as any);
    if (!ok) return;
    if (step === 3) {
      setStep(4);
      setConfirmDisabled(true);
      setTimeout(() => setConfirmDisabled(false), 3000);
    } else {
      setStep((s) => Math.min(4, s + 1));
    }
  };
  const goPrev = () => setStep((s) => Math.max(1, s - 1));

  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);

  // Submit → POST /appointment-request
  const onSubmit = async (data: AppointmentRequestForm) => {
    // Upload images si fichiers présents (avec compression)
    let sketchUrl = "";
    let referenceUrl = "";

    if (sketchFile) {
      const compressedSketch = await imageCompression(sketchFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.8,
      });
      const res = await uploadFiles("imageUploader", {
        files: [compressedSketch],
      });
      sketchUrl = res?.[0]?.url || "";
    }
    if (referenceFile) {
      const compressedReference = await imageCompression(referenceFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.8,
      });
      const res = await uploadFiles("imageUploader", {
        files: [compressedReference],
      });
      referenceUrl = res?.[0]?.url || "";
    }

    // availability en JSON string (conforme à ta table)
    const availabilityPayload = {
      primary: {
        date: data.availability.date,
        from: data.availability.from,
        to: data.availability.to,
      },
      alternative:
        data.availability.alt &&
        data.availability.alt.date &&
        data.availability.alt.from &&
        data.availability.alt.to
          ? {
              date: data.availability.alt.date,
              from: data.availability.alt.from,
              to: data.availability.alt.to,
            }
          : null,
      preferredTatoueurId: data.tatoueurId || null,
    };

    const detailsPayload = {
      description: data.details.description,
      zone: data.details.zone,
      size: data.details.size,
      colorStyle: data.details.colorStyle,
      ...(sketchUrl && { sketch: sketchUrl }),
      ...(referenceUrl && { reference: referenceUrl }),
    };

    const body = {
      userId: salon.id, // salon concerné
      prestation: data.prestation,
      clientFirstname: data.client.firstName,
      clientLastname: data.client.lastName,
      clientEmail: data.client.email,
      clientPhone: data.client.phone || undefined,
      availability: JSON.stringify(availabilityPayload),
      details: JSON.stringify(detailsPayload),
      message: data.message || undefined,
    };

    const res = await fetch(`${BACK}/appointments/appointment-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok || (json && json.error)) {
      throw new Error(json?.message || "Échec de l’envoi de la demande");
    }
    return json;
  };

  //! Construire une URL à 2 segments lisibles et uniques
  const nameSlug = toSlug(salon.name || "salon");
  const locSource = [salon.city, salon.postalCode] // city-75001
    .filter((v) => typeof v === "string" && v.trim() !== "")
    .join("-");
  const locSlug = toSlug(locSource) || "localisation";
  const salonHref = `/salon/${nameSlug}/${locSlug}`;

  //! FORMS
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(async (data) => {
          try {
            await onSubmit(data);
            toast.success("Demande envoyée avec succès !");
            router.push(salonHref);
          } catch (e: any) {
            toast.error(e?.message || "Erreur serveur");
          }
        })}
        className="w-full"
      >
        {/* Header étapes */}
        <div className="mb-4 flex items-center gap-2">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <StepBadge n={i + 1} active={step === i + 1 || step > i + 1} />
              <span
                className={classNames(
                  "hidden sm:block text-[11px] font-one",
                  step >= i + 1 ? "text-white/90" : "text-white/50"
                )}
              >
                {label}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={classNames(
                    "w-6 sm:w-12 h-[1px]",
                    step > i + 1 ? "bg-tertiary-400/60" : "bg-white/15"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Étape 1 : Prestation (+ préférence artiste optionnelle) */}
        {step === 1 && (
          <Section title="Choisir la prestation">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(salon.prestations || []).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    methods.setValue("prestation", p as any, {
                      shouldValidate: true,
                    })
                  }
                  className={classNames(
                    "cursor-pointer rounded-xl border px-3 py-3 text-sm font-one transition",
                    prestation === p
                      ? "border-tertiary-500/50 bg-tertiary-500/10 shadow"
                      : "border-white/10 bg-white/[0.06] hover:bg-white/[0.1]"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Préférence artiste (facultatif) */}
            {artists.length > 0 && (
              <div className="mt-4">
                <label className="text-xs text-white/70 font-one">
                  Préférence d’artiste (optionnel)
                </label>
                <select
                  className="mt-1 w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                  value={watch("tatoueurId") || ""}
                  onChange={(e) =>
                    methods.setValue("tatoueurId", e.target.value)
                  }
                >
                  <option value="">Aucune préférence</option>
                  {artists.map((a) => (
                    <option key={a.id} value={a.id} className="bg-noir-500">
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(errors as any).prestation && (
              <p className="mt-2 text-xs text-red-300">
                {String((errors as any).prestation?.message)}
              </p>
            )}
          </Section>
        )}

        {/* Étape 2 : Disponibilité (jour + plage horaire) */}
        {step === 2 && (
          <Section title="Indiquer votre disponibilité">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FieldDate
                name="availability.date"
                label="Jour souhaité"
                helper={(val) =>
                  val
                    ? frFmt(new Date(val + "T12:00:00"), {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })
                    : "—"
                }
                errors={errors}
              />
              <FieldTime name="availability.from" label="De" errors={errors} />
              <FieldTime name="availability.to" label="À" errors={errors} />
            </div>

            {/* Alternative optionnelle */}
            <AltAvailability />

            {/* Erreurs globales éventuelles */}
            {(errors as any).availability?.to && (
              <p className="mt-2 text-xs text-red-300">
                {String((errors as any).availability?.to?.message)}
              </p>
            )}
            {(errors as any).availability?.alt && (
              <p className="mt-2 text-xs text-red-300">
                {String((errors as any).availability?.alt?.message)}
              </p>
            )}
          </Section>
        )}

        {/* Étape 3 : Infos client & détails */}
        {step === 3 && (
          <Section title="Vos informations">
            {/* Infos client : toujours affiché */}
            <div className="grid grid-cols-4 gap-4">
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
              <TextInput
                name="client.email"
                label="Email"
                placeholder="marie@email.fr"
                errors={errors}
              />
              <TextInput
                name="client.phone"
                label="Téléphone (optionnel)"
                placeholder="06 12 34 56 78"
                errors={errors}
              />
            </div>

            {/* Champs conditionnels selon la prestation */}
            {(prestation === "PROJET" ||
              prestation === "TATTOO" ||
              prestation === "RETOUCHE" ||
              prestation === "PIERCING") && (
              <div className="mt-2">
                <TextArea
                  name="details.description"
                  label="Description"
                  placeholder="Explique ton projet (taille, style, contraintes...)"
                />
              </div>
            )}

            {(prestation === "PROJET" ||
              prestation === "TATTOO" ||
              prestation === "RETOUCHE" ||
              prestation === "PIERCING") && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <TextInput
                  name="details.zone"
                  label="Zone du corps"
                  placeholder="Avant-bras droit"
                />
                {(prestation === "PROJET" ||
                  prestation === "TATTOO" ||
                  prestation === "RETOUCHE") && (
                  <>
                    <TextInput
                      name="details.size"
                      label="Taille"
                      placeholder="20cm x 30cm"
                    />
                    <TextInput
                      name="details.colorStyle"
                      label="Style/Couleur"
                      placeholder="Blackwork, rouge/noir"
                    />
                  </>
                )}
              </div>
            )}

            {(prestation === "PROJET" ||
              prestation === "TATTOO" ||
              prestation === "RETOUCHE") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <label className="text-xs text-white/70 font-one">
                    Image de référence 1
                  </label>
                  <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                    <ImageUploader
                      file={referenceFile}
                      onFileSelect={setReferenceFile}
                      compact={true}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-white/70 font-one">
                    Croquis / Référence 2
                  </label>
                  <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                    <ImageUploader
                      file={sketchFile}
                      onFileSelect={setSketchFile}
                      compact={true}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Message : toujours affiché */}
            <div className="mt-4">
              <TextArea
                name="message"
                label="Message (optionnel)"
                placeholder="Ajoute une précision utile pour le salon…"
              />
            </div>
          </Section>
        )}

        {/* Étape 4 : Récap */}
        {step === 4 && (
          <Section title="Récapitulatif">
            <Recap salon={salon} />
            <div className="mt-4 text-[11px] text-white/50 font-one">
              En validant, votre demande est envoyée au salon. Il vous proposera
              un créneau final.
            </div>
          </Section>
        )}

        {/* Footer navigation */}
        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 1}
            className="cursor-pointer px-4 py-2 rounded-lg text-xs font-one border border-white/15 text-white/90 bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition"
          >
            Retour
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={goNext}
              className="cursor-pointer px-5 py-2 rounded-lg text-xs font-one bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white transition"
            >
              Continuer
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || confirmDisabled}
              className="cursor-pointer px-6 py-2 rounded-lg text-xs font-one bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white transition disabled:opacity-60"
            >
              {isSubmitting
                ? "Envoi…"
                : confirmDisabled
                ? "Veuillez patienter…"
                : "Confirmer la demande"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

/* =========================
   Champs & sous-composants
   ========================= */

function FieldDate({
  name,
  label,
  helper,
  errors,
}: {
  name: any;
  label: string;
  helper?: (val?: string) => React.ReactNode;
  errors?: any;
}) {
  const { register, watch } = useFormContext();
  const val = watch(name);
  const rootKey = Array.isArray(name) ? name[0] : String(name).split(".")[0];
  const err = errors?.[rootKey];
  return (
    <div className="space-y-1">
      <label className="text-xs text-white/70 font-one">{label}</label>
      <input
        type="date"
        {...register(name)}
        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
      />
      {helper && (
        <p className="text-[11px] text-white/50 mt-1">{helper(val)}</p>
      )}
      {err && <p className="text-red-300 text-xs">{String(err?.message)}</p>}
    </div>
  );
}

function FieldTime({
  name,
  label,
  errors,
}: {
  name: any;
  label: string;
  errors?: any;
}) {
  const { register } = useFormContext();
  const rootKey = Array.isArray(name) ? name[0] : String(name).split(".")[0];
  const err = errors?.[rootKey];
  return (
    <div className="space-y-1">
      <label className="text-xs text-white/70 font-one">{label}</label>
      <input
        type="time"
        {...register(name)}
        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
      />
      {err && <p className="text-red-300 text-xs">{String(err?.message)}</p>}
    </div>
  );
}

function AltAvailability() {
  const { watch, setValue } = useFormContext<AppointmentRequestForm>();
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (!enabled) {
      setValue("availability.alt", { date: "", from: "", to: "" });
    }
  }, [enabled, setValue]);

  return (
    <div className="mt-4 rounded-lg border border-white/10 p-3 bg-white/[0.04]">
      <label className="flex items-center gap-2 text-xs text-white/75">
        <input
          type="checkbox"
          className="accent-tertiary-400"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        Proposer aussi une disponibilité alternative
      </label>

      {enabled && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FieldDate
            name="availability.alt.date"
            label="Jour (alt.)"
            errors={{}}
          />
          <FieldTime
            name="availability.alt.from"
            label="De (alt.)"
            errors={{}}
          />
          <FieldTime name="availability.alt.to" label="À (alt.)" errors={{}} />
        </div>
      )}
    </div>
  );
}

function TextInput({
  name,
  label,
  placeholder,
  type = "text",
  errors,
}: {
  name: any;
  label: string;
  placeholder?: string;
  type?: string;
  errors?: any;
}) {
  const { register } = useFormContext();
  const rootKey = Array.isArray(name) ? name[0] : String(name).split(".")[0];
  const err = errors?.[rootKey];
  return (
    <div className="space-y-1">
      <label className="text-xs text-white/70 font-one">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
      />
      {err && <p className="text-red-300 text-xs">{String(err?.message)}</p>}
    </div>
  );
}

function TextArea({
  name,
  label,
  placeholder,
}: {
  name: any;
  label: string;
  placeholder?: string;
}) {
  const { register } = useFormContext();
  return (
    <div className="space-y-1">
      <label className="text-xs text-white/70 font-one">{label}</label>
      <textarea
        rows={4}
        placeholder={placeholder}
        {...register(name)}
        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors resize-y placeholder-white/50"
      />
    </div>
  );
}

function Row({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: React.ReactNode;
  multiline?: boolean;
}) {
  return (
    <div className="grid sm:grid-cols-[160px_1fr] gap-2">
      <div className="text-white/60 text-xs font-one uppercase tracking-wider">
        {label}
      </div>
      <div
        className={classNames(
          "text-white/90 text-sm",
          multiline && "whitespace-pre-wrap"
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Recap({ salon }: { salon: SalonSummary }) {
  const { watch } = useFormContext<AppointmentRequestForm>();
  const avail = watch("availability");
  const prestation = watch("prestation");
  const client = watch("client");
  const details = watch("details");

  // Helper pour afficher une image si présente
  const RecapImage = ({ url, label }: { url?: string; label: string }) =>
    url ? (
      <div className="flex flex-col items-start gap-1">
        <span className="text-xs text-white/60 font-one">{label}</span>
        <div className="w-40 h-40 rounded-lg overflow-hidden border border-white/10 bg-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={label}
            className="object-contain w-full h-full"
            style={{ background: "#222" }}
          />
        </div>
      </div>
    ) : null;

  return (
    <div className="grid gap-5 text-sm">
      {/* Salon & prestation */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="text-xs text-white/60 font-one mb-2">Salon</div>
          <div className="text-white/90 font-one font-semibold">
            {salon.name}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-xs text-white/60 font-one mb-2">Prestation</div>
          <div className="text-white/90 font-one">{prestation || "—"}</div>
        </div>
      </div>

      {/* Disponibilité */}
      <div>
        <div className="text-xs text-white/60 font-one mb-2">
          Mes disponibilités
        </div>
        <div className="flex items-center gap-4">
          <div className="text-white/90 font-one">
            <b>
              {avail.date
                ? frFmt(new Date(avail.date + "T12:00:00"), {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </b>{" "}
            — {avail.from || "—"} à {avail.to || "—"}
          </div>
          {avail.alt?.date && avail.alt?.from && avail.alt?.to && (
            <div className="text-white/70 font-one">
              Alternative :{" "}
              <b>
                {frFmt(new Date(avail.alt.date + "T12:00:00"), {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </b>{" "}
              — {avail.alt.from} à {avail.alt.to}
            </div>
          )}
        </div>
      </div>

      {/* Infos client */}
      <div>
        <div className="text-xs text-white/60 font-one mb-2">Mes infos</div>
        <div className="bg-white/5 p-4 border border-white/10 rounded-xl">
          <div className="text-white/90 font-one grid grid-cols-3">
            <div>
              <p className="text-xs text-white/60 font-one">Nom</p>
              <p>
                {client.firstName} {client.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/60 font-one">Email</p>
              <p>{client.email}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 font-one">Téléphone</p>
              <p>{client.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Détails projet/tatouage */}
      {(details?.description ||
        details?.zone ||
        details?.size ||
        details?.colorStyle ||
        details?.sketch ||
        details?.reference) && (
        <div className="">
          <div className="text-xs text-white/60 font-one mb-2">Détails</div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                {details?.description && (
                  <div>
                    <span className="text-xs text-white/60 font-one">
                      Description
                    </span>
                    <div className="text-white/90 font-one">
                      {details.description}
                    </div>
                  </div>
                )}
                {details?.zone && (
                  <div>
                    <span className="text-xs text-white/60 font-one">
                      Zone du corps
                    </span>
                    <div className="text-white/90 font-one">{details.zone}</div>
                  </div>
                )}
                {details?.size && (
                  <div>
                    <span className="text-xs text-white/60 font-one">
                      Taille
                    </span>
                    <div className="text-white/90 font-one">{details.size}</div>
                  </div>
                )}
                {details?.colorStyle && (
                  <div>
                    <span className="text-xs text-white/60 font-one">
                      Style/Couleur
                    </span>
                    <div className="text-white/90 font-one">
                      {details.colorStyle}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-4">
                <RecapImage
                  url={details?.reference}
                  label="Image de référence"
                />
                <RecapImage url={details?.sketch} label="Croquis" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {watch("message") && (
        <div>
          <div className="text-xs text-white/60 font-one mb-2">Message</div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-white/90 font-one whitespace-pre-wrap">
              {watch("message")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
