"use client";

import { useId, useState } from "react";
import { ArrowUpRight, Check, Copy, Globe, Instagram, MapPin, Navigation, Phone } from "lucide-react";
import { CiFacebook } from "react-icons/ci";
import { PiTiktokLogoThin } from "react-icons/pi";
import { focusRing, surface } from "@/components/Shared/ui";
import SectionHeading from "./SectionHeading";

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
  const rowClass = `group flex min-h-12 items-center gap-3 rounded-2xl bg-white/4 p-3 transition hover:bg-white/7 ${focusRing}`;
  const iconClass = "grid size-9 shrink-0 place-items-center rounded-xl bg-white/6 text-tertiary-400";

  return (
    <section aria-labelledby={`${id}-heading`} className={`${surface} font-one`}>
      <SectionHeading id={`${id}-heading`} icon={<MapPin size={17} />} eyebrow="Préparer votre venue" title="Informations pratiques" />
      <div className="space-y-2">
        {fullAddress && (
          <div className="rounded-2xl bg-white/4 p-3">
            <div className="flex items-start gap-3">
              <span className={iconClass}><MapPin size={16} aria-hidden="true" /></span>
              <div className="min-w-0"><p className="mb-0.5 text-[10px] text-white/40">Adresse</p><address className="break-words text-xs leading-5 not-italic text-white/80">{props.address && <span className="block">{props.address}</span>}{[props.postalCode, props.city?.toLocaleUpperCase("fr-FR")].filter(Boolean).join(" ")}</address></div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <a href={props.directionsHref} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-tertiary-400 to-tertiary-500 px-4 text-xs font-medium text-white shadow-lg shadow-tertiary-500/20 transition hover:brightness-110 ${focusRing}`}><Navigation size={14} aria-hidden="true" />Itinéraire<ArrowUpRight size={14} aria-hidden="true" /></a>
              <button type="button" onClick={copyAddress} aria-label="Copier l’adresse" className={`grid size-10 shrink-0 place-items-center rounded-xl bg-white/6 text-white/75 transition hover:bg-white/10 hover:text-white ${focusRing}`}>{copyStatus === "Adresse copiée" ? <Check size={16} /> : <Copy size={16} />}</button>
            </div>
            <p role="status" className={copyStatus ? "mt-2 text-xs text-white/60" : "sr-only"}>{copyStatus}</p>
          </div>
        )}
        {props.phone && <a href={`tel:${props.phone.replace(/[^\d+]/g, "")}`} className={rowClass}><span className={iconClass}><Phone size={16} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-[10px] text-white/40">Téléphone</span><span className="mt-0.5 block break-words text-sm tabular-nums text-white/85">{props.phoneDisplay}</span></span><ArrowUpRight size={16} className="shrink-0 text-white/30 transition group-hover:text-tertiary-400" aria-hidden="true" /></a>}
        {website && <a href={website} target="_blank" rel="noopener noreferrer" className={rowClass}><span className={iconClass}><Globe size={16} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-[10px] text-white/40">Site internet</span><span className="mt-0.5 block break-all text-xs text-white/85">{new URL(website).hostname.replace(/^www\./, "")}</span></span><ArrowUpRight size={16} className="shrink-0 text-white/30 transition group-hover:text-tertiary-400" aria-hidden="true" /></a>}
        {!fullAddress && !props.phone && !website && <p className="px-1 py-2 text-sm text-white/50">Coordonnées non renseignées.</p>}
      </div>
      {socials.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2.5 text-xs text-white/45">Retrouvez-nous aussi</h3>
          <div className="flex flex-wrap gap-2">{socials.map(({ label, href, Icon }) => <a key={label} href={href!} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-10 items-center gap-2 rounded-xl bg-white/5 px-3.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white ${focusRing}`}><Icon size={16} aria-hidden="true" />{label}</a>)}</div>
        </div>
      )}
    </section>
  );
}
