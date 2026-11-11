import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Clock3 } from "lucide-react";
import type { PublicArticle } from "@/lib/actions/article.action";

function excerpt(content: string) {
  return content.replace(/<[^>]*>/g, " ").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/(^|\n)#{1,6}\s*/g, "$1").replace(/[*_~`]/g, "").replace(/\s+/g, " ").trim();
}

export default function ArticleCard({ article }: { article: PublicArticle }) {
  const hasAuthor = !!article.author && !/^(none|null|undefined)$/i.test(article.author.trim());
  const date = new Date(article.createdAt);
  const hasDate = !Number.isNaN(date.getTime());
  const text = excerpt(article.content);
  const minutes = Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 200));
  return (
    <article className="group h-full min-w-0">
      <Link href={`/journal/${article.id}`} className="flex h-full flex-col rounded-3xl bg-noir-700 p-2 font-one transition-colors hover:bg-noir-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400">
        {/* Visuel */}
        <div className="relative aspect-16/10 shrink-0 overflow-hidden rounded-2xl bg-white/4">
          {article.imageUrls?.[0]
            ? <Image src={article.imageUrls[0]} alt="" fill sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.04]" />
            : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-linear-to-br from-tertiary-400/20 via-tertiary-500/8 to-cuatro-500/15 text-tertiary-400/60"><BookOpen size={28} aria-hidden="true" /><span className="text-[10px] uppercase tracking-[0.2em]">Le journal Inkera</span></div>}
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-xl bg-noir-900/50 px-2.5 py-1 text-[10px] text-white/85 backdrop-blur-md"><Clock3 size={11} aria-hidden="true" />{minutes} min</span>
        </div>

        {/* Texte */}
        <div className="flex flex-1 flex-col px-2.5 pb-2 pt-4">
          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/45">
            {hasDate && <time dateTime={date.toISOString()} className="capitalize">{date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" })}</time>}
            {hasAuthor && hasDate && <span aria-hidden="true">·</span>}
            {hasAuthor && <span className="break-words text-white/65">{article.author}</span>}
          </div>
          <h3 className="line-clamp-2 wrap-anywhere text-lg font-semibold leading-snug tracking-tight text-white transition-colors group-hover:text-tertiary-400">{article.title}</h3>
          {text && <p className="mt-2 line-clamp-3 wrap-anywhere text-sm leading-6 text-white/50">{text}</p>}
          <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-medium text-white/70 transition-colors group-hover:text-tertiary-400">Lire l’article<ArrowUpRight size={14} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
        </div>
      </Link>
    </article>
  );
}
