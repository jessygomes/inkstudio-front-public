"use client";

import { useState, useTransition } from "react";
import { sendPublicProfileContact } from "@/lib/actions/user.action";

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

  return (
    <section className="rounded-3xl border border-white/10 bg-linear-to-br from-noir-500 to-noir-700 p-6 backdrop-blur-lg shadow-xl">
      <div className="mb-5">
        <h3 className="text-white/95 font-one text-sm tracking-wider uppercase">
          Contacter {recipientName}
        </h3>
        <p className="mt-2 text-white/70 text-sm font-one">
          Écris ton projet pour être recontacté rapidement par email.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="firstName"
              className="mb-1.5 block text-xs uppercase tracking-wide text-white/70 font-one"
            >
              Prénom
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={form.firstName}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white font-one outline-none focus:border-tertiary-400/60"
              placeholder="Ton prénom"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="mb-1.5 block text-xs uppercase tracking-wide text-white/70 font-one"
            >
              Nom
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={form.lastName}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white font-one outline-none focus:border-tertiary-400/60"
              placeholder="Ton nom"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs uppercase tracking-wide text-white/70 font-one"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white font-one outline-none focus:border-tertiary-400/60"
            placeholder="ton.email@exemple.com"
          />
        </div>

        <div>
          <label
            htmlFor="bodyPart"
            className="mb-1.5 block text-xs uppercase tracking-wide text-white/70 font-one"
          >
            Partie du corps
          </label>
          <select
            id="bodyPart"
            name="bodyPart"
            value={form.bodyPart}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-white/15 bg-noir-700 px-3 py-2.5 text-sm text-white font-one outline-none focus:border-tertiary-400/60"
          >
            <option value="">Selectionne une zone</option>
            {BODY_PART_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="projectDescription"
            className="mb-1.5 block text-xs uppercase tracking-wide text-white/70 font-one"
          >
            Description du projet
          </label>
          <textarea
            id="projectDescription"
            name="projectDescription"
            value={form.projectDescription}
            onChange={handleChange}
            required
            rows={5}
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white font-one outline-none focus:border-tertiary-400/60"
            placeholder="Explique ton idee, la taille, le style, les contraintes, etc."
          />
        </div>

        {feedback && (
          <p
            className={`text-sm font-one ${
              isError ? "text-red-300" : "text-emerald-300"
            }`}
          >
            {feedback}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="cursor-pointer inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-tertiary-400 to-tertiary-500 px-5 py-2.5 text-sm font-one text-white transition-opacity disabled:opacity-60"
        >
          {isPending ? "Envoi..." : "Envoyer le message"}
        </button>
      </form>
    </section>
  );
}
