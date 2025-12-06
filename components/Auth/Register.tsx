/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { registerAction } from "@/lib/actions/auth.action";

import { FormError } from "@/components/Shared/FormError";
import { FormSuccess } from "@/components/Shared/FormSuccess";
import { CardWrapper } from "./Wrapper/CardWrapper";

// Schema de validation pour l'inscription client
const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères")
      .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
    lastName: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(50, "Le nom ne peut pas dépasser 50 caractères"),
    email: z.string().email("Veuillez entrer un email valide").toLowerCase(),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
      ),
    confirmPassword: z.string(),
    birthDate: z.string().optional(),
    acceptTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        "Vous devez accepter les conditions d'utilisation"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      birthDate: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setError("");
    setSuccess("");
    setIsPending(true);

    console.log("Données du formulaire d'inscription :", data);

    try {
      // Passer directement l'objet typé Zod à l'action serveur
      await registerAction({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        birthDate: data.birthDate,
      });

      setSuccess("Inscription réussie ! Redirection...");
      form.reset();
    } catch (error) {
      console.error("Erreur inscription:", error);
      setError(
        error instanceof Error ? error.message : "Erreur lors de l'inscription"
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <CardWrapper headerLabel="Créez votre compte client - Inkera">
        <form
          method="post"
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative text-white"
        >
          <div className="flex flex-col gap-2">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 font-one">
                <label htmlFor="firstName" className="text-xs">
                  Prénom *
                </label>
                <input
                  id="firstName"
                  placeholder="Votre prénom"
                  type="text"
                  required
                  className="bg-white/30 py-2 px-4 rounded-lg text-sm"
                  {...form.register("firstName")}
                />
                {form.formState.errors.firstName && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1 font-one">
                <label htmlFor="lastName" className="text-xs">
                  Nom *
                </label>
                <input
                  id="lastName"
                  placeholder="Votre nom"
                  type="text"
                  required
                  className="bg-white/30 py-2 px-4 rounded-lg text-sm"
                  {...form.register("lastName")}
                />
                {form.formState.errors.lastName && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1 font-one">
              <label htmlFor="email" className="text-xs">
                Email *
              </label>
              <input
                id="email"
                placeholder="votre.email@exemple.com"
                type="email"
                required
                className="bg-white/30 py-2 px-4 rounded-lg text-sm"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Date de naissance */}
            <div className="flex flex-col gap-1 font-one">
              <label htmlFor="birthDate" className="text-xs">
                Date de naissance
              </label>
              <input
                id="birthDate"
                type="date"
                className="bg-white/30 py-2 px-4 rounded-lg text-sm"
                {...form.register("birthDate")}
              />
              {form.formState.errors.birthDate && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.birthDate.message}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="flex flex-col gap-1 font-one">
              <label htmlFor="password" className="text-xs">
                Mot de passe *
              </label>
              <div className="relative">
                <input
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  required
                  className="bg-white/30 py-2 px-4 pr-10 rounded-lg text-sm w-full"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Confirmation mot de passe */}
            <div className="flex flex-col gap-1 font-one">
              <label htmlFor="confirmPassword" className="text-xs">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  placeholder="••••••••"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="bg-white/30 py-2 px-4 pr-10 rounded-lg text-sm w-full"
                  {...form.register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Acceptation des conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptTerms"
                {...form.register("acceptTerms")}
                className="w-4 h-4 mt-0.5 text-tertiary-500 focus:ring-tertiary-400 bg-transparent border-white/30 rounded"
              />
              <label
                htmlFor="acceptTerms"
                className="text-xs text-white/80 font-one leading-relaxed"
              >
                J'accepte les{" "}
                <Link
                  href="/conditions-utilisation"
                  className="text-tertiary-400 hover:text-tertiary-300 underline"
                >
                  conditions d'utilisation
                </Link>{" "}
                et la{" "}
                <Link
                  href="/politique-confidentialite"
                  className="text-tertiary-400 hover:text-tertiary-300 underline"
                >
                  politique de confidentialité
                </Link>
              </label>
            </div>
            {form.formState.errors.acceptTerms && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.acceptTerms.message}
              </p>
            )}

            <FormError message={error} />
            <FormSuccess message={success} />

            {/* Bouton de soumission */}
            <button
              className="cursor-pointer px-8 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one lg:text-xs"
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Inscription en cours..." : "Créer mon compte"}
            </button>
          </div>
        </form>
      </CardWrapper>

      <div className="relative flex flex-col gap-2 justify-center items-center">
        <p className="text-white text-xs text-center font-two mt-2">
          Vous avez déjà un compte ?{" "}
          <Link
            className="text-tertiary-400 hover:text-tertiary-500 transition-all ease-in-out duration-150"
            href="/connexion"
          >
            Se connecter
          </Link>
        </p>
        {/* <div className="h-[1px] bg-white w-[300px]"></div> */}
        {/* <Link
          className="text-white text-xs text-center font-two mt-2 hover:text-white/70 transition-all ease-in-out duration-150"
          href="/"
        >
          Retour à l'accueil
        </Link> */}
      </div>
    </div>
  );
}
