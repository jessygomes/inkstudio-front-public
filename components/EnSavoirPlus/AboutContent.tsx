import Image from "next/image";
import { ArrowDown, ArrowUpRight, CalendarDays, Check, HeartHandshake, Images, Search, Sparkles } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";

const chapters = [
  { id: "notre-vision", label: "Notre vision" },
  { id: "le-projet", label: "Le projet" },
  { id: "nos-engagements", label: "Nos engagements" },
  { id: "rejoindre-inkera", label: "Nous rejoindre" },
];
const labelClass = "text-xs uppercase tracking-[0.18em] text-tertiary-400";
const titleClass = "mt-4 text-balance font-two text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl";

export default function AboutContent() {
  return (
    <div className="bg-noir-700 font-one">
      {/* <div className="border-y border-white/10">
        <nav aria-label="Découvrir Inkera" className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 sm:gap-10 sm:px-8 lg:px-12">
          {chapters.map((chapter, index) => <a key={chapter.id} href={`#${chapter.id}`} className="inline-flex min-h-16 shrink-0 items-center gap-2 border-b-2 border-transparent py-4 text-sm text-white/65 transition-colors hover:border-tertiary-400 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-tertiary-400"><span aria-hidden="true" className="text-xs text-tertiary-400">0{index + 1}</span>{chapter.label}</a>)}
        </nav>
      </div> */}

      <section id="notre-vision" aria-labelledby="vision-title" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
          <div>
            <p className={labelClass}>01 — Notre vision</p>
            <h2 id="vision-title" className={titleClass}>Une place pour chaque artiste.<br /><span className="text-white/50">Une histoire derrière chaque tatouage.</span></h2>
          </div>
          <div className="max-w-xl space-y-4 text-base leading-8 text-white/65">
            <p>Inkera est né d’une envie : offrir aux salons de tatouage et de piercing une vitrine claire, crédible et durable. Un espace où les créations gardent leur contexte et où chaque univers artistique peut s’exprimer.</p>
            <p>Le tatouage traverse les âges, les genres et les cultures. Notre ambition est de représenter cette diversité, pour que chacun puisse se reconnaître et trouver sa place.</p>
          </div>
        </div>
        <div className="mt-10 grid gap-8 sm:mt-14 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-noir-500 sm:aspect-[3/2]">
            <Image src="/photos/complete.jpg" alt="" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
          <div className="border-l-2 border-tertiary-400 pl-6 sm:pl-8">
            <Sparkles size={24} aria-hidden="true" className="mb-5 text-tertiary-400" />
            <h3 className="text-balance font-two text-2xl font-medium leading-snug text-white sm:text-3xl">Faire rayonner le métier, dans toute sa diversité.</h3>
            <p className="mt-4 text-base leading-8 text-white/65">Un outil clair, puissant et utile, pensé pour servir le métier sans l’uniformiser. Chaque studio conserve son identité, sa sensibilité et son lien avec ses clients.</p>
          </div>
        </div>
      </section>

      <section id="le-projet" aria-labelledby="project-title" className="scroll-mt-24 border-y border-white/10 bg-noir-500/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            <header>
              <p className={labelClass}>02 — Le projet</p>
              <h2 id="project-title" className={titleClass}>Du premier regard<br />au rendez-vous.</h2>
              <p className="mt-5 max-w-lg text-base leading-8 text-white/65">Inkera relie la découverte d’un salon à sa gestion quotidienne. Une seule plateforme pour sa présence publique, son portfolio et sa relation client.</p>
              <p className="mt-6 inline-flex items-center gap-2 text-sm text-tertiary-400"><ArrowDown size={16} aria-hidden="true" />Pensé pour les salons et leurs clients</p>
            </header>
            <ol className="divide-y divide-white/10 border-y border-white/10">
              {[
                { Icon: Search, title: "Trouver son univers", description: "Rechercher un salon par style, ville ou artiste pour découvrir les professionnels qui correspondent à son projet." },
                { Icon: Images, title: "Découvrir le travail de l’artiste", description: "Explorer les portfolios, comprendre les univers visuels et donner du contexte aux créations." },
                { Icon: CalendarDays, title: "Préparer la rencontre", description: "Faciliter la prise de rendez-vous et centraliser les échanges pour une relation plus fluide avec le salon." },
              ].map(({ Icon, title, description }, index) => <li key={title} className="flex gap-4 py-6 sm:gap-6 sm:py-8">
                <span aria-hidden="true" className="pt-1 text-xs text-white/40">0{index + 1}</span>
                <div className="min-w-0 flex-1"><h3 className="flex items-center gap-3 font-two text-xl font-medium text-white"><Icon size={20} aria-hidden="true" className="shrink-0 text-tertiary-400" />{title}</h3><p className="mt-3 text-sm leading-7 text-white/65 sm:text-base">{description}</p></div>
              </li>)}
            </ol>
          </div>
          <div className="mt-10 border-t border-white/10 pt-6 sm:mt-14 sm:flex sm:gap-10">
            <h3 className="shrink-0 text-sm font-medium text-white">Un projet construit ensemble</h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55 sm:mt-0">Nous construisons la plateforme avec les premiers salons, à l’écoute de leurs besoins et de ceux de leurs clients. L’annuaire a vocation à s’ouvrir avec suffisamment de salons pour offrir une expérience riche et pertinente.</p>
          </div>
        </div>
      </section>

      <section id="nos-engagements" aria-labelledby="commitments-title" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-20">
          <header>
            <p className={labelClass}>03 — Nos engagements</p>
            <h2 id="commitments-title" className={titleClass}>Le cadre évolue.<br />Votre identité reste.</h2>
            <p className="mt-5 max-w-lg text-base leading-8 text-white/65">La technologie doit soutenir votre travail et respecter ce qui le rend singulier. Inkera veut réconcilier structure, visibilité et liberté artistique.</p>
          </header>
          <div>
            <h3 className="mb-3 text-base font-medium text-white">Votre salon garde la main sur</h3>
            <ul className="divide-y divide-white/10">
              {["Ses informations publiques", "Son portfolio et son univers artistique", "Ses disponibilités et ses rendez-vous"].map((item) => <li key={item} className="flex items-center gap-3 py-4 text-base text-white/75"><Check size={18} aria-hidden="true" className="shrink-0 text-tertiary-400" />{item}</li>)}
            </ul>
          </div>
        </div>
        <div className="mt-10 grid gap-8 border-t border-white/10 pt-8 sm:mt-14 sm:grid-cols-3 sm:gap-10">
          {[
            { title: "Transparence", description: "Une relation plus claire entre salons, artistes et clients, avec des informations accessibles et une présence lisible." },
            { title: "Passion et respect", description: "Valoriser la richesse des styles et des personnes, en respectant la sensibilité de chaque studio." },
            { title: "Écoute et évolution", description: "Faire grandir l’outil avec les professionnels pour répondre aux réalités de leur métier." },
          ].map((item) => <div key={item.title}><h3 className="font-two text-xl font-medium text-white">{item.title}</h3><p className="mt-3 text-sm leading-7 text-white/60">{item.description}</p></div>)}
        </div>
      </section>

      <section id="rejoindre-inkera" aria-labelledby="join-title" className="scroll-mt-24 border-t border-white/10 bg-linear-to-br from-secondary-500/60 via-noir-700 to-noir-700">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-16 lg:px-12">
          <div>
            <p className={labelClass}>04 — La suite, ensemble</p>
            <h2 id="join-title" className={titleClass}>Prenez part à l’aventure.</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/65">Vous partagez cette vision ? Découvrez l’application dédiée aux professionnels ou échangez avec nous sur le projet.</p>
          </div>
          <div className="flex flex-col items-stretch gap-4 lg:items-start">
            <AppButton href="https://www.inkera-studio.com/" icon={<ArrowUpRight size={18} aria-hidden="true" />} className="min-h-12 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400">Découvrir l’application</AppButton>
            <AppButton href="/contactez-nous" variant="secondary" icon={<HeartHandshake size={18} aria-hidden="true" />} className="min-h-12 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400">Échanger avec nous</AppButton>
          </div>
        </div>
      </section>
    </div>
  );
}
