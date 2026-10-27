import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import AppButton from "./AppButton";

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
const linkClass = "inline-block rounded-sm py-1 text-sm text-white/60 transition-colors hover:text-tertiary-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-noir-800 px-4 pb-6 pt-10 font-one sm:px-8 sm:pt-12 lg:px-20">
      <div className="grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:grid-cols-[1.3fr_1fr_1.1fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400">
            <Image src="/logo/logo_inline_people_white.png" alt="Inkera People — Accueil" width={180} height={60} className="h-auto w-40" />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-7 text-white/55">Des idées, des artistes, des rencontres.<br />Trouvez l’univers de votre prochain tatouage.</p>
          <div className="mt-5 flex gap-2">
            {socials.map(({ href, label, Icon }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={"Inkera sur " + label + " (nouvel onglet)"} className="flex size-9 items-center justify-center rounded-xl border border-white/15 text-white/65 transition-colors hover:border-tertiary-400/40 hover:text-tertiary-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400"><Icon size={16} aria-hidden="true" /></a>
            ))}
          </div>
        </div>

        <nav aria-label="Explorer Inkera">
          <h2 className="mb-3 text-[10px] uppercase tracking-[0.18em] text-tertiary-400">Explorer</h2>
          <ul className="space-y-1">{navigation.map(({ href, label }) => <li key={href}><Link href={href} className={linkClass}>{label}</Link></li>)}</ul>
        </nav>

        <nav aria-label="Informations légales">
          <h2 className="mb-3 text-[10px] uppercase tracking-[0.18em] text-tertiary-400">Informations utiles</h2>
          <ul className="space-y-1">{legal.map(({ href, label }) => <li key={href}><Link href={href} className={linkClass}>{label}</Link></li>)}</ul>
        </nav>

        <div>
          <h2 className="mb-3 text-[10px] uppercase tracking-[0.18em] text-tertiary-400">Restons en contact</h2>
          <p className="max-w-xs text-sm leading-7 text-white/55">Une question ou une idée à partager ? On vous écoute.</p>
          <AppButton href="/contactez-nous" variant="secondary" icon={<ArrowUpRight size={14} aria-hidden="true" />} className="mt-4 px-4! text-xs! shadow-none!">Nous contacter</AppButton>
        </div>

        <div>
          <h2 className="mb-3 text-[10px] uppercase tracking-[0.18em] text-tertiary-400">Salon / tatoueur.se</h2>
          <p className="max-w-xs text-sm leading-7 text-white/55">Découvrez votre espace professionnel Inkera Studio.</p>
          <AppButton href="https://www.inkera-studio.com/" variant="secondary" icon={<ArrowUpRight size={14} aria-hidden="true" />} className="mt-4 px-4! text-xs! shadow-none!">Je suis tatoueur</AppButton>
        </div>
      </div>

      <div className="mt-9 flex flex-col justify-between gap-2 border-t border-white/10 pt-5 text-xs leading-6 text-white/45 sm:mt-10 sm:flex-row sm:items-center">
        <p>© {new Date().getFullYear()} Inkera. Tous droits réservés.</p>
        <p>Un projet par <a href="https://www.inthegleam.com" target="_blank" rel="noopener noreferrer" className="rounded-sm text-white/65 transition-colors hover:text-tertiary-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400">inTheGleam<span className="sr-only"> (nouvel onglet)</span></a></p>
      </div>
    </footer>
  );
}
