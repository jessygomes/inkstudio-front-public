import { ArrowUpRight } from "lucide-react";
import { FaInstagram, FaTiktok } from "react-icons/fa";

const links = [
  { href: "https://www.instagram.com/the.inkera", label: "Instagram", Icon: FaInstagram },
  { href: "https://www.tiktok.com/@inkera2?_r=1&_t=ZN-96K7CgxVqsw", label: "TikTok", Icon: FaTiktok },
];

export default function NavbarSocialLinks({ expanded = false, onNavigate }: { expanded?: boolean; onNavigate?: () => void }) {
  return (
    <div className={expanded ? "grid grid-cols-2 gap-2" : "flex items-center gap-2"}>
      {links.map(({ href, label, Icon }) => (
        <a key={href} href={href} target="_blank" rel="noopener noreferrer" onClick={onNavigate} title={label} aria-label={"Inkera sur " + label + " (nouvel onglet)"} className={"group inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-noir-800 text-white/65 transition-colors hover:border-tertiary-400/40 hover:bg-tertiary-400/5 hover:text-tertiary-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-400 " + (expanded ? "justify-between px-3" : "w-10 justify-center")}>
          <span className="flex items-center gap-2"><Icon size={15} aria-hidden="true" />{expanded && <span className="font-one text-xs">{label}</span>}</span>
          {expanded && <ArrowUpRight size={12} aria-hidden="true" className="text-white/35 transition-colors group-hover:text-tertiary-400" />}
        </a>
      ))}
    </div>
  );
}
