import Image from "next/image";
import { ArrowDown, ArrowUpRight, CalendarDays, Check, Compass, HeartHandshake, Images, Layers3, MessagesSquare, Search, ShieldCheck, Sparkles } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";

const chapters = [
  { id: "notre-vision", label: "Notre vision" },
  { id: "le-projet", label: "L’expérience Inkera" },
  { id: "nos-engagements", label: "Nos engagements" },
  { id: "rejoindre-inkera", label: "Nous rejoindre" },
];
const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-16";
const eyebrow = "flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-tertiary-400";
const title = "mt-4 text-balance text-3xl font-medium leading-[1.15] tracking-tight text-white sm:text-4xl";
const action = "min-h-11 px-4! text-xs! shadow-none! focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400";

export default function AboutContent() {
  return (
    <div className="bg-noir-800 font-one">
      <div className="border-b border-white/8">
        <nav aria-label="Découvrir Inkera" className={`${container} flex gap-6 overflow-x-auto sm:gap-10`}>
          {chapters.map((chapter, index) => <a key={chapter.id} href={`#${chapter.id}`} className="inline-flex min-h-16 shrink-0 items-center gap-2 border-b border-transparent text-[11px] text-white/50 transition-colors hover:border-tertiary-400 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-tertiary-400"><span aria-hidden="true" className="text-[9px] tabular-nums text-tertiary-400/65">0{index + 1}</span>{chapter.label}</a>)}
        </nav>
      </div>

      <section id="notre-vision" aria-labelledby="vision-title" className={`${container} scroll-mt-24 py-14 sm:py-20`}>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-16">
          <header><p className={eyebrow}><span aria-hidden="true" className="h-px w-5 bg-tertiary-400/50" />Notre point de départ</p><h2 id="vision-title" className={title}>Un tatouage se choisit.<br /><span className="text-white/40">Une connexion se ressent.</span></h2></header>
          <div className="max-w-xl space-y-4 text-sm leading-7 text-white/55 lg:pt-7"><p>Un style qui vous parle. Une création qui vous arrête. Un artiste avec qui vous vous sentez à l’aise. Nous croyons que ces détails font toute la différence.</p><p>Inkera est né de cette envie : donner aux salons et aux tatoueurs un espace où leur travail se découvre avec son histoire, sa sensibilité et toute sa singularité.</p></div>
        </div>
        <div className="mt-8 grid gap-4 lg:mt-10 lg:grid-cols-[1.15fr_0.85fr]">
          <figure className="relative min-h-64 overflow-hidden rounded-2xl bg-noir-500 sm:min-h-80">
            <Image src="/photos/complete.jpg" alt="Création tatouée illustrant la diversité des univers artistiques" fill sizes="(min-width: 1280px) 640px, (min-width: 1024px) 55vw, 100vw" className="object-cover" />
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
            <figcaption className="absolute bottom-5 left-5 right-5"><p className="text-[9px] uppercase tracking-[0.16em] text-white/55">Ce qui nous anime</p><p className="mt-2 max-w-sm text-xl font-medium leading-snug text-white sm:text-2xl">Tous les styles.<br />Toutes les histoires. Toutes les peaux.</p></figcaption>
          </figure>
          <div className="flex flex-col justify-between rounded-2xl border border-white/8 bg-linear-to-br from-tertiary-400/[0.065] via-white/[0.02] to-transparent p-5 sm:p-7">
            <span className="grid size-10 place-items-center rounded-xl border border-tertiary-400/15 bg-tertiary-400/8 text-tertiary-400"><Sparkles size={19} aria-hidden="true" /></span>
            <div className="mt-6"><h3 className="max-w-sm text-xl font-medium leading-snug text-white/90 sm:text-2xl">Faire découvrir le métier,<br />sans en lisser les différences.</h3><p className="mt-4 text-sm leading-7 text-white/50">Chaque studio a sa voix. Chaque artiste a son regard. Notre rôle est de leur donner de la place et de vous aider à trouver celui qui résonne avec votre projet.</p></div>
            <a href="#le-projet" className="mt-6 inline-flex min-h-10 items-center gap-2 self-start text-xs text-tertiary-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400">Et concrètement ?<ArrowDown size={13} aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <section id="le-projet" aria-labelledby="project-title" className="scroll-mt-24 border-y border-white/8 bg-white/[0.015]">
        <div className={`${container} py-14 sm:py-20`}>
          <header className="mb-8 max-w-2xl"><p className={eyebrow}><Compass size={13} aria-hidden="true" />L’expérience Inkera</p><h2 id="project-title" className={title}>Deux côtés d’une même rencontre.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/50">De l’idée au rendez-vous, un espace pour découvrir. Et, côté studio, des outils pour se consacrer à son métier.</p></header>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col rounded-2xl border border-white/8 bg-noir-800 p-5 sm:p-6">
              <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-tertiary-400/8 text-tertiary-400"><Search size={17} aria-hidden="true" /></span><div><p className="text-[9px] uppercase tracking-[0.14em] text-white/35">Vous avez un projet</p><h3 className="mt-1 text-lg font-medium text-white/90">Trouvez votre univers.</h3></div></div>
              <ol className="my-6 space-y-5">{[
                { title: "Laissez-vous inspirer", text: "Explorez les créations et repérez les styles qui vous attirent." },
                { title: "Découvrez celles et ceux qui les créent", text: "Parcourez les portfolios, les profils et les avis pour préparer votre choix." },
                { title: "Faites le premier pas", text: "Contactez le salon ou réservez en ligne lorsque cette option est proposée." },
              ].map((step, index) => <li key={step.title} className="flex gap-3"><span aria-hidden="true" className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-white/10 text-[9px] tabular-nums text-white/35">{index + 1}</span><div><h4 className="text-sm font-medium text-white/80">{step.title}</h4><p className="mt-1 text-xs leading-6 text-white/45">{step.text}</p></div></li>)}</ol>
              <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-white/8 pt-4"><AppButton href="/trouver-un-salon" className={action}>Trouver mon artiste<ArrowUpRight size={14} aria-hidden="true" /></AppButton><AppButton href="/inspiration" variant="secondary" className={action}><Images size={14} aria-hidden="true" />M’inspirer</AppButton></div>
            </div>
            <div className="flex flex-col rounded-2xl border border-white/8 bg-noir-800 p-5 sm:p-6">
              <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-white/5 text-white/70"><Layers3 size={17} aria-hidden="true" /></span><div><p className="text-[9px] uppercase tracking-[0.14em] text-white/35">Vous êtes professionnel</p><h3 className="mt-1 text-lg font-medium text-white/90">Faites vivre votre studio.</h3></div></div>
              <ul className="my-6 space-y-5">{[
                { Icon: Images, title: "Une vitrine à votre image", text: "Présentez votre équipe, votre portfolio et les informations de votre salon." },
                { Icon: CalendarDays, title: "Un quotidien mieux organisé", text: "Retrouvez vos disponibilités et vos rendez-vous au même endroit." },
                { Icon: MessagesSquare, title: "Le lien avec vos clients", text: "Préparez les projets et facilitez les échanges autour de chaque séance." },
              ].map(({ Icon, title: stepTitle, text }) => <li key={stepTitle} className="flex gap-3"><Icon size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-white/35" /><div><h4 className="text-sm font-medium text-white/80">{stepTitle}</h4><p className="mt-1 text-xs leading-6 text-white/45">{text}</p></div></li>)}</ul>
              <div className="mt-auto border-t border-white/8 pt-4"><AppButton href="https://www.inkera-studio.com/" variant="secondary" className={action}>Découvrir Inkera Studio<ArrowUpRight size={14} aria-hidden="true" /></AppButton></div>
            </div>
          </div>
          <p className="mt-5 flex items-start gap-2 text-[11px] leading-6 text-white/35"><HeartHandshake size={14} aria-hidden="true" className="mt-1 shrink-0 text-tertiary-400/60" />Une plateforme qui évolue à l’écoute des artistes, des salons et de leurs clients.</p>
        </div>
      </section>

      <section id="nos-engagements" aria-labelledby="commitments-title" className={`${container} scroll-mt-24 py-14 sm:py-20`}>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><header className="max-w-xl"><p className={eyebrow}><ShieldCheck size={13} aria-hidden="true" />Nos engagements</p><h2 id="commitments-title" className={title}>Le métier au centre.<br /><span className="text-white/40">La liberté tout autour.</span></h2></header><p className="max-w-sm text-sm leading-7 text-white/50">La technologie doit soutenir la création et respecter les personnes qui lui donnent vie.</p></div>
        <div className="mt-8 grid gap-6 border-t border-white/8 pt-7 sm:grid-cols-3 sm:gap-8">{[
          { Icon: Sparkles, title: "La singularité", text: "Mettre en lumière la diversité des styles, des parcours et des sensibilités. Chaque univers mérite sa place." },
          { Icon: ShieldCheck, title: "La clarté", text: "Rendre les informations faciles à trouver et les démarches plus simples, pour avancer dans son projet avec confiance." },
          { Icon: HeartHandshake, title: "L’écoute", text: "Construire avec les professionnels et leurs clients. Faire évoluer les outils à partir de leurs besoins réels." },
        ].map(({ Icon, title: valueTitle, text }) => <div key={valueTitle}><Icon size={19} aria-hidden="true" className="mb-4 text-tertiary-400/80" /><h3 className="text-base font-medium text-white/85">{valueTitle}</h3><p className="mt-2 text-xs leading-6 text-white/45">{text}</p></div>)}</div>
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-5 sm:mt-10 sm:p-6 lg:flex-row lg:items-center lg:justify-between"><p className="text-sm font-medium text-white/80">Votre studio, vos choix.</p><ul className="flex flex-wrap gap-x-5 gap-y-3">{["Vos informations", "Votre univers artistique", "Vos disponibilités"].map(item => <li key={item} className="flex items-center gap-1.5 text-[11px] text-white/50"><Check size={13} aria-hidden="true" className="text-tertiary-400/75" />{item}</li>)}</ul></div>
      </section>

      <section id="rejoindre-inkera" aria-labelledby="join-title" className={`${container} scroll-mt-24 pb-14 sm:pb-20`}>
        <div className="relative isolate overflow-hidden rounded-3xl border border-tertiary-400/15 bg-linear-to-br from-tertiary-400/[0.09] via-noir-500/60 to-noir-800 p-6 sm:p-10">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full border border-tertiary-400/10" /><div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-16 size-56 rounded-full border border-tertiary-400/10" />
          <div className="relative grid gap-7 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-14"><div><p className={eyebrow}>La suite s’écrit ensemble</p><h2 id="join-title" className={title}>Votre univers a sa place ici.</h2><p className="mt-4 max-w-lg text-sm leading-7 text-white/50">Un projet à imaginer, un studio à faire découvrir ou une question sur Inkera ? Choisissez votre prochaine étape.</p></div><div className="flex flex-col items-stretch gap-3 lg:items-start"><AppButton href="https://www.inkera-studio.com/" className={action}>Je suis professionnel<ArrowUpRight size={15} aria-hidden="true" /></AppButton><AppButton href="/contactez-nous" variant="secondary" className={action}>Échanger avec l’équipe<MessagesSquare size={14} aria-hidden="true" /></AppButton><a href="/inspiration" className="inline-flex min-h-10 items-center gap-2 self-center text-xs text-white/50 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400 lg:self-start">Juste envie d’explorer ? Trouvez l’inspiration<ArrowUpRight size={13} aria-hidden="true" /></a></div></div>
        </div>
      </section>
    </div>
  );
}
