"use client";

import AppButton from "@/components/Shared/AppButton";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Camera, Check, ContactRound, LoaderCircle, Mail, Save, UserRound } from "lucide-react";
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
  const [photoBusy, setPhotoBusy] = useState(false);
  const name = [watch("firstName"), watch("lastName")].filter(Boolean).join(" ") || "Votre profil";
  return (
    <div className="mx-auto px-4 py-6 font-one sm:px-6 lg:px-8 xl:px-12 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-tertiary-400 [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-tertiary-400">
      <header className="mb-6">
        <nav aria-label="Fil d’Ariane" className="mb-3 flex items-center gap-2 text-[11px] text-white/40"><Link href="/mon-profil" className="rounded transition hover:text-white">Mon profil</Link><span aria-hidden="true" className="text-white/20">/</span><span aria-current="page">Modification</span></nav>
        <div className="flex items-start gap-3">
          <Link href="/mon-profil" aria-label="Retour au profil" title="Retour au profil" className="grid size-10 shrink-0 place-items-center rounded-xl text-white/50 transition hover:bg-white/5 hover:text-white"><ArrowLeft size={20} aria-hidden="true" /></Link>
          <div className="min-w-0"><h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Modifier mon profil</h1><p className="mt-2 max-w-2xl text-xs leading-6 text-white/45 sm:text-sm">Personnalisez votre espace et gardez vos informations à jour pour vos échanges avec les salons.</p></div>
        </div>
      </header>
      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[220px_minmax(0,1fr)] xl:gap-6">
        <aside className="min-w-0 rounded-2xl border border-white/10 bg-noir-700 p-2 xl:sticky xl:top-24 xl:p-4">
          <p className="mb-3 hidden px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35 xl:block">Dans votre profil</p>
          <nav aria-label="Sections du formulaire" className="grid grid-cols-3 gap-1 xl:grid-cols-1">
            {[
              { id: "profile-photo", label: "Photo", hint: "Votre image de profil", icon: Camera },
              { id: "editor-section-0", label: "Identité", hint: "Vos informations personnelles", icon: UserRound },
              { id: "editor-section-1", label: "Coordonnées", hint: "Vos moyens de contact", icon: ContactRound },
            ].map(section => <a key={section.id} href={`#${section.id}`} className="flex min-h-11 min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-1 py-2 text-white/60 transition hover:bg-white/5 hover:text-white sm:flex-row sm:gap-2.5 sm:px-2 xl:justify-start xl:py-3"><section.icon size={15} aria-hidden="true" className="shrink-0 text-tertiary-400" /><span className="min-w-0"><span className="block text-center text-[11px] font-medium xl:text-left">{section.label}</span><span className="mt-1 hidden text-[10px] leading-4 text-white/30 xl:block">{section.hint}</span></span></a>)}
          </nav>
          <div className="mt-5 hidden space-y-2 border-t border-white/8 px-2 pt-5 xl:block"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">En un coup d’œil</p><p className="break-words text-sm font-medium text-white/85">{name}</p><p className="break-all text-[11px] text-white/40">{watch("email") || "Email à renseigner"}</p></div>
        </aside>
        <form noValidate onSubmit={handleSubmit(async values => { if (!photoBusy) await onSubmit(values); })} aria-busy={isSubmitting || photoBusy} className="min-w-0 space-y-4">
        <fieldset disabled={isSubmitting} className="min-w-0 space-y-4 disabled:opacity-70">
          <section id="profile-photo" aria-labelledby="profile-photo-title" className="scroll-mt-24 rounded-2xl border border-white/10 bg-noir-700 p-4 sm:p-6">
            <div className="mb-5 flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl border border-tertiary-400/20 bg-tertiary-400/10 text-tertiary-400"><Camera size={17} aria-hidden="true" /></span><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">01 · Votre image</p><h2 id="profile-photo-title" className="mt-1 text-sm font-semibold tracking-tight text-white sm:text-base">Photo de profil</h2><p className="mt-1 font-two text-[11px] leading-relaxed text-white/40">Ajoutez une touche personnelle à votre espace.</p></div></div>
            <SalonImageUploader compact currentImage={watch("image") || undefined} disabled={isSubmitting} onBusyChange={setPhotoBusy}
                onImageUpload={url => setValue("image", url, { shouldDirty: true, shouldValidate: true })}
                onImageRemove={() => setValue("image", "", { shouldDirty: true, shouldValidate: true })} />
            {errors.image && <p role="alert" className="mt-2 text-[11px] text-red-300">{errors.image.message}</p>}
          </section>
            {sections.map((section, index) => (
              <section key={section.title} id={`editor-section-${index}`} aria-labelledby={`editor-section-title-${index}`} className="scroll-mt-24 rounded-2xl border border-white/10 bg-noir-700 p-4 sm:p-6">
                <div className="mb-5 flex items-start gap-3">
                  <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-xl border border-tertiary-400/20 bg-tertiary-400/10 text-tertiary-400">{index === 0 ? <UserRound size={17} /> : <Mail size={17} />}</span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">0{index + 2} · {index === 0 ? "Informations personnelles" : "Contact"}</p>
                    <h2 id={`editor-section-title-${index}`} className="mt-1 text-sm font-semibold tracking-tight text-white sm:text-base">{section.title}</h2>
                    <p className="mt-1 font-two text-[11px] leading-relaxed text-white/40">{section.description}</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {section.fields.map((field) => {
                    const error = errors[field.name];
                    return (
                      <div key={field.name} className="min-w-0">
                        <label htmlFor={field.name} className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-white/60">
                          {field.label}{field.required && <span aria-hidden="true" className="text-tertiary-400">*</span>}
                        </label>
                        <input id={field.name} type={field.type || "text"} autoComplete={field.autoComplete}
                          aria-required={field.required} aria-invalid={!!error} aria-describedby={error ? `${field.name}-error` : undefined}
                          maxLength={field.name === "postalCode" ? 5 : undefined} {...register(field.name)}
                          className={`min-h-11 w-full min-w-0 rounded-xl border bg-noir-700 px-3.5 py-2.5 font-two text-sm text-white outline-none transition [color-scheme:dark] focus:border-tertiary-400/45 focus:bg-noir-700 focus:ring-2 focus:ring-tertiary-400/10 ${error ? "border-red-400/70" : "border-white/10 hover:border-white/20"}`} />
                        {error && <p id={`${field.name}-error`} role="alert" className="mt-1 text-[10px] text-red-300">{error.message}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
        </fieldset>
        <p className="text-[10px] text-white/35"><span className="text-tertiary-400">*</span> Champs obligatoires</p>
        <footer className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-noir-700/95 p-3 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-4">
          <p role="status" className="flex items-center gap-2 text-[11px] text-white/40">
            {isSubmitting || photoBusy ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : !isDirty ? <Check size={15} aria-hidden="true" /> : <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-tertiary-400" />}
            {photoBusy ? "Ajout de la photo en cours…" : isSubmitting ? "Enregistrement en cours…" : isDirty ? "Modifications non enregistrées" : "Aucune modification en attente"}
          </p>
          <div className="ml-auto flex w-full gap-2 sm:w-auto">
            <AppButton type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting || photoBusy} className="min-h-11 flex-1 cursor-pointer !px-4 !text-xs sm:flex-none">Annuler</AppButton>
            <AppButton type="submit" disabled={isSubmitting || photoBusy || !isDirty} icon={isSubmitting ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <Save size={14} aria-hidden="true" />} className="min-h-11 flex-1 cursor-pointer !px-4 !text-xs !shadow-none sm:flex-none">
              {isSubmitting ? "Enregistrement…" : "Enregistrer"}
            </AppButton>
          </div>
        </footer>
      </form>
      </div>
    </div>
  );
}
