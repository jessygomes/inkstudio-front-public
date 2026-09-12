"use client";

import AppButton from "@/components/Shared/AppButton";
import { ArrowLeft, Check, LoaderCircle, Save } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import type { updateProfileSchema } from "@/lib/zod/validator-schema";
import SalonImageUploader from "@/components/Shared/ImageProfileUpload";

type Values = z.infer<typeof updateProfileSchema>;
type Field = { name: keyof Values; label: string; type?: string; autoComplete: string; required?: boolean };
const sections: { title: string; description: string; fields: Field[] }[] = [
  { title: "Identité", description: "Les informations qui vous présentent.", fields: [
    { name: "firstName", label: "Prénom", autoComplete: "given-name", required: true },
    { name: "lastName", label: "Nom", autoComplete: "family-name", required: true },
    { name: "pseudo", label: "Pseudo", autoComplete: "nickname" },
    { name: "birthDate", label: "Date de naissance", type: "date", autoComplete: "bday" },
  ] },
  { title: "Coordonnées", description: "Les informations utiles pour vos échanges avec les salons.", fields: [
    { name: "email", label: "Adresse e-mail", type: "email", autoComplete: "email", required: true },
    { name: "phone", label: "Téléphone", type: "tel", autoComplete: "tel" },
    { name: "city", label: "Ville", autoComplete: "address-level2" },
    { name: "postalCode", label: "Code postal", autoComplete: "postal-code" },
  ] },
];

export default function ProfileEditorForm({ form, onSubmit, isSubmitting, onCancel }: {
  form: UseFormReturn<Values>;
  onSubmit: (values: Values) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isDirty } } = form;
  return (
    <div className="mx-auto px-4 py-8 font-one sm:px-6 sm:py-10 lg:px-20">
      <header className="border-b border-white/10 pb-7 pt-5 sm:pb-9">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-tertiary-400">Mon espace Inkera</p>
        <div className="flex items-center justify-between gap-4">
          <h1 className="min-w-0 font-two text-2xl font-semibold tracking-tight text-white sm:text-4xl">Modifier mon profil</h1>
          <AppButton href="/mon-profil" variant="secondary" icon={<ArrowLeft size={16} aria-hidden="true" />} className="min-h-11 shrink-0 max-sm:px-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400">
            Retour au profil
          </AppButton>
        </div>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">Personnalisez votre profil et mettez à jour vos informations pour vos prochains rendez-vous.</p>
      </header>
      <form noValidate onSubmit={handleSubmit(onSubmit)} aria-busy={isSubmitting}>
        <fieldset disabled={isSubmitting} className="grid min-w-0 gap-8 py-8 disabled:opacity-70 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14 lg:py-10">
          <div className="min-w-0">
            <h2 className="text-base font-medium text-white">Photo de profil</h2>
            <p className="mb-5 mt-2 text-sm leading-6 text-white/55">Ajoutez une touche personnelle à votre espace.</p>
            <SalonImageUploader compact currentImage={watch("image") || undefined}
              onImageUpload={(url) => setValue("image", url, { shouldDirty: true, shouldValidate: true })}
              onImageRemove={() => setValue("image", "", { shouldDirty: true, shouldValidate: true })} />
          </div>
          <div className="min-w-0 space-y-8 lg:border-l lg:border-white/10 lg:pl-14">
            {sections.map((section, index) => (
              <section key={section.title} aria-labelledby={`editor-section-${index}`} className={index ? "border-t border-white/10 pt-8" : ""}>
                <div className="mb-6 flex items-start gap-3">
                  <span aria-hidden="true" className="pt-1 text-xs text-tertiary-400">0{index + 1}</span>
                  <div>
                    <h2 id={`editor-section-${index}`} className="font-two text-xl font-medium text-white">{section.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-white/55">{section.description}</p>
                  </div>
                </div>
                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  {section.fields.map((field) => {
                    const error = errors[field.name];
                    return (
                      <div key={field.name} className="min-w-0">
                        <label htmlFor={field.name} className="mb-2 flex items-center justify-between gap-2 text-sm text-white/85">
                          {field.label}<span className="text-xs text-white/45">{field.required ? "Requis" : "Facultatif"}</span>
                        </label>
                        <input id={field.name} type={field.type || "text"} autoComplete={field.autoComplete}
                          aria-required={field.required} aria-invalid={!!error} aria-describedby={error ? `${field.name}-error` : undefined}
                          maxLength={field.name === "postalCode" ? 5 : undefined} {...register(field.name)}
                          className={`min-h-12 w-full min-w-0 rounded-lg border bg-noir-700 px-3.5 py-3 text-base text-white outline-none transition-colors [color-scheme:dark] focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/15 sm:text-sm ${error ? "border-red-400/70" : "border-white/15 hover:border-white/30"}`} />
                        {error && <p id={`${field.name}-error`} role="alert" className="mt-2 text-xs text-red-300">{error.message}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </fieldset>
        <footer className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-white/10 bg-noir-700/95 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <p role="status" className="flex items-center gap-2 text-xs text-white/60 sm:text-sm">
            {isSubmitting ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : !isDirty ? <Check size={15} aria-hidden="true" /> : <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-tertiary-400" />}
            {isSubmitting ? "Enregistrement en cours…" : isDirty ? "Modifications non enregistrées" : "Aucune modification en attente"}
          </p>
          <div className="flex gap-3">
            <AppButton type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting} className="min-h-11 cursor-pointer max-sm:px-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400">Annuler</AppButton>
            <AppButton type="submit" disabled={isSubmitting || !isDirty} icon={isSubmitting ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />} className="min-h-11 flex-1 cursor-pointer max-sm:px-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400 sm:flex-none">
              {isSubmitting ? "Enregistrement…" : "Enregistrer"}
            </AppButton>
          </div>
        </footer>
      </form>
    </div>
  );
}
