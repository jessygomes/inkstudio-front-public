export default function SalonSectionNav({ showTeam, className = "" }: { showTeam: boolean; className?: string }) {
  const sections = [["presentation", "Présentation"], ["creations", "Galerie"], ...(showTeam ? [["equipe", "L’équipe"]] : []), ["avis", "Avis"], ["informations", "Infos pratiques"], ["contact", "Contact"]];
  return (
    <nav aria-label="Sections du profil" className={`flex gap-1 overflow-x-auto border-b border-white/10 pb-2 text-sm text-white/70 ${className}`}>
      {sections.map(([id, label]) => <a key={id} href={`#${id}`} className="shrink-0 rounded-lg px-4 py-3 transition hover:bg-white/5 hover:text-white">{label}</a>)}
    </nav>
  );
}
