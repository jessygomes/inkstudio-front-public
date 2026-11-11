import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Clock3 } from "lucide-react";
import type { PublicArticle } from "@/lib/actions/article.action";

function excerpt(content: string) {
  return content.replace(/<[^>]*>/g, " ").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/(^|\n)#{1,6}\s*/g, "$1").replace(/[*_~`]/g, "").replace(/\s+/g, " ").trim();
}

function hasAuthor(author?: string | null) {
  return !!author && !/^(none|null|undefined)$/i.test(author.trim());
}

function meta(article: PublicArticle) {
  const date = new Date(article.createdAt);
  const text = excerpt(article.content);
  return {
    href: "/journal/" + article.id,
    image: article.imageUrls?.[0],
    text,
    minutes: Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 200)),
    date: Number.isNaN(date.getTime()) ? null : date,
  };
}

function Visual({ image, sizes, className }: { image?: string; sizes: string; className: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white/4 ${className}`}>
      {image
        ? <Image src={image} alt="" fill sizes={sizes} className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.04]" />
        : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-linear-to-br from-tertiary-400/20 via-tertiary-500/8 to-cuatro-500/15 text-tertiary-400/60"><BookOpen size={24} aria-hidden="true" /><span className="text-[10px] uppercase tracking-[0.2em]">Le journal Inkera</span></div>}
    </div>
  );
}

/** Article à la une : grande carte avec visuel, extrait et durée de lecture. */
function FeaturedCard({ article }: { article: PublicArticle }) {
  const { href, image, text, minutes, date } = meta(article);
  return (
    <Link href={href} className="group flex h-full flex-col rounded-3xl bg-noir-700 p-2 transition-colors hover:bg-noir-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400">
      <div className="relative">
        <Visual image={image} sizes="(min-width: 1024px) 55vw, 100vw" className="aspect-16/9" />
        <span className="absolute left-3 top-3 rounded-xl bg-linear-to-r from-tertiary-400 to-tertiary-500 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white">À la une</span>
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-5 sm:px-4">
        <p className="flex flex-wrap items-center gap-x-2 text-[11px] text-white/45">
          {date && <time dateTime={date.toISOString()} className="capitalize">{date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" })}</time>}
          <span aria-hidden="true">·</span><span className="inline-flex items-center gap-1"><Clock3 size={11} aria-hidden="true" />{minutes} min</span>
          {hasAuthor(article.author) && <><span aria-hidden="true">·</span><span className="text-white/65">{article.author}</span></>}
        </p>
        <h3 className="mt-2 line-clamp-2 wrap-anywhere font-two text-xl font-bold uppercase leading-snug tracking-wide text-white transition-colors group-hover:text-tertiary-400 sm:text-2xl">{article.title}</h3>
        {text && <p className="mt-3 line-clamp-3 wrap-anywhere text-sm leading-6 text-white/55">{text}</p>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-medium text-white/75 transition-colors group-hover:text-tertiary-400">Lire l’article<ArrowUpRight size={14} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
      </div>
    </Link>
  );
}

/** Article secondaire : visuel plein cadre, texte posé sur un dégradé (occupe toute la hauteur disponible). */
function CompactCard({ article }: { article: PublicArticle }) {
  const { href, image, minutes, date } = meta(article);
  return (
    <Link href={href} className="group relative flex min-h-56 overflow-hidden rounded-3xl bg-noir-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400 lg:min-h-0">
      {image
        ? <Image src={image} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.04]" />
        : <div aria-hidden="true" className="absolute inset-0 bg-linear-to-br from-tertiary-400/25 via-tertiary-500/10 to-cuatro-500/20" />}
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-noir-900/95 via-noir-900/50 to-transparent" />
      <div className="relative mt-auto flex w-full items-end justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 text-[11px] text-white/60">
            {date && <time dateTime={date.toISOString()}>{date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Paris" })}</time>}
            <span aria-hidden="true">·</span><span>{minutes} min</span>
          </p>
          <h3 className="mt-1.5 line-clamp-2 wrap-anywhere text-lg font-semibold leading-snug text-white transition-colors group-hover:text-tertiary-400">{article.title}</h3>
        </div>
        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-white backdrop-blur-md transition group-hover:bg-linear-to-br group-hover:from-tertiary-400 group-hover:to-tertiary-500"><ArrowUpRight size={16} /></span>
      </div>
    </Link>
  );
}

export default function HomeJournalView({ articles }: { articles: PublicArticle[] }) {
  const [latest, ...others] = [...articles]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  if (!latest) return null;

  return (
    <section aria-labelledby="home-journal-title" className="bg-noir-800 font-one">
      <div className="mx-page">
        <header className="mb-10 flex flex-col items-center text-center sm:mb-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/60">Le journal Inkera</p>
          <h2 id="home-journal-title" className="mt-1.5 font-two text-2xl font-bold uppercase leading-tight tracking-wide text-white sm:text-4xl">Un autre regard sur le tatouage</h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/55 sm:text-base sm:leading-7">Rencontres, conseils et coulisses : tout ce qui fait vivre le tatouage aujourd’hui.</p>
          <span aria-hidden="true" className="mt-6 h-px w-24 bg-linear-to-r from-transparent via-tertiary-400/70 to-transparent" />
        </header>

        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr] lg:gap-4">
          <FeaturedCard article={latest} />
          {others.length > 0 && <div className={`grid gap-3 lg:gap-4 ${others.length > 1 ? "lg:grid-rows-2" : ""}`}>{others.map(article => <CompactCard key={article.id} article={article} />)}</div>}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/journal" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/6 px-5 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400">Tout le journal<ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
