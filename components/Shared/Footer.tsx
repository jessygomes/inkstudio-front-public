import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { FaInstagram, FaTiktok } from "react-icons/fa";

const columns = [
  {
    title: "Explorer",
    links: [
      { href: "/trouver-un-salon", label: "Trouver un salon" },
      { href: "/inspiration", label: "Inspirations" },
      { href: "/journal", label: "Le journal" },
    ],
  },
  {
    title: "Inkera",
    links: [
      { href: "/en-savoir-plus", label: "Découvrir Inkera" },
      { href: "/contactez-nous", label: "Nous contacter" },
      { href: "/creer-un-compte", label: "Créer un compte" },
    ],
  },
  {
    title: "Professionnels",
    links: [
      { href: "https://www.inkera-studio.com/", label: "Inkera Studio", external: true },
      { href: "https://www.inkera-studio.com/", label: "Référencer mon salon", external: true },
    ],
  },
];
const legal = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/politique-de-confidentialite", label: "Confidentialité" },
  { href: "/conditions-d-utilisation", label: "CGU" },
];
const socials = [
  { href: "https://www.instagram.com/the.inkera", label: "Instagram", Icon: FaInstagram },
  { href: "https://www.tiktok.com/@inkera2?_r=1&_t=ZN-96K7CgxVqsw", label: "TikTok", Icon: FaTiktok },
];

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-noir-800 font-one">
      {/* Fin trait dégradé qui ouvre le footer. */}
      <div aria-hidden="true" className="mx-page h-px bg-linear-to-r from-transparent via-white/15 to-transparent" />

      <div className="px-page pb-8 pt-14 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* Accroche + actions */}
          <div className="max-w-lg">
            <Link href="/" aria-label="Inkera — Accueil" className={`inline-block rounded-xl ${focus}`}>
              <Image src="/logo/Logo16.png" alt="" width={96} height={96} className="size-12" />
            </Link>
            <p className="mt-6 font-two text-2xl font-bold uppercase leading-tight tracking-wide text-white sm:text-3xl">Trouvez l’artiste qui vous ressemble.</p>
            <p className="mt-3 text-sm leading-6 text-white/50">Des idées, des artistes, des rencontres : l’univers de votre prochain tatouage commence ici.</p>
            <div className="mt-7 flex flex-wrap gap-2">
              <Link href="/trouver-un-salon" className={`inline-flex min-h-11 items-center gap-2 rounded-xl bg-linear-to-r from-tertiary-400 to-tertiary-500 px-5 text-sm font-medium text-white shadow-lg shadow-tertiary-500/20 transition hover:brightness-110 ${focus}`}><Search size={15} aria-hidden="true" />Trouver un tatoueur</Link>
              <Link href="/inspiration" className={`inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/6 px-5 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white ${focus}`}>Voir les inspirations</Link>
            </div>
          </div>

          {/* Liens */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            {columns.map(column => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">{column.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map(link => (
                    <li key={link.label}>
                      {"external" in link && link.external
                        ? <a href={link.href} target="_blank" rel="noopener noreferrer" className={`group inline-flex items-center gap-1 rounded-xl text-sm text-white/65 transition-colors hover:text-white ${focus}`}>{link.label}<ArrowUpRight size={13} aria-hidden="true" className="text-white/30 transition group-hover:text-tertiary-400" /><span className="sr-only"> (nouvel onglet)</span></a>
                        : <Link href={link.href} className={`rounded-xl text-sm text-white/65 transition-colors hover:text-white ${focus}`}>{link.label}</Link>}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Bas de page */}
        <div className="mt-14 flex flex-col gap-5 sm:mt-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/40">
            <span>© {new Date().getFullYear()} Inkera</span>
            {legal.map(link => <Link key={link.href} href={link.href} className={`rounded-xl transition-colors hover:text-white ${focus}`}>{link.label}</Link>)}
            <span>Un projet par <a href="https://www.inthegleam.com" target="_blank" rel="noopener noreferrer" className={`rounded-xl text-white/65 transition-colors hover:text-tertiary-400 ${focus}`}>inTheGleam<span className="sr-only"> (nouvel onglet)</span></a></span>
          </div>
          <div className="flex gap-2">
            {socials.map(({ href, label, Icon }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Inkera sur ${label} (nouvel onglet)`} className={`grid size-10 place-items-center rounded-xl bg-white/6 text-white/70 transition hover:bg-linear-to-br hover:from-tertiary-400 hover:to-cuatro-500 hover:text-white ${focus}`}><Icon size={16} aria-hidden="true" /></a>
            ))}
          </div>
        </div>
      </div>

      {/* Grand mot-symbole en filigrane qui clôt la page. */}
      <p aria-hidden="true" className="pointer-events-none -mb-[0.22em] select-none text-center font-two text-[22vw] font-bold uppercase leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.06)] bg-linear-to-b from-white/8 to-transparent bg-clip-text">
        Inkera
      </p>
    </footer>
  );
}
