"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { parseRateLimitCode } from "../../lib/auth-rate-limit";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";
import AuthField from "./AuthField";
import AuthFeedback from "./AuthFeedback";
import AuthGoogleButton from "./AuthGoogleButton";

import { userLoginSchema } from "@/lib/zod/validator-schema";

export const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isPending, setIsPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [hasRateLimitError, setHasRateLimitError] = useState(false);
  const [error, setError] = useState<string | undefined>(() =>
    searchParams.get("reason") === "expired"
      ? "Votre session a expiré. Veuillez vous reconnecter."
      : "",
  );
  const [success, setSuccess] = useState<string | undefined>("");



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

  const form = useForm<z.infer<typeof userLoginSchema>>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof userLoginSchema>) => {
    if (cooldownSeconds > 0) {
      return;
    }

    setError("");
    setSuccess("");
    setHasRateLimitError(false);
    setIsPending(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      const rateLimit = parseRateLimitCode(result?.code);

      if (rateLimit.isRateLimited) {
        setCooldownSeconds(rateLimit.retryAfterSeconds);
        setHasRateLimitError(true);
        setError(rateLimit.message);
        setIsPending(false);
        return;
      }

      // Vérifier si une erreur existe (pas seulement ok)
      if (result?.error) {
        console.log("❌ [Login] Authentification échouée - Pas de redirection");
        setError(
          result.error === "CredentialsSignin"
            ? "Email ou mot de passe incorrect"
            : result.error || "Authentification échouée",
        );
        setIsPending(false);
        return;
      }

      setSuccess("Connexion réussie !");
      setSuccess("Redirection vers l'app...");

      // Attendre un peu avant de rediriger
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error) {
      console.error("❌ [Login] Erreur lors de la connexion :", error);
      setError("Impossible de se connecter. Veuillez réessayer plus tard.");
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
      console.error("❌ [Login] Erreur Google:", err);
      setError("Impossible de se connecter avec Google.");
      setIsGooglePending(false);
    }
  };

  const busy = isPending || isGooglePending;

  return (
    <div className="font-one">
      <div className="mb-6"><p className="text-[10px] uppercase tracking-[0.18em] text-tertiary-400">Votre espace client</p><h1 className="mt-3 font-two text-3xl font-medium tracking-tight text-white">Heureux de vous retrouver.</h1><p className="mt-3 text-sm leading-7 text-white/55">Connectez-vous pour retrouver vos inspirations, vos rendez-vous et vos échanges.</p></div>
      <div className="mb-5"><AuthFeedback error={error} success={success} /></div>
      <AuthGoogleButton onClick={handleGoogleSignIn} pending={isGooglePending} disabled={busy} />
      <div className="my-5 flex items-center gap-3 text-[10px] text-white/35"><span className="h-px flex-1 bg-white/10" />ou avec votre e-mail<span className="h-px flex-1 bg-white/10" /></div>
      <form method="post" noValidate onSubmit={form.handleSubmit(onSubmit)} aria-busy={isPending}>
        <fieldset disabled={busy} className="space-y-5">
          <legend className="sr-only">Connexion par e-mail</legend>
          <AuthField id="login-email" label="Adresse e-mail" type="email" autoComplete="email" placeholder="vous@exemple.fr" required error={form.formState.errors.email?.message} {...form.register("email")} />
          <div><AuthField id="login-password" label="Mot de passe" type="password" autoComplete="current-password" placeholder="Votre mot de passe" required error={form.formState.errors.password?.message} {...form.register("password")} /><div className="mt-2 flex justify-end"><Link href="/motdepasseoublie" className="rounded-sm text-[11px] text-white/55 transition hover:text-tertiary-400 focus-visible:outline-2 focus-visible:outline-tertiary-400">Mot de passe oublié ?</Link></div></div>
          <AppButton type="submit" fullWidth disabled={busy || isBlocked} icon={<ArrowUpRight size={16} aria-hidden="true" />} className="min-h-11 px-4!">{isBlocked ? "Réessayer dans " + cooldownSeconds + " s" : isPending ? "Connexion en cours…" : "Me connecter"}</AppButton>
        </fieldset>
      </form>
      <p className="mt-6 border-t border-white/10 pt-5 text-center text-xs leading-6 text-white/55">Pas encore de compte ? <Link href="/creer-un-compte" className="rounded-sm text-tertiary-400 transition hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400">Créer un compte gratuit</Link></p>
    </div>
  );
};
