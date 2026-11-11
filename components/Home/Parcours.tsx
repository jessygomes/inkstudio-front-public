import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";
import styles from "./Parcours.module.css";

const steps = [
  { label: "L’inspiration", title: "Tout commence par une envie.", description: "Explorez les créations, comparez les styles et repérez ce qui vous parle. Enregistrez vos coups de cœur dans un moodboard pour préciser vos envies.", image: "/photos/recherche.jpg", href: "/inspiration", action: "Explorer les tatouages" },
  { label: "La rencontre", title: "Rencontrez votre artiste.", description: "Recherchez par ville et par style, puis découvrez les portfolios et les avis. Prenez le temps de trouver l’artiste dont l’univers correspond au vôtre.", image: "/photos/yddd.jpg", href: "/trouver-un-salon", action: "Découvrir les artistes" },
  { label: "Le rendez-vous", title: "Place à votre projet.", description: "Depuis le profil de votre artiste, présentez votre projet, joignez votre moodboard ou vos inspirations et demandez un rendez-vous. Le salon vous répondra pour préparer la suite.", image: "/photos/reserve.jpg", href: "/trouver-un-salon", action: "Commencer mon projet" },
];

export default function Parcours() {
  return (
    <section aria-labelledby="journey-title" className="bg-noir-800 font-one">
      <div className="mx-page">
        {/* En-tête centré, dans la continuité du hero (même typographie, même axe). */}
        <header className="mx-auto mb-10 flex max-w-2xl flex-col items-center text-center sm:mb-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/60">Un projet qui vous ressemble</p>
          <h2 id="journey-title" className="mt-1.5 font-two text-2xl font-bold uppercase leading-tight tracking-wide text-white sm:text-4xl">
            De l’idée au rendez-vous
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/55 sm:text-base sm:leading-7">Une inspiration, une rencontre, un premier pas. La suite s’écrit avec votre artiste.</p>
          <span aria-hidden="true" className="mt-6 h-px w-24 bg-linear-to-r from-transparent via-tertiary-400/70 to-transparent" />
        </header>

        <ol className={styles.panels}>
          {steps.map((step, index) => (
            <li key={step.label} tabIndex={0} aria-labelledby={"journey-step-" + index} className={styles.panel}>
              <Image src={step.image} alt="" fill sizes="(min-width: 768px) 55vw, 100vw" className={styles.image} />
              <div aria-hidden="true" className={styles.overlay} />
              <span aria-hidden="true" className="absolute left-5 top-5 grid size-9 place-items-center rounded-xl bg-noir-900/45 font-two text-xs font-bold text-white backdrop-blur-md">0{index + 1}</span>
              <div className={styles.content}>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-tertiary-400">{step.label}</p>
                <h3 id={"journey-step-" + index} className="mt-2 max-w-sm font-two text-xl font-bold uppercase leading-snug tracking-wide text-white sm:text-2xl">{step.title}</h3>
                <div className={styles.details}>
                  <div className="min-h-0 overflow-hidden">
                    <p className="mt-3 max-w-sm text-sm leading-6 text-white/80">{step.description}</p>
                  </div>
                </div>
                <AppButton href={step.href} variant="secondary" icon={<ArrowUpRight size={14} aria-hidden="true" />} className="mt-5 min-h-10! rounded-xl! border-0! bg-white/10! px-4! text-xs! backdrop-blur-md hover:bg-white/20!">{step.action}</AppButton>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
