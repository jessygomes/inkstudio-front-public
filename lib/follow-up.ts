/** Suivi de cicatrisation : états proposés au client (distincts de la note de satisfaction). Mêmes valeurs que le backend. */
export type HealingStatus = "GOOD" | "NORMAL" | "REDNESS" | "WORRIED";

export const HEALING_OPTIONS: { value: HealingStatus; label: string; hint: string; concern?: boolean }[] = [
  { value: "GOOD", label: "Tout se passe bien", hint: "Pas de gêne particulière." },
  { value: "NORMAL", label: "Ça démange ou ça pèle", hint: "C’est normal pendant la cicatrisation." },
  { value: "REDNESS", label: "Rougeur ou gonflement", hint: "Le salon sera prévenu en priorité.", concern: true },
  { value: "WORRIED", label: "Je suis inquiet·e", hint: "Le salon sera prévenu en priorité.", concern: true },
];

export const HEALING_LABELS: Record<HealingStatus, string> = Object.fromEntries(
  HEALING_OPTIONS.map((option) => [option.value, option.label]),
) as Record<HealingStatus, string>;

export const SATISFACTION_LABELS = ["Touchez une étoile", "Très insatisfait", "Insatisfait", "Neutre", "Satisfait", "Très satisfait"];

export const FOLLOW_UP_MAX_PHOTOS = 3;

/** Suivi envoyé, tel que renvoyé avec les rendez-vous du client. */
export type ClientFollowUp = {
  id: string;
  rating: number;
  healingStatus?: HealingStatus | null;
  review?: string | null;
  photoUrls: string[];
  response?: string | null;
  isAnswered: boolean;
  respondedAt?: string | null;
  createdAt: string;
};
