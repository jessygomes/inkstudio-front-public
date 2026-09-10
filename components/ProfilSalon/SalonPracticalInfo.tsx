"use client";

import { useId, useState } from "react";
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
  const rowClass = "group flex min-h-11 items-center gap-3 rounded-xl p-3 transition hover:bg-white/5";
  const iconClass = "grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-white/65";

  return (
    <section aria-labelledby={`${id}-heading`} className="overflow-hidden rounded-2xl border border-white/10 bg-noir-500 font-one">
      <div className="px-5 pb-3 pt-5">
        <h2 id={`${id}-heading`} className="text-lg text-white">Informations pratiques</h2>
        <p className="mt-1 text-xs leading-5 text-white/50">Pour nous trouver et échanger.</p>
      </div>
      <div className="px-2 pb-2">
        {fullAddress && <div className="mx-1 mb-2 rounded-xl bg-noir-700/50 p-3">
          <div className="flex items-start gap-3"><span className={iconClass}><MapPin size={17} aria-hidden="true" /></span><div className="min-w-0"><p className="mb-1 text-xs text-white/45">Adresse</p><address className="break-words text-sm leading-6 not-italic text-white/80">{props.address && <span className="block">{props.address}</span>}{[props.postalCode, props.city].filter(Boolean).join(" ")}</address></div></div>
          <div className="mt-3 flex items-center gap-2">
            <a href={props.directionsHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-tertiary-400/10 px-3 text-sm text-white transition hover:bg-tertiary-400/20"><Navigation size={15} className="text-tertiary-400" aria-hidden="true" />Itinéraire<ArrowUpRight size={14} aria-hidden="true" /></a>
            <button type="button" onClick={copyAddress} aria-label="Copier l’adresse" title="Copier l’adresse" className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-lg border border-white/10 text-white/65 transition hover:bg-white/5">{copyStatus === "Adresse copiée" ? <Check size={16} /> : <Copy size={16} />}</button>
          </div>
          <p role="status" className={copyStatus ? "mt-2 text-xs text-white/60" : "sr-only"}>{copyStatus}</p>
        </div>}
        {props.phone && <a href={`tel:${props.phone.replace(/[^\d+]/g, "")}`} className={rowClass}><span className={iconClass}><Phone size={17} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-xs text-white/45">Téléphone</span><span className="mt-1 block break-words text-sm text-white/80">{props.phoneDisplay}</span></span><ArrowUpRight size={16} className="shrink-0 text-white/35 group-hover:text-tertiary-400" aria-hidden="true" /></a>}
        {website && <a href={website} target="_blank" rel="noopener noreferrer" className={rowClass}><span className={iconClass}><Globe size={17} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-xs text-white/45">Site internet</span><span className="mt-1 block break-all text-sm text-white/80">{new URL(website).hostname.replace(/^www\./, "")}</span></span><ArrowUpRight size={16} className="shrink-0 text-white/35 group-hover:text-tertiary-400" aria-hidden="true" /></a>}
        {!fullAddress && !props.phone && !website && <p className="px-3 py-2 text-sm text-white/50">Coordonnées non renseignées.</p>}
      </div>
      {socials.length > 0 && <div className="border-t border-white/8 px-5 py-4"><h3 className="mb-2 text-xs text-white/50">Suivre le salon</h3><div className="flex flex-wrap gap-2">{socials.map(({ label, href, Icon }) => <a key={label} href={href!} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs text-white/70 transition hover:border-white/25 hover:text-white"><Icon size={16} aria-hidden="true" />{label}</a>)}</div></div>}
    </section>
  );
}
