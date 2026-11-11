"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoaderCircle, MessageCircle, UserPlus } from "lucide-react";
import { startConversationFromPublicProfileAction } from "@/lib/actions/conversation.action";
import { setAuthReturnPath } from "@/lib/booking-link";

type Props = {
  targetUserId: string;
  recipientName: string;
  className?: string;
  title?: string;
};

/** Encart « Une question ? » : ouvre la messagerie Inkera avec le salon, ou invite à se connecter. */
export default function SalonMessageCard({ targetUserId, recipientName, className = "", title = "Une question avant de réserver ?" }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const isClient = status === "authenticated" && session?.user?.role === "client";

  const openConversation = () => {
    if (pending) return;
    if (!isClient) { setShowAuthPrompt(open => !open); return; }
    setError("");
    startTransition(async () => {
      try {
        const { id } = await startConversationFromPublicProfileAction(targetUserId);
        router.push(`/mon-profil?tab=messagerie&conversation=${encodeURIComponent(id)}`);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Impossible d’ouvrir la conversation.");
      }
    });
  };

  const goToAuth = (href: string) => {
    // Après connexion, le client revient sur la page de réservation.
    setAuthReturnPath(window.location.pathname + window.location.search);
    router.push(href);
  };

  return (
    <div className={`rounded-3xl bg-noir-500 p-5 font-one ${className}`}>
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-cuatro-500/25 to-tertiary-500/15 text-cuatro-500"><MessageCircle size={16} /></span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white/90">{title}</p>
          <p className="mt-0.5 text-xs leading-5 text-white/50">Discutez directement avec {recipientName} via la messagerie Inkera.</p>
        </div>
      </div>
      <button
        type="button"
        onClick={openConversation}
        disabled={pending || status === "loading"}
        aria-expanded={!isClient ? showAuthPrompt : undefined}
        className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cuatro-500 to-cuatro-600 px-4 text-xs font-medium text-white shadow-lg shadow-cuatro-500/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cuatro-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-noir-500 disabled:opacity-50"
      >
        {pending ? <LoaderCircle size={14} className="animate-spin" /> : <MessageCircle size={14} />}
        {pending ? "Ouverture…" : "Envoyer un message"}
      </button>

      {showAuthPrompt && !isClient && (
        <div role="status" className="mt-3 rounded-2xl bg-white/4 p-3.5 text-xs leading-5 text-white/65">
          {status === "authenticated" ? (
            <p>La messagerie est réservée aux comptes clients Inkera.</p>
          ) : (
            <>
              <p>Pour écrire au salon, connectez-vous ou créez votre compte gratuit. <span className="text-white/85">C’est rapide : moins de 2 minutes.</span></p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button type="button" onClick={() => goToAuth("/creer-un-compte")} className="inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-tertiary-400 to-tertiary-500 px-3.5 py-1.5 font-medium text-noir-900 transition hover:brightness-110"><UserPlus size={12} />Créer mon compte</button>
                <button type="button" onClick={() => goToAuth("/se-connecter")} className="rounded-xl bg-white/8 px-3.5 py-1.5 text-white/85 transition hover:bg-white/12 hover:text-white">Se connecter</button>
              </div>
            </>
          )}
        </div>
      )}
      {error && <p role="alert" className="mt-3 rounded-2xl bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
    </div>
  );
}
