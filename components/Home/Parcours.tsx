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
      <div className="mx-4 sm:mx-8 lg:mx-20">
        <div className="mb-7 flex flex-col justify-between gap-4 2xl:flex-row 2xl:items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-tertiary-400">Un projet qui vous ressemble</p>
            <h2 id="journey-title" className="mt-3 font-two text-3xl font-medium leading-tight tracking-tight text-white sm:text-4xl">De l’idée au rendez-vous<span className="text-tertiary-400">.</span></h2>
          </div>
          <p className="hidden text-sm leading-7 text-white/60 md:block md:whitespace-nowrap">Une inspiration, une rencontre, un premier pas. La suite s’écrit avec votre artiste.</p>
        </div>

        <ol className={styles.panels}>
          {steps.map((step, index) => (
            <li key={step.label} tabIndex={0} aria-labelledby={"journey-step-" + index} className={styles.panel}>
              <Image src={step.image} alt="" fill sizes="(min-width: 768px) 55vw, 100vw" className={styles.image} />
              <div aria-hidden="true" className={styles.overlay} />
              <span aria-hidden="true" className="absolute left-5 top-5 rounded-lg border border-white/20 bg-noir-800/65 px-2.5 py-1 text-xs text-white/80 backdrop-blur-sm">0{index + 1}</span>
              <div className={styles.content}>
                <p className="text-[10px] uppercase tracking-[0.16em] text-tertiary-400">{step.label}</p>
                <h3 id={"journey-step-" + index} className="mt-2 max-w-sm font-two text-2xl leading-snug text-white">{step.title}</h3>
                <div className={styles.details}>
                  <div className="min-h-0 overflow-hidden">
                    <p className="mt-3 max-w-sm text-sm leading-6 text-white/80">{step.description}</p>
                  </div>
                </div>
                <AppButton href={step.href} variant="secondary" icon={<ArrowUpRight size={14} aria-hidden="true" />} className="mt-4 px-4! text-xs!">{step.action}</AppButton>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
