"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormError } from "@/components/Shared/FormError";
import { FormSuccess } from "@/components/Shared/FormSuccess";
import { forgotPasswordSchema } from "@/lib/zod/validator-schema";
import { parseRateLimit } from "../../lib/auth-rate-limit";
import { CardWrapper } from "./Wrapper/CardWrapper";

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const getForgotPasswordEndpoint = () => {
  const customEndpoint = process.env.NEXT_PUBLIC_AUTH_FORGOT_PASSWORD_ENDPOINT;

  if (customEndpoint) {
    return customEndpoint;
  }

  if (!process.env.NEXT_PUBLIC_BACK_URL) {
    return null;
  }

  return `${process.env.NEXT_PUBLIC_BACK_URL}/auth/forgot-password`;
};

export default function ForgotPassword() {
  const [isPending, setIsPending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [hasRateLimitError, setHasRateLimitError] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      if (hasRateLimitError) {
        setError("");
        setHasRateLimitError(false);
      }

      return;
    }

    const intervalId = window.setInterval(() => {
      setCooldownSeconds((previousSeconds) =>
        previousSeconds > 0 ? previousSeconds - 1 : 0,
      );
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [cooldownSeconds, hasRateLimitError]);

  const onSubmit = async (data: ForgotPasswordForm) => {
    if (cooldownSeconds > 0) {
      return;
    }

    const endpoint = getForgotPasswordEndpoint();

    if (!endpoint) {
      setError("Configuration manquante pour la réinitialisation du mot de passe.");
      return;
    }

    setError("");
    setSuccess("");
    setHasRateLimitError(false);
    setIsPending(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
        }),
      });

      const rateLimit = await parseRateLimit(response);

      if (rateLimit.isRateLimited) {
        setCooldownSeconds(rateLimit.retryAfterSeconds);
        setHasRateLimitError(true);
        setError(rateLimit.message);
        return;
      }

      const responseData = await response.json().catch(() => null);

      if (!response.ok || responseData?.error) {
        setError(
          responseData?.message ||
            "Impossible d'envoyer l'email de réinitialisation pour le moment.",
        );
        return;
      }

      setSuccess(
        "Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.",
      );
      form.reset();
    } catch (requestError) {
      console.error("Erreur mot de passe oublié:", requestError);
      setError(
        "Impossible d'envoyer l'email de réinitialisation pour le moment.",
      );
    } finally {
      setIsPending(false);
    }
  };

  const isBlocked = cooldownSeconds > 0;

  return (
    <div className="w-full sm:w-2/3 lg:w-1/3">
      <CardWrapper headerLabel="Mot de passe oublié">
        <form
          method="post"
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative text-white"
        >
          <div className="flex flex-col gap-6">
            <p className="text-xs text-white/75 font-one leading-relaxed text-center">
              Saisissez votre email pour recevoir un lien de réinitialisation.
            </p>

            <div className="flex flex-col gap-1 font-one">
              <label htmlFor="forgot-password-email" className="text-xs">
                Email
              </label>
              <input
                id="forgot-password-email"
                placeholder="johndoe@domaine.com"
                type="email"
                required
                className="bg-white/30 py-2 px-4 rounded-2xl"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <FormError message={error} />
            <FormSuccess message={success} />

            <button
              className="cursor-pointer px-8 py-2 bg-linear-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-2xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one lg:text-xs"
              type="submit"
              disabled={isPending || isBlocked}
            >
              {isBlocked
                ? `Réessayer dans ${cooldownSeconds}s`
                : isPending
                  ? "Envoi..."
                  : "Envoyer le lien"}
            </button>
          </div>
        </form>
      </CardWrapper>

      <div className="relative flex flex-col gap-2 justify-center items-center">
        <p className="text-white text-xs text-center font-two mt-2">
          Vous vous souvenez de votre mot de passe ?{" "}
          <Link
            className="text-tertiary-400 hover:text-tertiary-500 transition-all ease-in-out duration-150"
            href="/se-connecter"
          >
            Se connecter
          </Link>
        </p>
        <p className="text-white text-xs text-center font-two">
          Pas encore de compte ?{" "}
          <Link
            className="text-tertiary-400 hover:text-tertiary-500 transition-all ease-in-out duration-150"
            href="/creer-un-compte"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}