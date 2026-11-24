import type { LucideIcon } from "lucide-react";

const GRADIENT_ID = "inkera-icon-gradient";

/** Pastille d'icône des en-têtes de page : fond et icône au dégradé Inkera orange → violet, sans contour. */
export default function GradientIconBadge({ icon: Icon, size = 34, className = "" }: { icon: LucideIcon; size?: number; className?: string }) {
  return (
    <span className={`grid size-18 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-tertiary-400/20 via-tertiary-500/15 to-cuatro-500/25 ${className}`}>
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={GRADIENT_ID} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="var(--color-tertiary-400)" />
            <stop offset="50%" stopColor="var(--color-tertiary-500)" />
            <stop offset="100%" stopColor="var(--color-cuatro-500)" />
          </linearGradient>
        </defs>
      </svg>
      <Icon size={size} color={`url(#${GRADIENT_ID})`} aria-hidden="true" />
    </span>
  );
}
