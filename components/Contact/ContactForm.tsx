/* eslint-disable react/no-unescaped-entities */
"use client";
import emailjs from "@emailjs/browser";
import { useState, useTransition } from "react";
import {
  FaUser,
  FaEnvelope,
  FaTag,
  FaPaperPlane,
  FaCheckCircle,
} from "react-icons/fa";

export default function ContactForm() {
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    type: "",
    object: "",
    mail: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(() => {
      emailjs
        .sendForm(
          "service_vqx40jh",
          "template_wor5iln",
          e.target as HTMLFormElement,
          {
            publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
          }
        )
        .then((result) => {
          console.log(result.text);
          setForm({
            name: "",
            type: "",
            object: "",
            mail: "",
            message: "",
          });
          setConfirmationMessage("Email envoyé avec succès !");
          setTimeout(() => {
            setConfirmationMessage("");
          }, 10000);
        })
        .catch((error) => {
          console.error("Erreur lors de l'envoi:", error);
          setConfirmationMessage("Erreur lors de l'envoi. Veuillez réessayer.");
          setTimeout(() => {
            setConfirmationMessage("");
          }, 10000);
        });
    });
  };

  return (
    <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white font-two mb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-xl flex items-center justify-center">
            <FaEnvelope size={20} className="text-tertiary-400" />
          </div>
          Nous contacter
        </h2>
        <p className="text-white/70 font-one">
          Une question, une suggestion ou besoin d'aide ? N'hésitez pas à nous
          écrire.
        </p>
      </div>

      <form onSubmit={sendEmail} className="space-y-6">
        {/* Nom */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-white/90 font-one text-sm font-medium"
          >
            Nom complet *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaUser className="h-4 w-4 text-white/40" />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/20 focus:bg-white/10 transition-all duration-300 font-one"
              placeholder="Votre nom et prénom"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label
            htmlFor="mail"
            className="block text-white/90 font-one text-sm font-medium"
          >
            Adresse email *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaEnvelope className="h-4 w-4 text-white/40" />
            </div>
            <input
              type="email"
              id="mail"
              name="mail"
              value={form.mail}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/20 focus:bg-white/10 transition-all duration-300 font-one"
              placeholder="votre@email.com"
            />
          </div>
        </div>

        {/* Type de demande */}
        <div className="space-y-2">
          <label
            htmlFor="type"
            className="block text-white/90 font-one text-sm font-medium"
          >
            Type de demande *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <FaTag className="h-4 w-4 text-white/40" />
            </div>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/20 focus:bg-white/10 transition-all duration-300 font-one appearance-none cursor-pointer"
            >
              <option value="" className="bg-noir-700 text-white">
                Sélectionnez une option
              </option>
              <option
                value="question-generale"
                className="bg-noir-700 text-white"
              >
                Question générale
              </option>
              <option
                value="support-technique"
                className="bg-noir-700 text-white"
              >
                Support technique
              </option>
              <option value="partenariat" className="bg-noir-700 text-white">
                Partenariat
              </option>
              <option
                value="salon-inscription"
                className="bg-noir-700 text-white"
              >
                Inscription salon
              </option>
              <option value="signalement" className="bg-noir-700 text-white">
                Signalement
              </option>
              <option value="autre" className="bg-noir-700 text-white">
                Autre
              </option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-white/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Objet */}
        <div className="space-y-2">
          <label
            htmlFor="object"
            className="block text-white/90 font-one text-sm font-medium"
          >
            Objet du message *
          </label>
          <input
            type="text"
            id="object"
            name="object"
            value={form.object}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/20 focus:bg-white/10 transition-all duration-300 font-one"
            placeholder="Résumé de votre demande"
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label
            htmlFor="message"
            className="block text-white/90 font-one text-sm font-medium"
          >
            Votre message *
          </label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/20 focus:bg-white/10 transition-all duration-300 font-one resize-vertical"
            placeholder="Décrivez votre demande en détail..."
          />
        </div>

        {/* Bouton d'envoi */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending}
            className={`cursor-pointer w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-one font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] shadow-lg ${
              isPending
                ? "bg-white/10 cursor-not-allowed opacity-50"
                : "bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 shadow-tertiary-500/25 hover:shadow-tertiary-500/40"
            }`}
          >
            {isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <FaPaperPlane size={16} />
                Envoyer le message
              </>
            )}
          </button>
        </div>

        {/* Message de confirmation */}
        {confirmationMessage && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
              confirmationMessage.includes("succès")
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}
          >
            <FaCheckCircle size={16} />
            <span className="font-one text-sm">{confirmationMessage}</span>
          </div>
        )}
      </form>

      {/* Note en bas */}
      <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <p className="text-white/60 font-one text-xs leading-relaxed">
          <strong className="text-white/80">Note :</strong> Nous nous engageons
          à répondre à votre message dans les plus brefs délais, généralement
          sous 24-48h ouvrées. Les champs marqués d'un astérisque (*) sont
          obligatoires.
        </p>
      </div>
    </div>
  );
}
