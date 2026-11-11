// Styles partagés (réservation, profil salon) : surfaces pleines, sans contour.
// La hiérarchie passe par les fonds (noir-800 → noir-500 → blanc translucide) et les dégradés Inkera.

/** Carte principale d'une étape. */
export const surface = "rounded-3xl bg-noir-500 p-5 sm:p-6";

/** Zone secondaire posée dans une carte. */
export const inset = "rounded-2xl bg-white/4";

/** Anneau de focus clavier (le seul « contour » conservé, pour l'accessibilité). */
export const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-noir-500";

/** Élément sélectionnable (carte, puce, créneau). */
export const choice = (active: boolean) =>
  `transition ${focusRing} ${active
    ? "bg-linear-to-br from-tertiary-400/25 via-tertiary-500/15 to-cuatro-500/15 text-white"
    : "bg-white/4 text-white/70 hover:bg-white/8 hover:text-white"}`;

/** Champ de saisie. */
export const field = (invalid = false) =>
  `w-full min-w-0 rounded-2xl px-4 text-sm text-white outline-none transition placeholder:text-white/30 [color-scheme:dark] focus:ring-2 ${invalid
    ? "bg-red-400/8 focus:ring-red-400/40"
    : "bg-white/5 hover:bg-white/7 focus:bg-white/8 focus:ring-tertiary-400/40"}`;

/** Libellé de champ. */
export const label = "mb-2 flex items-center gap-1 text-xs font-medium text-white/60";

/** Pastille d'icône d'une carte. */
export const iconBadge = "grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-tertiary-400/20 to-cuatro-500/15 text-tertiary-400";

/** Coche ronde d'un élément sélectionné. */
export const checkBadge = "grid size-5 shrink-0 place-items-center rounded-full bg-linear-to-br from-tertiary-400 to-tertiary-500 text-noir-900";
