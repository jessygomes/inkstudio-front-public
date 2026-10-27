"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";
import AuthField from "./AuthField";
import AuthFeedback from "./AuthFeedback";
import AuthGoogleButton from "./AuthGoogleButton";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { parseRateLimit } from "../../lib/auth-rate-limit";

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
        "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre",
      ),
    confirmPassword: z.string(),
    birthDate: z.string().optional(),
    website: z.string().max(0).optional(),
    acceptTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        "Vous devez accepter les conditions d'utilisation",
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [hasRateLimitError, setHasRateLimitError] = useState(false);
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
      website: "",
      acceptTerms: false,
    },
  });

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const intervalId = window.setInterval(() => {
      setCooldownSeconds(previous => Math.max(0, previous - 1));
      if (cooldownSeconds <= 1 && hasRateLimitError) {
        setError("");
        setHasRateLimitError(false);
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [cooldownSeconds, hasRateLimitError]);

  const onSubmit = async (data: RegisterForm) => {
    if (cooldownSeconds > 0) {
      return;
    }

    if (data.website?.trim()) {
      setError("Impossible de finaliser l'inscription. Veuillez réessayer.");
      return;
    }

    setError("");
    setSuccess("");
    setHasRateLimitError(false);
    setIsPending(true);

    try {
      // Appel à l'API pour l'inscription
      const registerResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/auth/register_client`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            birthDate: data.birthDate || null,
          }),
        },
      );

      const rateLimit = await parseRateLimit(registerResponse);

      if (rateLimit.isRateLimited) {
        setCooldownSeconds(rateLimit.retryAfterSeconds);
        setHasRateLimitError(true);
        setError(rateLimit.message);
        return;
      }

      const registerData = await registerResponse.json().catch(() => null);

      if (!registerResponse.ok || registerData?.error) {
        throw new Error(
          registerData?.message || "Échec de l'inscription. Veuillez réessayer.",
        );
      }

      setSuccess("Inscription réussie ! Connexion...");
      form.reset();

      // Auto-login après inscription
      const loginResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!loginResult?.ok) {
        setSuccess("Inscription réussie ! Redirection vers la connexion...");
        setTimeout(() => {
          router.push("/se-connecter");
        }, 2000);
        return;
      }

      setSuccess("Inscription réussie ! Redirection vers l'app...");
      router.push("/");
    } catch (error) {
      console.error("Erreur inscription:", error);
      setError(
        error instanceof Error ? error.message : "Erreur lors de l'inscription",
      );
    } finally {
      setIsPending(false);
    }
  };

  const isBlocked = cooldownSeconds > 0;

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccess("");
    setIsGooglePending(true);

    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (err) {
      console.error("Erreur Google:", err);
      setError("Impossible de continuer avec Google pour le moment.");
      setIsGooglePending(false);
    }
  };

  const busy = isPending || isGooglePending;

  return (
    <div className="font-one">
      <div className="mb-6"><p className="text-[10px] uppercase tracking-[0.18em] text-tertiary-400">Compte client · Gratuit</p><h1 className="mt-3 font-two text-3xl font-medium tracking-tight text-white">Faites place à vos idées.</h1><p className="mt-3 text-sm leading-7 text-white/55">Créez votre compte pour garder vos inspirations et échanger avec les artistes.</p></div>
      <div className="mb-5"><AuthFeedback error={error} success={success} /></div>
      <AuthGoogleButton onClick={handleGoogleSignIn} pending={isGooglePending} disabled={busy} />
      <div className="my-5 flex items-center gap-3 text-[10px] text-white/35"><span className="h-px flex-1 bg-white/10" />ou avec votre e-mail<span className="h-px flex-1 bg-white/10" /></div>
      <form method="post" noValidate onSubmit={form.handleSubmit(onSubmit)} aria-busy={isPending}>
        <fieldset disabled={busy} className="space-y-4">
          <legend className="sr-only">Créer un compte par e-mail</legend>
          <div className="sr-only" aria-hidden="true"><label htmlFor="register-website">Site web</label><input id="register-website" type="text" tabIndex={-1} autoComplete="off" {...form.register("website")} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField id="register-firstName" label="Prénom" autoComplete="given-name" placeholder="Votre prénom" required error={form.formState.errors.firstName?.message} {...form.register("firstName")} />
            <AuthField id="register-lastName" label="Nom" autoComplete="family-name" placeholder="Votre nom" required error={form.formState.errors.lastName?.message} {...form.register("lastName")} />
          </div>
          <AuthField id="register-email" label="Adresse e-mail" type="email" autoComplete="email" placeholder="vous@exemple.fr" required error={form.formState.errors.email?.message} {...form.register("email")} />
          <AuthField id="register-birthDate" label="Date de naissance (facultatif)" type="date" autoComplete="bday" error={form.formState.errors.birthDate?.message} {...form.register("birthDate")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField id="register-password" label="Mot de passe" type="password" autoComplete="new-password" placeholder="Votre mot de passe" aria-describedby="password-requirements" required error={form.formState.errors.password?.message} {...form.register("password")} />
            <AuthField id="register-confirmPassword" label="Confirmer le mot de passe" type="password" autoComplete="new-password" placeholder="Une seconde fois" required error={form.formState.errors.confirmPassword?.message} {...form.register("confirmPassword")} />
          </div>
          <p id="password-requirements" className="text-[11px] leading-5 text-white/45">8 caractères minimum, avec une majuscule, une minuscule et un chiffre.</p>
          <div>
            <div className="flex items-start gap-2.5"><input id="register-acceptTerms" type="checkbox" aria-invalid={!!form.formState.errors.acceptTerms} aria-describedby={form.formState.errors.acceptTerms ? "register-terms-error" : undefined} className="mt-1 size-4 shrink-0 accent-tertiary-400" {...form.register("acceptTerms")} /><label htmlFor="register-acceptTerms" className="text-xs leading-6 text-white/60">J’accepte les <Link href="/conditions-d-utilisation" className="text-white/85 underline decoration-white/25 underline-offset-4 hover:text-tertiary-400">conditions d’utilisation</Link> et la <Link href="/politique-de-confidentialite" className="text-white/85 underline decoration-white/25 underline-offset-4 hover:text-tertiary-400">politique de confidentialité</Link>.</label></div>
            {form.formState.errors.acceptTerms && <p id="register-terms-error" className="mt-2 text-xs text-red-400">{form.formState.errors.acceptTerms.message}</p>}
          </div>
          <AppButton type="submit" fullWidth disabled={busy || isBlocked} icon={<ArrowUpRight size={16} aria-hidden="true" />} className="min-h-11 px-4!">{isBlocked ? "Réessayer dans " + cooldownSeconds + " s" : isPending ? "Création du compte…" : "Créer mon compte"}</AppButton>
        </fieldset>
      </form>
      <p className="mt-6 border-t border-white/10 pt-5 text-center text-xs leading-6 text-white/55">Déjà un compte ? <Link href="/se-connecter" className="rounded-sm text-tertiary-400 transition hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400">Me connecter</Link></p>
    </div>
  );
}
