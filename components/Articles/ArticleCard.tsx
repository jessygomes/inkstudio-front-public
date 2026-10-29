import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Clock3 } from "lucide-react";
import type { PublicArticle } from "@/lib/actions/article.action";

function excerpt(content: string) {
  return content.replace(/<[^>]*>/g, " ").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/(^|\n)#{1,6}\s*/g, "$1").replace(/[*_~`]/g, "").replace(/\s+/g, " ").trim();
}

export default function ArticleCard({ article }: { article: PublicArticle }) {
  const date = new Date(article.createdAt);
  const hasDate = !Number.isNaN(date.getTime());
  const text = excerpt(article.content);
  const minutes = Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 200));
  return (
    <article className="group h-full min-w-0">
      <Link href={`/journal/${article.id}`} className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-linear-to-br from-white/[0.035] to-transparent transition-colors hover:border-tertiary-400/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400">
        <div className="relative aspect-[16/9] shrink-0 overflow-hidden bg-white/[0.025]">
          {article.imageUrls?.[0] ? <Image src={article.imageUrls[0]} alt="" fill sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" /> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-linear-to-br from-tertiary-400/10 to-transparent text-tertiary-400/40"><BookOpen size={28} aria-hidden="true" /><span className="text-[9px] uppercase tracking-[0.2em]">Le journal Inkera</span></div>}
          <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent" />
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] text-white/85 backdrop-blur-md"><Clock3 size={11} aria-hidden="true" />{minutes} min de lecture</span>
          <span aria-hidden="true" className="absolute right-3 top-3 grid size-8 place-items-center rounded-full border border-white/15 bg-black/25 text-white/80 backdrop-blur-sm transition-colors group-hover:bg-tertiary-400 group-hover:text-black"><ArrowUpRight size={16} /></span>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-white/40">{article.author && <span className="break-words text-white/60">{article.author}</span>}{article.author && hasDate && <span aria-hidden="true" className="size-0.5 rounded-full bg-white/25" />}{hasDate && <time dateTime={date.toISOString()}>{date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Paris" })}</time>}</div>
          <h3 className="line-clamp-2 wrap-anywhere text-base font-medium leading-snug tracking-tight text-white/90 transition-colors group-hover:text-tertiary-400 sm:text-lg">{article.title}</h3>
          <p className="mb-4 mt-2 line-clamp-2 wrap-anywhere text-xs leading-5 text-white/45">{text}</p>
          <div className="mt-auto flex items-center justify-between border-t border-white/8 pt-3 text-[11px]"><span className="text-white/60 transition-colors group-hover:text-white">Lire l’article</span><span className="text-tertiary-400/65" aria-hidden="true">Journal Inkera</span></div>
        </div>
      </Link>
    </article>
  );
}
