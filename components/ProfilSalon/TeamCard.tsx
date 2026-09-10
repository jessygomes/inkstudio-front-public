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
    <article aria-labelledby={`${id}-name`} className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-noir-500 font-one transition-colors hover:border-tertiary-400/30">
      <div className="flex items-center gap-4 bg-linear-to-br from-white/5 to-transparent p-4 sm:p-5">
        <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-noir-700 text-2xl text-white/60 sm:h-24 sm:w-24">
          {img ? <Image src={img} alt={`Portrait de ${name}`} fill sizes="(min-width:640px) 96px, 80px" className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" /> : name.trim().charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="mb-1.5 text-[11px] tracking-widest text-white/45 uppercase">Artiste du salon</p>
          <h3 id={`${id}-name`} className="break-words text-xl leading-tight text-white">{artistHref ? <Link href={artistHref} className="transition hover:text-tertiary-400">{name}</Link> : name}</h3>
          {competencies.length > 0 && <p className="mt-2 break-words text-xs leading-5 text-white/60">{competencies.join(" · ")}</p>}
        </div>
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4 sm:px-5 sm:pb-5">
        {description && <div className="mt-1">
          <p id={`${id}-description`} className={`whitespace-pre-line break-words text-sm leading-6 text-white/65 ${descriptionExpanded ? "" : "line-clamp-2"}`}>{description}</p>
          <button type="button" onClick={() => setDescriptionExpanded((expanded) => !expanded)} aria-expanded={descriptionExpanded} aria-controls={`${id}-description`} className="inline-flex min-h-11 cursor-pointer items-center gap-1 text-xs text-white/75 hover:text-tertiary-400">{descriptionExpanded ? "Voir moins" : "Voir plus"}<ChevronDown size={13} className={descriptionExpanded ? "rotate-180" : ""} /></button>
        </div>}
        {styles.length > 0 && <div className="mb-4 mt-2">
          <p className="mb-2 text-xs text-white/45">Styles de tatouage</p>
          <div id={`${id}-styles`} className="flex flex-wrap gap-1.5">
            {(allStyles ? styles : styles.slice(0, 4)).map((label) => <span key={label} className="max-w-full break-words rounded-lg border border-white/8 bg-white/4 px-2.5 py-1 text-xs text-white/75">{label}</span>)}
          </div>
          {styles.length > 4 && <button type="button" onClick={() => setAllStyles((expanded) => !expanded)} aria-expanded={allStyles} aria-controls={`${id}-styles`} className="min-h-11 cursor-pointer text-xs text-tertiary-400 hover:underline">{allStyles ? "Réduire les styles" : `+ ${styles.length - 4} autres styles`}</button>}
        </div>}
        {(artistHref || instaUrl) && <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          {artistHref && <Link href={artistHref} aria-label={`Découvrir le profil de ${name}`} className="inline-flex min-h-11 flex-1 items-center justify-between gap-2 rounded-xl bg-tertiary-400/10 px-3 text-sm text-white transition hover:bg-tertiary-400/20">Découvrir l’artiste<ArrowUpRight size={16} className="text-tertiary-400" /></Link>}
          {instaUrl && <a href={instaUrl} target="_blank" rel="noopener noreferrer" aria-label={`Instagram de ${name}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"><Instagram size={17} />{!artistHref && "Instagram"}</a>}
        </div>}
      </div>
    </article>
  );
}
