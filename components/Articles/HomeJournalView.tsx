import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";
import type { PublicArticle } from "@/lib/actions/article.action";

function excerpt(content: string) {
  return content.replace(/<[^>]*>/g, " ").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/(^|\n)#{1,6}\s*/g, "$1").replace(/[*_~`]/g, "").replace(/\s+/g, " ").trim();
}

function JournalCard({ article, featured = false }: { article: PublicArticle; featured?: boolean }) {
  const date = new Date(article.createdAt);
  const image = article.imageUrls?.[0];
  const href = "/journal/" + article.id;

  return (
    <article className={featured
      ? "group grid min-w-0 gap-5 bg-noir-800 sm:grid-cols-[0.85fr_1.15fr]"
      : "group grid min-w-0 grid-cols-[72px_minmax(0,1fr)] gap-4 border-b border-white/10 bg-noir-800 pb-5 last:border-0 last:pb-0 sm:grid-cols-[88px_minmax(0,1fr)]"}>
      <Link href={href} aria-label={"Lire l’article : " + article.title} className={featured
        ? "relative block h-36 overflow-hidden rounded-2xl bg-noir-800 sm:h-full sm:min-h-56"
        : "relative block h-24 overflow-hidden rounded-xl bg-noir-800 sm:h-28"}>
        {image ? <Image src={image} alt="" fill sizes={featured ? "(min-width: 1024px) 22vw, (min-width: 640px) 35vw, 100vw" : "88px"} className="object-cover transition duration-500 motion-safe:group-hover:scale-105" />
          : <div className="absolute inset-0 flex items-center justify-center text-center font-two text-xs tracking-widest text-white/25">INKERA<br />JOURNAL</div>}
      </Link>
      <div className="flex min-w-0 flex-col items-start">
        {featured && <p className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-tertiary-400"><span className="size-1.5 rounded-full bg-tertiary-400" aria-hidden="true" />À la une</p>}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/55">
          <span>{article.author}</span>
          {!Number.isNaN(date.getTime()) && <time dateTime={date.toISOString()}>{date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" })}</time>}
        </div>
        <h3 className={featured ? "mt-2 line-clamp-3 wrap-anywhere font-two text-xl leading-snug text-white sm:text-[22px]" : "mt-2 line-clamp-2 wrap-anywhere font-two text-base leading-snug text-white"}>
          <Link href={href} className="transition-colors hover:text-tertiary-400">{article.title}</Link>
        </h3>
        <p className={featured ? "mb-4 mt-3 line-clamp-5 wrap-anywhere text-[13px] leading-6 text-white/60" : "mb-3 mt-2 line-clamp-2 wrap-anywhere text-xs leading-6 text-white/60"}>{excerpt(article.content)}</p>
        <div className="mt-auto"><AppButton href={href} variant="secondary" icon={<ArrowUpRight size={13} aria-hidden="true" />} aria-label={"Lire l’article : " + article.title} className="px-3! py-1.5! text-[11px]! shadow-none!">Lire l’article</AppButton></div>
      </div>
    </article>
  );
}

export default function HomeJournalView({ articles }: { articles: PublicArticle[] }) {
  const [latest, ...others] = [...articles]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  if (!latest) return null;

  return (
    <section aria-labelledby="home-journal-title" className="bg-noir-800 font-one">
      <div className="mx-4 sm:mx-8 lg:mx-20">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:mb-10 sm:flex-row sm:items-end">
          <div><p className="text-[11px] uppercase tracking-[0.2em] text-tertiary-400">Le journal Inkera</p><h2 id="home-journal-title" className="mt-3 whitespace-nowrap font-two text-[clamp(0.875rem,3.1vw,2.25rem)] font-medium uppercase leading-tight tracking-tight text-white">Un autre regard sur le tatouage<span className="text-tertiary-400">.</span></h2></div>
          <AppButton href="/journal" variant="secondary" icon={<ArrowUpRight size={14} aria-hidden="true" />} className="self-start px-4! text-xs! sm:self-auto">Tout le journal</AppButton>
        </div>
        <div className="grid items-start gap-7 lg:grid-cols-[1.3fr_1fr] lg:gap-8">
          <JournalCard article={latest} featured />
          {others.length > 0 && <div className="grid gap-5 border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">{others.map(article => <JournalCard key={article.id} article={article} />)}</div>}
        </div>
      </div>
    </section>
  );
}
