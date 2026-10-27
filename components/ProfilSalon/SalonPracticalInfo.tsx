"use client";

import { useId, useState } from "react";
import AppButton from "@/components/Shared/AppButton";
import { ArrowUpRight, Check, Copy, Globe, Instagram, MapPin, Navigation, Phone } from "lucide-react";
import { CiFacebook } from "react-icons/ci";
import { PiTiktokLogoThin } from "react-icons/pi";

type Props = {
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  phoneDisplay: string;
  directionsHref: string;
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  website?: string | null;
};

function externalUrl(value?: string | null, socialBase?: string) {
  if (!value?.trim()) return null;
  let url = value.trim();
  if (!/^https?:\/\//i.test(url)) {
    if (/^[a-z][a-z\d+.-]*:/i.test(url)) return null;
    url = socialBase && !url.includes(".") ? `${socialBase}${url.replace(/^@/, "")}` : `https://${url}`;
  }
  try {
    const parsed = new URL(url);
    return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : null;
  } catch { return null; }
}

export default function SalonPracticalInfo(props: Props) {
  const id = useId();
  const [copyStatus, setCopyStatus] = useState("");
  const fullAddress = [props.address, props.postalCode, props.city].filter(Boolean).join(", ");
  const website = externalUrl(props.website);
  const socials = [
    { label: "Instagram", href: externalUrl(props.instagram, "https://instagram.com/"), Icon: Instagram },
    { label: "Facebook", href: externalUrl(props.facebook, "https://facebook.com/"), Icon: CiFacebook },
    { label: "TikTok", href: externalUrl(props.tiktok, "https://tiktok.com/@"), Icon: PiTiktokLogoThin },
  ].filter((social) => social.href);
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopyStatus("Adresse copiée");
    } catch {
      setCopyStatus("Copie indisponible. Vous pouvez sélectionner l’adresse ci-dessus.");
    }
  };
  const rowClass = "group flex min-h-10 items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.015] p-2.5 transition hover:border-tertiary-400/25 hover:bg-white/3";
  const iconClass = "grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/8 bg-noir-700 text-tertiary-400/70";

  return (
    <section aria-labelledby={`${id}-heading`} className="overflow-hidden rounded-2xl border border-white/10 bg-noir-700 font-one">
      <div className="flex items-center gap-2.5 px-4 pb-3 pt-4"><span className="grid size-8 shrink-0 place-items-center rounded-xl border border-tertiary-400/15 bg-tertiary-400/8 text-tertiary-400"><MapPin size={17} aria-hidden="true" /></span><div><p className="mb-1 text-[9px] uppercase tracking-[0.14em] text-white/35">Préparer votre venue</p><h2 id={id + "-heading"} className="text-base font-medium text-white/90">Informations pratiques</h2></div></div>
      <div className="space-y-1.5 px-3 pb-3">
        {fullAddress && <div className="rounded-xl border border-white/8 bg-white/[0.015] p-2.5">
          <div className="flex items-start gap-2.5"><span className={iconClass}><MapPin size={17} aria-hidden="true" /></span><div className="min-w-0"><p className="mb-1 text-[10px] text-white/40">Adresse</p><address className="break-words text-xs leading-5 not-italic text-white/75">{props.address && <span className="block">{props.address}</span>}{[props.postalCode, props.city?.toLocaleUpperCase("fr-FR")].filter(Boolean).join(" ")}</address></div></div>
          <div className="mt-2 flex items-center gap-2">
            <a href={props.directionsHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-tertiary-400 to-tertiary-500 px-3 text-xs text-white transition hover:brightness-110"><Navigation size={14} className="text-white" aria-hidden="true" />Itinéraire<ArrowUpRight size={14} aria-hidden="true" /></a>
            <AppButton variant="secondary" type="button" onClick={copyAddress} aria-label="Copier l’adresse" className="size-9! shrink-0 px-0! py-0! rounded-lg! shadow-none!">{copyStatus === "Adresse copiée" ? <Check size={16} /> : <Copy size={16} />}</AppButton>
          </div>
          <p role="status" className={copyStatus ? "mt-2 text-xs text-white/60" : "sr-only"}>{copyStatus}</p>
        </div>}
        {props.phone && <a href={`tel:${props.phone.replace(/[^\d+]/g, "")}`} className={rowClass}><span className={iconClass}><Phone size={17} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-[10px] text-white/45">Téléphone</span><span className="mt-0.5 block break-words text-xs text-white/80">{props.phoneDisplay}</span></span><ArrowUpRight size={16} className="shrink-0 text-white/35 group-hover:text-tertiary-400" aria-hidden="true" /></a>}
        {website && <a href={website} target="_blank" rel="noopener noreferrer" className={rowClass}><span className={iconClass}><Globe size={17} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-xs text-white/45">Site internet</span><span className="mt-1 block break-all text-xs text-white/80">{new URL(website).hostname.replace(/^www\./, "")}</span></span><ArrowUpRight size={16} className="shrink-0 text-white/35 group-hover:text-tertiary-400" aria-hidden="true" /></a>}
        {!fullAddress && !props.phone && !website && <p className="px-3 py-2 text-sm text-white/50">Coordonnées non renseignées.</p>}
      </div>
      {socials.length > 0 && <div className="border-t border-white/8 px-3 py-3"><h3 className="mb-2 text-xs text-white/50">Retrouvez-nous aussi</h3><div className="flex flex-wrap gap-2">{socials.map(({ label, href, Icon }) => <a key={label} href={href!} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/8 bg-white/[0.015] px-2.5 text-[11px] text-white/55 transition hover:border-tertiary-400/25 hover:text-white"><Icon size={16} aria-hidden="true" />{label}</a>)}</div></div>}
    </section>
  );
}
