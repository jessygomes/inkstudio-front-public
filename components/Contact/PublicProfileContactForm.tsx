"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { ArrowUpRight, CheckCircle2, LoaderCircle, Mail, MessageSquare, ChevronDown } from "lucide-react";
import { sendPublicProfileContact } from "@/lib/actions/user.action";
import AppButton from "@/components/Shared/AppButton";
import { useSession } from "next-auth/react";
import StartInkeraConversationButton from "./StartInkeraConversationButton";

type PublicProfileContactFormProps = {
  targetUserId: string;
  recipientName: string;
  messagingEnabled?: boolean;
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
  messagingEnabled = false,
}: PublicProfileContactFormProps) {
  const id = useId();
  const { data: session, status } = useSession();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const openFromHash = () => { if (window.location.hash === "#contact") setExpanded(true); };
    const onContactLink = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor) return;
      const url = new URL(anchor.href);
      if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.hash === "#contact") setExpanded(true);
    };
    const initialFrame = window.requestAnimationFrame(openFromHash);
    window.addEventListener("hashchange", openFromHash);
    document.addEventListener("click", onContactLink);
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener("hashchange", openFromHash);
      document.removeEventListener("click", onContactLink);
    };
  }, []);
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

  const fieldClass = "w-full min-h-11 rounded-xl border border-white/10 bg-noir-700 px-3.5 py-2.5 font-one text-sm text-white placeholder:text-white/25 outline-none transition hover:border-white/20 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-60 [color-scheme:dark]";
  const labelClass = "mb-2 block text-xs font-medium text-white/65";

  return (
    <section aria-labelledby={`${id}-heading`} className="overflow-hidden rounded-2xl border border-white/10 bg-noir-700 font-one">
      <div className="flex flex-wrap items-center gap-3 bg-white/[0.015] p-4">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-tertiary-400/10 text-tertiary-400"><MessageSquare size={16} aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[9px] uppercase tracking-[0.16em] text-tertiary-400/80">Un premier échange</p>
          <h2 id={`${id}-heading`} className="break-words text-sm font-medium text-white/90">Contacter {recipientName}</h2>
          <p className="mt-1 text-[11px] leading-5 text-white/45">Une idée en tête ? Parlez-nous de votre projet.</p>
        </div>
        <AppButton type="button" variant="secondary" aria-expanded={expanded} aria-controls={id + "-content"} onClick={() => setExpanded(value => !value)} className="px-3! py-2! text-xs! shadow-none!">{expanded ? "Réduire" : "Écrire un message"}<ChevronDown size={14} className={expanded ? "rotate-180 transition-transform" : "transition-transform"} /></AppButton>
      </div>

      <div id={id + "-content"} hidden={!expanded} className="border-t border-white/8">
        {messagingEnabled && (status === "unauthenticated" || session?.user?.role === "client") && <aside className="mx-4 mt-4 rounded-xl border border-tertiary-400/20 bg-linear-to-br from-tertiary-400/8 to-tertiary-500/5 p-3.5">
          <div className="flex items-start gap-2.5"><MessageSquare size={16} className="mt-0.5 shrink-0 text-tertiary-400" aria-hidden="true" /><div className="min-w-0"><h3 className="text-xs font-medium text-white/85">Échangez directement via la messagerie Inkera</h3><p className="mt-1 text-[11px] leading-5 text-white/55">{status === "authenticated" ? "Retrouvez vos messages et les réponses du professionnel dans votre compte Inkera." : "Créez un compte client gratuit ou connectez-vous pour échanger directement avec " + recipientName + " et retrouver toutes vos conversations dans la messagerie Inkera."}</p></div></div>
          <div className="mt-3 flex flex-wrap gap-2">{status === "authenticated" ? <StartInkeraConversationButton targetUserId={targetUserId} recipientName={recipientName} variant="compact" className="min-h-9! px-3! py-2! text-xs! shadow-none!" /> : <><AppButton href="/creer-un-compte" className="px-3! py-2! text-xs! shadow-none!">Créer un compte gratuit</AppButton><AppButton href="/se-connecter" variant="secondary" className="px-3! py-2! text-xs! shadow-none!">Se connecter</AppButton></>}</div>
        </aside>}
      {feedback && !isError ? (
        <div className="p-4 sm:p-5">
          <div role="status" className="flex items-start gap-3">
            <CheckCircle2 size={24} className="shrink-0 text-emerald-400" />
            <div><h3 className="text-lg text-white">Votre message a bien été envoyé</h3><p className="mt-2 text-sm leading-6 text-white/65">{recipientName} pourra vous répondre à l’adresse email indiquée.</p></div>
          </div>
          <AppButton type="button" variant="secondary" onClick={() => setFeedback("")} className="mt-5 px-4! text-xs! shadow-none!">Envoyer un autre message</AppButton>
        </div>
      ) : (
        <form onSubmit={onSubmit} aria-busy={isPending} className="p-4">
          <div className="grid gap-3">
            <fieldset disabled={isPending} className="min-w-0 space-y-3 rounded-xl border border-white/8 bg-white/[0.015] p-3 sm:p-4">
              <legend className="mb-0 flex items-center gap-2 px-2 text-xs font-medium text-white/85"><span className="grid h-6 w-6 place-items-center rounded-lg bg-linear-to-r from-tertiary-400 to-tertiary-500 text-[10px] text-white">1</span>Vos coordonnées</legend>
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
            <fieldset disabled={isPending} className="min-w-0 space-y-3 rounded-xl border border-white/8 bg-white/[0.015] p-3 sm:p-4">
              <legend className="mb-0 flex items-center gap-2 px-2 text-xs font-medium text-white/85"><span className="grid h-6 w-6 place-items-center rounded-lg bg-linear-to-r from-tertiary-400 to-tertiary-500 text-[10px] text-white">2</span>Votre projet</legend>
              <div>
                <label htmlFor={`${id}-bodyPart`} className={labelClass}>Zone du corps</label>
                <select id={`${id}-bodyPart`} name="bodyPart" value={form.bodyPart} onChange={handleChange} required className={fieldClass}>
                  <option value="" disabled>Sélectionnez une zone</option>
                  {BODY_PART_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor={`${id}-project`} className={labelClass}>Décrivez votre idée</label>
                <textarea id={`${id}-project`} name="projectDescription" value={form.projectDescription} onChange={handleChange} required rows={3} className={`${fieldClass} resize-y`} placeholder="Le motif, le style, la taille envisagée… Partagez les détails qui vous tiennent à cœur." />
              </div>
            </fieldset>
          </div>
          {feedback && isError && <p role="alert" className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">{feedback} Votre saisie est conservée, vous pouvez réessayer.</p>}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-noir-700 p-3">
            <p className="text-xs text-white/45">Tous les champs sont requis.</p>
            <AppButton type="submit" variant="primary" disabled={isPending} className="min-h-10! px-4! text-xs! shadow-none! cursor-pointer">
              {isPending ? <LoaderCircle size={16} className="motion-safe:animate-spin" aria-hidden="true" /> : <ArrowUpRight size={17} aria-hidden="true" />}
              {isPending ? "Envoi en cours…" : "Envoyer mon projet"}
            </AppButton>
          </div>
        </form>
      )}
      </div>
    </section>
  );
}
