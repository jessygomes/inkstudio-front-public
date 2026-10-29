import type { Metadata } from "next";
import Script from "next/script";
import { ArrowUpRight, CalendarDays, ChevronDown, CircleHelp, Clock3, HeartHandshake, LifeBuoy, Mail, MessagesSquare } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contactez-nous - Inkera | Support et assistance",
  description:
    "Une question, une suggestion ou besoin d'aide ? Contactez l'équipe Inkera. Support technique, partenariats, inscription salon. Réponse sous 24-48h.",
  keywords: [
    "contact inkera",
    "support tatouage",
    "aide salon tatouage",
    "inscription salon",
    "partenariat tatoueur",
    "assistance technique",
    "contact inkera",
    "support client",
  ],
  openGraph: {
    title: "Contactez-nous - Inkera | Support et assistance",
    description:
      "Une question, une suggestion ou besoin d'aide ? Contactez l'équipe Inkera pour un support personnalisé.",
    type: "website",
    locale: "fr_FR",
    url: "https://theinkera.com/contactez-nous",
    siteName: "Inkera",
    images: [
      {
        url: "https://theinkera.com/images/og-contact.jpg",
        width: 1200,
        height: 630,
        alt: "Contactez Inkera - Support et assistance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contactez-nous - Inkera",
    description:
      "Une question, une suggestion ou besoin d'aide ? Contactez l'équipe Inkera.",
    images: ["https://theinkera.com/images/og-contact.jpg"],
  },
  alternates: {
    canonical: "https://theinkera.com/contactez-nous",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contactez Inkera",
    description:
      "Page de contact et support pour la plateforme Inkera dédiée aux salons de tatouage",
    url: "https://theinkera.com/contactez-nous",
    mainEntity: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "contact@inkera-studio.com",
      name: "Support Inkera",
      description:
        "Support technique et commercial pour les salons de tatouage",
      availableLanguage: ["French"],
      areaServed: {
        "@type": "Country",
        name: "France",
      },
      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        description: "Réponse sous 24-48h ouvrées",
      },
    },
    about: [
      {
        "@type": "Service",
        name: "Support technique",
        description: "Assistance technique pour l'utilisation de la plateforme",
      },
      {
        "@type": "Service",
        name: "Inscription salon",
        description: "Accompagnement pour l'inscription des salons de tatouage",
      },
      {
        "@type": "Service",
        name: "Partenariats",
        description: "Opportunités de collaboration et partenariats",
      },
    ],
    provider: {
      "@type": "Organization",
      name: "Inkera",
      url: "https://theinkera.com",
    },
  };

  const email = "contact@inkera-studio.com";
  const channels = [
    { Icon: CircleHelp, title: "Une question sur Inkera", text: "Une idée, une suggestion ou une question sur la plateforme.", subject: "Question sur Inkera" },
    { Icon: LifeBuoy, title: "Besoin d’un coup de main", text: "Un problème de compte ou une difficulté technique ? Écrivez-nous.", subject: "Assistance Inkera" },
    { Icon: HeartHandshake, title: "Un projet à partager", text: "Inscription de votre salon, collaboration ou partenariat.", subject: "Projet et partenariat Inkera" },
  ];
  const questions = [
    { question: "Comment faire découvrir mon salon sur Inkera ?", answer: "Découvrez Inkera Studio pour les professionnels, ou écrivez-nous en précisant le nom de votre salon et votre ville. Nous pourrons vous guider dans vos premières étapes." },
    { question: "Quelles informations envoyer pour un problème technique ?", answer: "Décrivez ce qui se passe, la page concernée et les étapes qui provoquent le problème. Précisez aussi votre appareil et votre navigateur. N’envoyez jamais votre mot de passe." },
    { question: "Quand recevrai-je une réponse ?", answer: "Nous répondons généralement sous 24 à 48 heures ouvrées. Pour faciliter le suivi, utilisez un objet précis et regroupez les informations utiles dans votre message." },
    { question: "Puis-je contacter un tatoueur ici ?", answer: "Cette page permet de joindre l’équipe Inkera. Pour discuter d’un tatouage, connaître un tarif ou modifier un rendez-vous, contactez directement le salon ou l’artiste depuis son profil." },
  ];

  return (
    <>
      <Script id="contact-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-[65vh] bg-noir-800 px-4 pb-14 pt-4 font-one sm:px-6 sm:pb-20 sm:pt-5 lg:px-10 xl:px-16">
        <header className="flex items-start gap-3 py-1 sm:py-2">
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-tertiary-400/15 bg-tertiary-400/8 text-tertiary-400"><MessagesSquare size={17} aria-hidden="true" /></span>
          <div><p className="mb-1 text-[9px] uppercase tracking-[0.16em] text-white/35">Gardons le lien</p><h1 className="text-xl font-medium leading-tight tracking-tight text-white sm:text-2xl">Parlons de ce qui vous amène.</h1><p className="mt-1 text-xs leading-5 text-white/45">Une question, une idée ou besoin d’aide ? L’équipe Inkera est à votre écoute.</p></div>
        </header>

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
          <section aria-labelledby="contact-title" className="overflow-hidden rounded-2xl border border-white/8 bg-linear-to-br from-white/[0.035] to-transparent">
            <div className="border-b border-white/8 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3"><span className="grid size-10 place-items-center rounded-xl border border-tertiary-400/15 bg-tertiary-400/8 text-tertiary-400"><Mail size={19} aria-hidden="true" /></span><span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.025] px-2.5 py-1 text-[10px] text-white/45"><Clock3 size={11} aria-hidden="true" />24–48 h ouvrées</span></div>
              <h2 id="contact-title" className="mt-5 text-xl font-medium tracking-tight text-white/90 sm:text-2xl">Un message, et on échange.</h2>
              <p className="mt-2 max-w-md text-xs leading-6 text-white/45">Choisissez le sujet qui correspond à votre demande pour nous écrire directement depuis votre messagerie.</p>
              <a href={`mailto:${email}`} className="mt-4 inline-flex min-h-10 max-w-full items-center gap-2 text-sm text-tertiary-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400"><span className="break-all">{email}</span><ArrowUpRight size={15} className="shrink-0" aria-hidden="true" /></a>
            </div>
            <div className="space-y-2 p-3 sm:p-4">{channels.map(({ Icon, title, text, subject }) => <a key={title} href={`mailto:${email}?subject=${encodeURIComponent(subject)}`} className="group flex items-start gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-white/8 hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-tertiary-400"><span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-white/5 text-white/50 transition-colors group-hover:bg-tertiary-400/8 group-hover:text-tertiary-400"><Icon size={15} aria-hidden="true" /></span><div className="min-w-0 flex-1"><h3 className="text-xs font-medium text-white/85">{title}</h3><p className="mt-1 text-[11px] leading-5 text-white/40">{text}</p></div><ArrowUpRight size={14} aria-hidden="true" className="mt-1 shrink-0 text-white/25 transition-colors group-hover:text-tertiary-400" /></a>)}</div>
          </section>

          <div className="space-y-5">
            <section aria-labelledby="contact-faq-title" className="rounded-2xl border border-white/8 bg-white/[0.015] p-4 sm:p-5">
              <div className="mb-2 flex items-center gap-2"><CircleHelp size={16} className="text-tertiary-400/80" aria-hidden="true" /><h2 id="contact-faq-title" className="text-sm font-medium text-white/85">Une réponse vous attend peut-être ici.</h2></div>
              <div className="divide-y divide-white/8">{questions.map(({ question, answer }) => <details key={question} className="group"><summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-3 text-xs leading-5 text-white/65 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400 [&::-webkit-details-marker]:hidden"><span>{question}</span><ChevronDown size={14} aria-hidden="true" className="shrink-0 text-white/30 transition-transform group-open:rotate-180" /></summary><p className="pb-4 pr-5 text-xs leading-6 text-white/45">{answer}</p></details>)}</div>
            </section>
            <aside className="rounded-2xl border border-tertiary-400/15 bg-linear-to-br from-tertiary-400/[0.06] to-transparent p-4 sm:p-5">
              <div className="flex items-start gap-3"><CalendarDays size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-tertiary-400/80" /><div><h2 className="text-sm font-medium text-white/85">Votre prochain tatouage ?</h2><p className="mt-2 text-xs leading-6 text-white/45">Pour un projet, un devis ou un rendez-vous, le bon interlocuteur est votre artiste.</p><AppButton href="/trouver-un-salon" variant="secondary" className="mt-4 min-h-10 px-3! text-[11px]! shadow-none!">Trouver un salon ou un artiste<ArrowUpRight size={13} aria-hidden="true" /></AppButton></div></div>
            </aside>
          </div>
        </div>

        <aside className="mt-6 flex flex-col justify-between gap-4 border-t border-white/8 pt-5 sm:flex-row sm:items-center"><div><p className="text-xs font-medium text-white/65">Vous êtes tatoueur ou gérez un salon ?</p><p className="mt-1 text-[11px] leading-5 text-white/35">Découvrez les outils Inkera dédiés aux professionnels.</p></div><AppButton href="https://www.inkera-studio.com/" variant="secondary" className="min-h-10 self-start px-3! text-[11px]! shadow-none! sm:self-auto">Découvrir Inkera Studio<ArrowUpRight size={13} aria-hidden="true" /></AppButton></aside>
      </main>
    </>
  );
}
