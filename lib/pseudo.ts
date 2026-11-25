"use client";
import { useEffect, useRef, useState } from "react";

import { pseudoFormatError } from "./pseudo-rules";
export { PSEUDO_MAX, PSEUDO_MIN, pseudoFormatError } from "./pseudo-rules";

export type PseudoStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available" }
  | { state: "invalid" | "taken"; message: string }
  | { state: "error"; message: string };

export type PseudoCheck = (pseudo: string) => Promise<{ available: boolean; message?: string; code?: string }>;

/** Vérification publique (inscription) : appel direct au backend. */
export const checkPseudoPublic: PseudoCheck = async (pseudo) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/auth/pseudo-available?pseudo=${encodeURIComponent(pseudo)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Vérification du pseudo indisponible.");
  return response.json();
};

/**
 * Disponibilité du pseudo pendant la saisie : format vérifié tout de suite, puis le serveur 400 ms après la dernière frappe.
 * `initial` : pseudo actuel du compte (profil), considéré comme disponible sans appel.
 */
export function usePseudoAvailability(value: string, check: PseudoCheck = checkPseudoPublic, initial?: string | null): PseudoStatus {
  const [status, setStatus] = useState<PseudoStatus>({ state: "idle" });
  const sequence = useRef(0);

  useEffect(() => {
    const pseudo = value.normalize("NFC").trim();
    const request = ++sequence.current;
    const timer = window.setTimeout(async () => {
      if (!pseudo) return setStatus({ state: "idle" });
      const formatError = pseudoFormatError(pseudo);
      if (formatError) return setStatus({ state: "invalid", message: formatError });
      if (initial && pseudo.toLowerCase() === initial.trim().toLowerCase()) return setStatus({ state: "available" });
      setStatus({ state: "checking" });
      try {
        const result = await check(pseudo);
        if (request !== sequence.current) return;
        setStatus(result.available
          ? { state: "available" }
          : { state: result.code === "PSEUDO_INVALID" ? "invalid" : "taken", message: result.message || "Ce pseudo est déjà utilisé. Choisissez-en un autre." });
      } catch {
        if (request === sequence.current) setStatus({ state: "error", message: "Impossible de vérifier ce pseudo pour le moment." });
      }
    }, pseudo ? 400 : 0);
    return () => window.clearTimeout(timer);
  }, [value, check, initial]);

  return status;
}

/** Texte d'aide / d'erreur à afficher sous le champ. */
export function pseudoFeedback(status: PseudoStatus): { hint?: string; error?: string } {
  switch (status.state) {
    case "checking": return { hint: "Vérification du pseudo…" };
    case "available": return { hint: "✓ Ce pseudo est disponible." };
    case "invalid":
    case "taken": return { error: status.message };
    case "error": return { hint: status.message };
    default: return { hint: "Visible par les tatoueurs à la place de votre nom. 3 à 30 caractères, sans espace." };
  }
}
