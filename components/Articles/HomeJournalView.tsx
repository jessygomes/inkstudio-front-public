import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Clock3 } from "lucide-react";
import type { PublicArticle } from "@/lib/actions/article.action";

function excerpt(content: string) {
  return content.replace(/<[^>]*>/g, " ").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/(^|\n)#{1,6}\s*/g, "$1").replace(/[*_~`]/g, "").replace(/\s+/g, " ").trim();
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

/** Carte d'article compacte : petit visuel, date et titre. Les trois cartes ont la même taille. */
function JournalCard({ article, featured = false }: { article: PublicArticle; featured?: boolean }) {
  const { href, image, minutes, date } = meta(article);
  return (
    <Link href={href} className="group flex h-full items-center gap-4 rounded-3xl bg-noir-700 p-2 pr-4 transition-colors hover:bg-noir-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400 lg:flex-col lg:items-stretch lg:gap-0 lg:pr-2">
      <div className="relative shrink-0">
        <Visual image={image} sizes="(min-width: 1024px) 30vw, 112px" className="aspect-square w-24 sm:w-28 lg:aspect-16/9 lg:w-full" />
        {featured && <span className="absolute left-2 top-2 hidden rounded-xl bg-linear-to-r from-tertiary-400 to-tertiary-500 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white lg:block">À la une</span>}
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-1 lg:px-2.5 lg:pb-2 lg:pt-3.5">
        <p className="flex flex-wrap items-center gap-x-2 text-[11px] text-white/45">
          {featured && <span className="font-medium text-tertiary-400 lg:hidden">À la une</span>}
          {date && <time dateTime={date.toISOString()}>{date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Paris" })}</time>}
          <span aria-hidden="true">·</span><span className="inline-flex items-center gap-1"><Clock3 size={11} aria-hidden="true" />{minutes} min</span>
        </p>
        <h3 className="mt-1.5 line-clamp-2 wrap-anywhere text-[15px] font-semibold leading-snug text-white transition-colors group-hover:text-tertiary-400">{article.title}</h3>
      </div>
    </Link>
  );
}

export default function HomeJournalView({ articles }: { articles: PublicArticle[] }) {
  const latest = [...articles]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  if (!latest.length) return null;

  return (
    <section aria-labelledby="home-journal-title" className="bg-noir-800 font-one">
      <div className="mx-page">
        <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/60">Le journal Inkera</p>
            <h2 id="home-journal-title" className="mt-1.5 font-two text-2xl font-bold uppercase leading-tight tracking-wide text-white sm:text-3xl">Un autre regard sur le tatouage</h2>
          </div>
          <Link href="/journal" className="inline-flex min-h-10 shrink-0 items-center gap-2 self-start rounded-xl bg-white/6 px-4 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400 sm:self-auto">Tout le journal<ArrowUpRight size={15} aria-hidden="true" /></Link>
        </header>
        <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
          {latest.map((article, index) => <JournalCard key={article.id} article={article} featured={index === 0} />)}
        </div>
      </div>
    </section>
  );
}
