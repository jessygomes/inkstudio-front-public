"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, Instagram } from "lucide-react";
import { useId, useState } from "react";

type TeamCardProps = {
  name: string;
  img?: string | null;
  description?: string | null;
  instagram?: string | null;
  phone?: string | null;
  skills?: string[] | null;
  style?: string[] | null;
  isLinkedUser?: boolean | null;
  profileUserId?: string | null;
  profileHref?: string | null;
};

function uniqueLabels(values?: string[] | null) {
  const seen = new Set<string>();
  return (values ?? []).filter((value) => {
    if (typeof value !== "string" || !value.trim() || seen.has(value.trim().toLowerCase())) return false;
    seen.add(value.trim().toLowerCase());
    return true;
  }).map((value) => value.trim());
}

export function TeamCard({ name, img, description, instagram, skills, style, isLinkedUser, profileUserId, profileHref }: TeamCardProps) {
  const id = useId();
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [allStyles, setAllStyles] = useState(false);
  const styles = uniqueLabels(style);
  const competencies = uniqueLabels(skills);
  const instaUrl = instagram ? instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram.replace(/^@/, "")}` : null;
  const artistHref = isLinkedUser === true && profileUserId?.trim() && profileHref?.trim() ? profileHref : null;

  return (
    <article aria-labelledby={`${id}-name`} className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/8 bg-linear-to-br from-white/[0.035] to-transparent font-one transition-colors hover:border-tertiary-400/25 hover:bg-white/[0.025]">
      <div className="flex items-center gap-3 p-3.5">
        <div className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-noir-800 text-xl text-white/60">
          {img ? <Image src={img} alt={`Portrait de ${name}`} fill sizes="56px" className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" /> : name.trim().charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 id={`${id}-name`} className="break-words text-base font-medium leading-tight text-white">{artistHref ? <Link href={artistHref} className="transition hover:text-tertiary-400">{name}</Link> : name}</h3>
          {competencies.length > 0 && <p className="mt-1 break-words text-[10px] leading-4 text-white/45">{competencies.join(" · ")}</p>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-3.5 pb-3.5">
        {description && <div>
          <p id={`${id}-description`} className={`whitespace-pre-line break-words text-xs leading-5 text-white/55 ${descriptionExpanded || description.length <= 110 ? "" : "line-clamp-2"}`}>{description}</p>
          {description.length > 110 && <button type="button" onClick={() => setDescriptionExpanded((expanded) => !expanded)} aria-expanded={descriptionExpanded} aria-controls={`${id}-description`} className="inline-flex min-h-8 cursor-pointer items-center gap-1 text-[11px] text-white/75 hover:text-tertiary-400">{descriptionExpanded ? "Voir moins" : "Voir plus"}<ChevronDown size={13} className={descriptionExpanded ? "rotate-180" : ""} /></button>}
        </div>}
        {styles.length > 0 && <div>
          <div id={`${id}-styles`} className="flex flex-wrap gap-1.5">
            {(allStyles ? styles : styles.slice(0, 3)).map((label) => <span key={label} className="max-w-full break-words rounded-full border border-white/8 bg-white/[0.025] px-2 py-0.5 text-[10px] leading-5 text-white/60">{label}</span>)}
            {styles.length > 3 && <button type="button" onClick={() => setAllStyles((expanded) => !expanded)} aria-expanded={allStyles} aria-controls={`${id}-styles`} className="min-h-7 rounded-full px-2 text-[10px] text-tertiary-400 transition hover:bg-tertiary-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/40">{allStyles ? "Réduire les styles" : `+ ${styles.length - 3} autres styles`}</button>}
          </div>
        </div>}
        {(artistHref || instaUrl) && <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-white/8 pt-2.5">
          {artistHref && <Link href={artistHref} aria-label={`Découvrir le profil de ${name}`} className="inline-flex min-h-10 flex-1 items-center justify-between gap-2 rounded-lg bg-tertiary-400/8 px-3 text-xs text-white transition hover:bg-tertiary-400/20">Découvrir l’artiste<ArrowUpRight size={16} className="text-tertiary-400" /></Link>}
          {instaUrl && <a href={instaUrl} target="_blank" rel="noopener noreferrer" aria-label={`Instagram de ${name}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/8 px-3 text-xs text-white/70 transition hover:bg-white/5 hover:text-white"><Instagram size={17} />{!artistHref && "Instagram"}</a>}
        </div>}
      </div>
    </article>
  );
}
