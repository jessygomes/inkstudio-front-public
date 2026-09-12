import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";
import type { PublicArticle } from "@/lib/actions/article.action";

export default function HomeJournalView({ articles }: { articles: PublicArticle[] }) {
  return (
    <section aria-labelledby="home-journal-title" className="bg-noir-700 py-16 font-one sm:py-24">
      <div className="mx-4 sm:mx-8 lg:mx-20">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs uppercase tracking-[0.2em] text-tertiary-400">Le journal Inkera</p><h2 id="home-journal-title" className="mt-4 font-two text-3xl font-semibold tracking-tight text-white sm:text-4xl">De quoi nourrir vos idées.</h2><p className="mt-3 text-base text-white/60">Explorez les dernières histoires du journal.</p></div>
          <AppButton href="/journal" variant="secondary" className="min-h-11 self-start sm:self-auto focus-visible:outline-2 focus-visible:outline-tertiary-400">Tous les articles</AppButton>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {articles.map((article) => {
            const date = new Date(article.createdAt);
            return <article key={article.id} className="flex min-w-0 flex-col">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-white/5">{article.imageUrls?.[0] ? <Image src={article.imageUrls[0]} alt={article.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" /> : <div className="flex h-full items-center justify-center text-sm uppercase tracking-widest text-white/35">Journal Inkera</div>}</div>
              <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/50"><span className="text-tertiary-400">{article.author}</span>{!Number.isNaN(date.getTime()) && <time dateTime={date.toISOString()}>{date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</time>}</div>
              <h3 className="mt-3 wrap-anywhere font-two text-xl font-medium leading-snug text-white sm:text-2xl">{article.title}</h3>
              <p className="mb-6 mt-3 line-clamp-3 wrap-anywhere text-sm leading-7 text-white/60">{article.content.replace(/(^|\n)#{1,3}\s*/g, "$1")}</p>
              <div className="mt-auto border-t border-white/10 pt-4"><AppButton href={`/journal/${article.id}`} variant="secondary" icon={<ArrowUpRight size={16} aria-hidden="true" />} aria-label={`Lire l’article : ${article.title}`} className="min-h-11 focus-visible:outline-2 focus-visible:outline-tertiary-400">Lire l’article</AppButton></div>
            </article>;
          })}
        </div>
      </div>
    </section>
  );
}

