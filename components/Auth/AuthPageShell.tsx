import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, Images, MessageCircle } from "lucide-react";

export default function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-[calc(100svh-5rem)] bg-noir-800 px-4 pb-14 pt-5 font-one sm:px-8 sm:pb-20 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-sm text-xs text-white/55 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400"><ArrowLeft size={14} aria-hidden="true" />Retour à l’accueil</Link>
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16 xl:gap-24">
          <aside aria-label="Votre espace Inkera" className="relative hidden min-h-[560px] overflow-hidden rounded-2xl bg-noir-800 lg:sticky lg:top-28 lg:block">
            <Image src="/photos/Gorgeous.jpg" alt="" fill sizes="(min-width: 1024px) 45vw, 0px" className="object-cover object-top" />
            <div className="absolute inset-0 bg-linear-to-t from-noir-800 via-noir-800/65 to-noir-800/15" />
            <div className="relative flex min-h-[560px] flex-col justify-end p-8">
              <p className="text-[11px] uppercase tracking-[0.2em] text-tertiary-400">Inkera People</p>
              <h2 className="mt-3 font-two text-4xl font-medium leading-tight tracking-tight text-white">Vos idées méritent<br />leur espace.</h2>
              <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">Un coup de cœur, un moodboard, une rencontre. Retrouvez tout ce qui fait avancer votre prochain tatouage.</p>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/15 pt-5 text-xs text-white/75">{[{ Icon: Images, label: "Moodboards" }, { Icon: Heart, label: "Favoris" }, { Icon: MessageCircle, label: "Messagerie" }].map(({ Icon, label }) => <span key={label} className="flex items-center gap-2"><Icon size={14} aria-hidden="true" className="text-tertiary-400" />{label}</span>)}</div>
            </div>
          </aside>
          <div className="mx-auto w-full max-w-lg rounded-2xl border border-white/10 bg-noir-800 p-5 sm:p-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
