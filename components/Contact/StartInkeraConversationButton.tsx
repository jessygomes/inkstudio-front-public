"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, LoaderCircle, MessageCircle } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";
import { startConversationFromPublicProfileAction } from "@/lib/actions/conversation.action";

type Props = {
  targetUserId: string;
  recipientName: string;
  variant?: "card" | "compact";
  /** "violet" = dégradé violet permanent (modale inspiration) */
  tone?: "default" | "violet";
};

/** Une conversation Inbox par professionnel / compte client, même avec plusieurs RDV. */
export default function StartInkeraConversationButton({ targetUserId, recipientName, variant = "card", tone = "default" }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const isClientAccount = status === "authenticated" && session?.user?.role === "client";

  const start = () => {
    if (pending) return;
    setError("");
    startTransition(async () => {
      try {
        const { id } = await startConversationFromPublicProfileAction(targetUserId);
        router.push(`/mon-profil?tab=messagerie&conversation=${encodeURIComponent(id)}`);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Une erreur est survenue.");
      }
    });
  };

  if (variant === "compact") {
    const handleClick = () => {
      if (isClientAccount) start();
      else setShowAuthPrompt((open) => !open);
    };

    return (
      <div className="w-full">
        <AppButton
          type="button"
          variant={tone === "violet" ? "violet" : "secondary"}
          fullWidth
          onClick={handleClick}
          disabled={pending || status === "loading"}
          icon={pending ? <LoaderCircle size={16} className="animate-spin" /> : <MessageCircle size={16} />}
          className={`cursor-pointer ${tone === "violet" ? "" : "min-h-12"}`}
        >
          {pending ? "Ouverture…" : "Envoyer un message"}
        </AppButton>
        {showAuthPrompt && !isClientAccount && (
          <div role="status" className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-white/70">
            {status === "authenticated" ? (
              <p>Cette fonctionnalité nécessite un compte client Inkera.</p>
            ) : (
              <>
                <p>Pour écrire à {recipientName}, vous devez créer un compte client Inkera gratuit ou vous connecter.</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <Link href="/creer-un-compte" className="font-semibold text-tertiary-400 hover:text-tertiary-300">Créer un compte</Link>
                  <Link href="/se-connecter" className="font-semibold text-white/80 hover:text-white">Se connecter</Link>
                </div>
              </>
            )}
          </div>
        )}
        {error && <p role="alert" className="mt-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-tertiary-400/20 bg-tertiary-400/5 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-xl">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[.18em] text-tertiary-400">Messagerie Inkera</p>
          <h3 className="text-base font-medium text-white font-one">Échanger directement avec {recipientName}</h3>
          <p className="mt-1 text-xs leading-relaxed text-white/55">Vos échanges restent accessibles depuis votre compte Inkera, même sans rendez-vous. Une conversation existante sera réutilisée.</p>
        </div>
        {status === "authenticated" && session?.user?.role === "client" ? (
          <AppButton onClick={start} disabled={pending} icon={pending ? <LoaderCircle size={16} className="animate-spin" /> : <MessageCircle size={16} />}>
            {pending ? "Ouverture…" : "Envoyer un message"}
          </AppButton>
        ) : status === "authenticated" ? (
          <p className="max-w-xs text-xs leading-relaxed text-white/55">Cette fonctionnalité nécessite un compte client Inkera.</p>
        ) : status === "loading" ? (
          <p className="text-xs text-white/45">Vérification du compte…</p>
        ) : (
          <div className="flex max-w-sm flex-col gap-3">
            <p className="text-xs leading-relaxed text-white/70">
              Pour écrire à {recipientName}, vous devez créer un compte client Inkera gratuit ou vous connecter.
            </p>
            <div className="flex flex-wrap gap-2">
              <AppButton href="/creer-un-compte" icon={<ArrowUpRight size={16} />}>Créer un compte</AppButton>
              <AppButton href="/se-connecter" variant="secondary">Se connecter</AppButton>
            </div>
          </div>
        )}
      </div>
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
    </div>
  );
}
