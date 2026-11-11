"use client";
import { useEffect, useState } from "react";
import { BookOpen, Images, UsersRound, Star, MapPin, MessageSquare } from "lucide-react";

export default function SalonSectionNav({ showTeam, className = "" }: { showTeam: boolean; className?: string }) {
  const [active, setActive] = useState("presentation");
  const sections = [
    { id: "presentation", label: "Présentation", Icon: BookOpen },
    { id: "creations", label: "Galerie", Icon: Images },
    ...(showTeam ? [{ id: "equipe", label: "L’équipe", Icon: UsersRound }] : []),
    { id: "avis", label: "Avis", Icon: Star },
    { id: "informations", label: "Infos pratiques", Icon: MapPin },
    { id: "contact", label: "Contact", Icon: MessageSquare },
  ];
  useEffect(() => {
    const ids = ["presentation", "creations", ...(showTeam ? ["equipe"] : []), "avis", "contact"];
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: "-15% 0px -65% 0px", threshold: 0 });
    ids.forEach(id => { const section = document.getElementById(id); if (section) observer.observe(section); });
    return () => observer.disconnect();
  }, [showTeam]);
  return (
    <nav aria-label="Sections du profil" className={`no-scrollbar flex gap-1 overflow-x-auto rounded-2xl bg-noir-500/85 p-1.5 font-one shadow-xl shadow-black/30 backdrop-blur-xl ${className}`}>
      {sections.map(({ id, label, Icon }) => <a key={id} href={`#${id}`} aria-current={active === id ? "location" : undefined} onClick={() => setActive(id)} className={`relative flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-xs transition sm:flex-1 ${active === id ? "bg-linear-to-r from-tertiary-400/25 to-cuatro-500/20 text-white" : "text-white/45 hover:bg-white/5 hover:text-white/85"}`}><Icon size={14} className={active === id ? "text-tertiary-400" : "text-white/30"} aria-hidden="true" />{label}</a>)}
    </nav>
  );
}
