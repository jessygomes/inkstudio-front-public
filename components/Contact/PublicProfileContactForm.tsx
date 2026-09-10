"use client";

import { useId, useState, useTransition } from "react";
import { ArrowUpRight, CheckCircle2, LoaderCircle, Mail, MessageSquare } from "lucide-react";
import { sendPublicProfileContact } from "@/lib/actions/user.action";
import AppButton from "@/components/Shared/AppButton";

type PublicProfileContactFormProps = {
  targetUserId: string;
  recipientName: string;
};

type FormState = {
  firstName: string;
  lastName: string;
  bodyPart: string;
  projectDescription: string;
  email: string;
};

const BODY_PART_OPTIONS = [
  "Avant-bras",
  "Biceps",
  "Épaule",
  "Poignet",
  "Main",
  "Cou",
  "Torse",
  "Côte",
  "Dos",
  "Cuisse",
  "Mollet",
  "Cheville",
  "Pied",
  "Tête",
  "Fesse",
  "Autres",
] as const;

const INITIAL_STATE: FormState = {
  firstName: "",
  lastName: "",
  bodyPart: "",
  projectDescription: "",
  email: "",
};

export default function PublicProfileContactForm({
  targetUserId,
  recipientName,
}: PublicProfileContactFormProps) {
  const id = useId();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [feedback, setFeedback] = useState<string>("");
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;

    setFeedback("");
    setIsError(false);

    startTransition(async () => {
      const result = await sendPublicProfileContact(targetUserId, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        bodyPart: form.bodyPart,
        projectDescription: form.projectDescription.trim(),
        email: form.email.trim(),
      });

      if (!result.ok) {
        setIsError(true);
        setFeedback(result.message || "Envoi impossible pour le moment.");
        return;
      }

      setIsError(false);
      setFeedback(result.message || "Votre message a été envoyé avec succès.");
      setForm(INITIAL_STATE);
    });
  };

  const fieldClass = "w-full min-h-11 rounded-xl border border-white/15 bg-noir-700 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-tertiary-400 focus:ring-1 focus:ring-tertiary-400 disabled:opacity-60";
  const labelClass = "mb-2 block text-sm text-white/80";

  return (
    <section aria-labelledby={`${id}-heading`} className="overflow-hidden rounded-2xl border border-white/10 bg-noir-500 font-one">
      <div className="flex items-start gap-3 border-b border-white/10 px-5 py-5 sm:px-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-tertiary-400/10 text-tertiary-400"><MessageSquare size={20} aria-hidden="true" /></span>
        <div className="min-w-0">
          <h2 id={`${id}-heading`} className="break-words text-lg text-white sm:text-xl">Contacter {recipientName}</h2>
          <p className="mt-1 text-sm leading-relaxed text-white/60">Une idée en tête ? Parlez-nous de votre projet.</p>
        </div>
      </div>

      {feedback && !isError ? (
        <div className="p-6 sm:p-8">
          <div role="status" className="flex items-start gap-3">
            <CheckCircle2 size={24} className="shrink-0 text-emerald-400" />
            <div><h3 className="text-lg text-white">Votre message a bien été envoyé</h3><p className="mt-2 text-sm leading-6 text-white/65">{recipientName} pourra vous répondre à l’adresse email indiquée.</p></div>
          </div>
          <button type="button" onClick={() => setFeedback("")} className="mt-5 min-h-11 cursor-pointer rounded-xl border border-white/15 px-4 text-sm text-white/80 transition hover:bg-white/5">Envoyer un autre message</button>
        </div>
      ) : (
        <form onSubmit={onSubmit} aria-busy={isPending} className="p-5 sm:p-6">
          <div className="grid gap-6 xl:grid-cols-2 xl:gap-8">
            <fieldset disabled={isPending} className="min-w-0 space-y-4">
              <legend className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><span className="grid h-6 w-6 place-items-center rounded-full bg-white/8 text-xs text-white/60">1</span>Vos coordonnées</legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div><label htmlFor={`${id}-firstName`} className={labelClass}>Prénom</label><input id={`${id}-firstName`} name="firstName" autoComplete="given-name" value={form.firstName} onChange={handleChange} required className={fieldClass} placeholder="Votre prénom" /></div>
                <div><label htmlFor={`${id}-lastName`} className={labelClass}>Nom</label><input id={`${id}-lastName`} name="lastName" autoComplete="family-name" value={form.lastName} onChange={handleChange} required className={fieldClass} placeholder="Votre nom" /></div>
              </div>
              <div>
                <label htmlFor={`${id}-email`} className={labelClass}>Adresse email</label>
                <input id={`${id}-email`} name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required aria-describedby={`${id}-email-help`} className={fieldClass} placeholder="vous@exemple.fr" />
                <p id={`${id}-email-help`} className="mt-2 flex items-center gap-1.5 text-xs leading-5 text-white/50"><Mail size={13} aria-hidden="true" />Le salon vous répondra à cette adresse.</p>
              </div>
            </fieldset>
            <fieldset disabled={isPending} className="min-w-0 space-y-4">
              <legend className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><span className="grid h-6 w-6 place-items-center rounded-full bg-white/8 text-xs text-white/60">2</span>Votre projet</legend>
              <div>
                <label htmlFor={`${id}-bodyPart`} className={labelClass}>Zone du corps</label>
                <select id={`${id}-bodyPart`} name="bodyPart" value={form.bodyPart} onChange={handleChange} required className={fieldClass}>
                  <option value="" disabled>Sélectionnez une zone</option>
                  {BODY_PART_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor={`${id}-project`} className={labelClass}>Décrivez votre idée</label>
                <textarea id={`${id}-project`} name="projectDescription" value={form.projectDescription} onChange={handleChange} required rows={4} className={`${fieldClass} resize-y`} placeholder="Le motif, le style, la taille envisagée… Partagez les détails qui vous tiennent à cœur." />
              </div>
            </fieldset>
          </div>
          {feedback && isError && <p role="alert" className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">{feedback} Votre saisie est conservée, vous pouvez réessayer.</p>}
          <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/45">Tous les champs sont requis.</p>
            <AppButton type="submit" variant="primary" disabled={isPending} className="min-h-11 cursor-pointer">
              {isPending ? <LoaderCircle size={16} className="motion-safe:animate-spin" aria-hidden="true" /> : <ArrowUpRight size={17} aria-hidden="true" />}
              {isPending ? "Envoi en cours…" : "Envoyer mon projet"}
            </AppButton>
          </div>
        </form>
      )}
    </section>
  );
}
