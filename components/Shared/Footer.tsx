import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, PenTool } from "lucide-react";
import { FaInstagram, FaTiktok } from "react-icons/fa";

const navigation = [
  { href: "/", label: "Accueil" },
  { href: "/trouver-un-salon", label: "Trouver un salon" },
  { href: "/inspiration", label: "Inspirations" },
  { href: "/journal", label: "Le journal" },
  { href: "/en-savoir-plus", label: "Découvrir Inkera" },
];
const legal = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/politique-de-confidentialite", label: "Confidentialité" },
  { href: "/conditions-d-utilisation", label: "Conditions d’utilisation" },
];
const socials = [
  { href: "https://www.instagram.com/the.inkera", label: "Instagram", Icon: FaInstagram },
  { href: "https://www.tiktok.com/@inkera2?_r=1&_t=ZN-96K7CgxVqsw", label: "TikTok", Icon: FaTiktok },
];

// Mêmes marges latérales que la navbar et le contenu des pages.
const gutter = "mx-page";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400";
const linkClass = `inline-block rounded-xl py-1 text-sm text-white/55 transition-colors hover:text-white ${focus}`;

export default function Footer() {
  return (
    <footer className="bg-noir-800 pb-6 font-one">
      <div className={`${gutter} rounded-[2rem] bg-noir-700 p-6 sm:p-10`}>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1.3fr] lg:gap-12">
          {/* Marque */}
          <div>
            <Link href="/" className={`inline-block rounded-xl ${focus}`}>
              <Image src="/logo/logo_inline_people_white.png" alt="Inkera People — Accueil" width={180} height={60} className="h-auto w-40" />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-7 text-white/55">Des idées, des artistes, des rencontres. Trouvez l’univers de votre prochain tatouage.</p>
            <div className="mt-6 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={"Inkera sur " + label + " (nouvel onglet)"} className={`grid size-10 place-items-center rounded-xl bg-white/6 text-white/70 transition hover:bg-linear-to-br hover:from-tertiary-400 hover:to-cuatro-500 hover:text-white ${focus}`}><Icon size={16} aria-hidden="true" /></a>
              ))}
            </div>
          </div>

          {/* Liens */}
          <div className="grid grid-cols-2 gap-8">
            <nav aria-label="Explorer Inkera">
              <h2 className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">Explorer</h2>
              <ul className="space-y-1">{navigation.map(({ href, label }) => <li key={href}><Link href={href} className={linkClass}>{label}</Link></li>)}</ul>
            </nav>
            <nav aria-label="Informations légales">
              <h2 className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">Informations</h2>
              <ul className="space-y-1">{legal.map(({ href, label }) => <li key={href}><Link href={href} className={linkClass}>{label}</Link></li>)}</ul>
            </nav>
          </div>

          {/* Appels à l'action */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link href="/contactez-nous" className={`group flex items-center gap-4 rounded-2xl bg-white/4 p-4 transition hover:bg-white/7 ${focus}`}>
              <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/6 text-tertiary-400"><Mail size={18} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white">Restons en contact</span>
                <span className="mt-0.5 block text-xs leading-5 text-white/50">Une question ou une idée ? On vous écoute.</span>
              </span>
              <ArrowUpRight size={16} aria-hidden="true" className="shrink-0 text-white/35 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-tertiary-400" />
            </Link>
            <a href="https://www.inkera-studio.com/" target="_blank" rel="noopener noreferrer" className={`group flex items-center gap-4 rounded-2xl bg-linear-to-br from-tertiary-400/20 via-tertiary-500/10 to-cuatro-500/20 p-4 transition hover:from-tertiary-400/30 hover:to-cuatro-500/30 ${focus}`}>
              <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-tertiary-400 to-tertiary-500 text-white"><PenTool size={18} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white">Vous êtes tatoueur·se ?</span>
                <span className="mt-0.5 block text-xs leading-5 text-white/60">Découvrez votre espace pro Inkera Studio.<span className="sr-only"> (nouvel onglet)</span></span>
              </span>
              <ArrowUpRight size={16} aria-hidden="true" className="shrink-0 text-white/50 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
            </a>
          </div>
        </div>
      </div>

      {/* Bas de page */}
      <div className={`${gutter} mt-5 flex flex-col justify-between gap-2 px-2 text-xs leading-6 text-white/40 sm:flex-row sm:items-center`}>
        <p>© {new Date().getFullYear()} Inkera. Tous droits réservés.</p>
        <p>Un projet par <a href="https://www.inthegleam.com" target="_blank" rel="noopener noreferrer" className={`rounded-xl text-white/65 transition-colors hover:text-tertiary-400 ${focus}`}>inTheGleam<span className="sr-only"> (nouvel onglet)</span></a></p>
      </div>
    </footer>
  );
}
