import type { ReactNode } from "react";
import Image from "next/image";
import { Heart, Images, MessageCircle, Share2 } from "lucide-react";
import AuthBackButton from "./AuthBackButton";

const benefits = [
  { Icon: Images, title: "Vos moodboards", description: "Rassemblez vos inspirations." },
  { Icon: Share2, title: "Vos idées partagées", description: "Avec votre artiste ou vos proches." },
  { Icon: Heart, title: "Vos favoris", description: "Gardez vos coups de cœur." },
  { Icon: MessageCircle, title: "Le contact direct", description: "Échangez dans votre messagerie." },
];

export default function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <section className="grid h-dvh min-h-0 grid-cols-1 overflow-hidden bg-noir-800 font-one lg:grid-cols-2">
      <aside aria-label="Les avantages de votre compte Inkera" className="relative hidden h-full min-h-0 overflow-hidden lg:block">
        <Image src="/photos/Gorgeous.jpg" alt="" fill priority sizes="(min-width: 1024px) 50vw, 0px" className="object-cover object-top" />
        <div className="absolute inset-0 bg-linear-to-t from-noir-800 via-noir-800/70 to-noir-800/15" />
        <div className="absolute left-8 top-8 xl:left-12 xl:top-10"><Image src="/logo/logo_inline_people_white.png" alt="Inkera People" width={180} height={60} className="h-auto w-36" /></div>
        <div className="relative flex h-full flex-col justify-end p-8 xl:p-12">
          <p className="text-[11px] uppercase tracking-[0.2em] text-tertiary-400">Votre compte client gratuit</p>
          <h2 className="mt-3 max-w-md font-two text-3xl font-medium leading-tight tracking-tight text-white xl:text-4xl">Vos idées méritent<br />leur espace.</h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/70">L’inspiration se garde, les idées se partagent.<br />Votre prochain projet commence ici.</p>
          <div className="mt-7 grid max-w-lg grid-cols-2 gap-x-6 gap-y-5 border-t border-white/20 pt-6">{benefits.map(({ Icon, title, description }) => <div key={title} className="flex gap-2.5"><Icon size={17} strokeWidth={1.5} aria-hidden="true" className="mt-0.5 shrink-0 text-tertiary-400" /><div><h3 className="text-xs font-medium text-white/90">{title}</h3><p className="mt-1 text-[11px] leading-5 text-white/65">{description}</p></div></div>)}</div>
        </div>
      </aside>

      <div className="h-full min-h-0 overflow-y-auto overscroll-contain scheme-dark">
        <div className="flex min-h-full flex-col">
          <div className="sticky top-0 z-10 shrink-0 bg-noir-800/95 px-3 py-3 backdrop-blur-sm sm:px-6 sm:py-4 lg:px-8"><AuthBackButton /></div>
          <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center px-6 pb-10 pt-4 sm:px-8 sm:pb-12 xl:px-10">{children}</div>
        </div>
      </div>
    </section>
  );
}
