import type { ReactNode } from "react";
import { iconBadge } from "@/components/Shared/ui";

/** En-tête de section du profil : pastille dégradée + surtitre + titre. */
export default function SectionHeading({ id, icon, eyebrow, title, aside, as: Tag = "h2" }: { id?: string; icon: ReactNode; eyebrow?: string; title: string; aside?: ReactNode; as?: "h2" | "h3" }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span aria-hidden="true" className={iconBadge}>{icon}</span>
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="mb-0.5 text-[10px] uppercase tracking-[0.16em] text-white/35">{eyebrow}</p>}
        <Tag id={id} className="text-lg font-semibold tracking-tight text-white">{title}</Tag>
      </div>
      {aside}
    </div>
  );
}
