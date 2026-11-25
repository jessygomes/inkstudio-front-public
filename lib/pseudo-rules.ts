// Règles du pseudo client, utilisables côté serveur et côté navigateur.
/** Mêmes règles que le backend (src/clients/client-pseudo.ts). */
export const PSEUDO_MIN = 3;
export const PSEUDO_MAX = 30;
const PSEUDO_PATTERN = /^[\p{L}\p{N}_.-]+$/u;

export function pseudoFormatError(value: string): string | null {
  const pseudo = value.normalize("NFC").trim();
  if (!pseudo) return "Choisissez un pseudo.";
  if (pseudo.length < PSEUDO_MIN) return `Le pseudo doit contenir au moins ${PSEUDO_MIN} caractères.`;
  if (pseudo.length > PSEUDO_MAX) return `Le pseudo ne peut pas dépasser ${PSEUDO_MAX} caractères.`;
  if (!PSEUDO_PATTERN.test(pseudo)) return "Lettres, chiffres, « _ », « . » et « - » seulement, sans espace.";
  return null;
}
