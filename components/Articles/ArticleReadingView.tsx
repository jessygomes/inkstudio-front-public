import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowUp, ArrowUpRight, Clock3, List, Newspaper } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";
import type { PublicArticle } from "@/lib/actions/article.action";

export default function ArticleReadingView({ article, headings, children }: {
  article: PublicArticle;
  headings: { id: string; title: string }[];
  children: ReactNode;
}) {
  const minutes = Math.max(1, Math.ceil(article.content.trim().split(/\s+/).filter(Boolean).length / 200));
  const date = new Date(article.createdAt);
  const hasDate = !Number.isNaN(date.getTime());
  const hasContents = headings.length > 1;
  return (
    <main id="article-top" className="scroll-mt-24 bg-noir-800 px-4 pb-16 pt-4 font-one sm:px-6 sm:pb-20 sm:pt-5 lg:px-10 xl:px-16">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Fil d’Ariane" className="mb-5 flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <Link href="/journal" className="inline-flex min-h-10 items-center gap-2 text-white/50 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400"><ArrowLeft size={14} aria-hidden="true" />Retour au journal</Link>
          <span className="flex items-center gap-2 text-white/30"><Newspaper size={13} aria-hidden="true" />Le journal Inkera</span>
        </nav>
        <article>
          <header className="max-w-4xl pb-6 sm:pb-8">
            <p className="mb-3 flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-tertiary-400"><span aria-hidden="true" className="h-px w-5 bg-tertiary-400/60" />À lire dans le journal</p>
            <h1 className="wrap-anywhere text-balance text-2xl font-medium leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">{article.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 text-[11px] text-white/40">
              {article.author && <span className="inline-flex min-w-0 items-center gap-2"><span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-[10px] text-tertiary-400">{article.author.trim().charAt(0).toUpperCase()}</span><span className="break-words text-white/75">{article.author}</span></span>}
              {hasDate && <time dateTime={date.toISOString()}>{date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" })}</time>}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.025] px-2.5 py-1 text-[10px]"><Clock3 size={12} aria-hidden="true" />{minutes} min de lecture</span>
            </div>
          </header>
          {article.imageUrls?.[0] && <figure className="relative mb-7 aspect-[16/10] overflow-hidden rounded-2xl border border-white/8 bg-white/5 sm:mb-10 sm:aspect-[21/9]">
            <Image src={article.imageUrls[0]} alt={article.title} fill priority sizes="(min-width: 1280px) 1152px, (min-width: 1024px) calc(100vw - 80px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)" className="object-cover" />
          </figure>}
          <div className={`grid items-start gap-6 border-t border-white/8 pt-6 sm:pt-8 ${hasContents ? "lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12" : ""}`}>
            {hasContents && <aside className="min-w-0 lg:sticky lg:top-28">
              <nav aria-label="Sommaire de l’article" className="rounded-2xl border border-white/8 bg-linear-to-br from-white/[0.035] to-transparent p-3.5">
                <details open>
                  <summary className="min-h-9 cursor-pointer text-xs font-medium text-white/80 focus-visible:outline-2 focus-visible:outline-tertiary-400"><span className="ml-1 inline-flex items-center gap-2"><List size={13} className="text-tertiary-400" aria-hidden="true" />Dans cet article</span></summary>
                  <ol className="mt-2 space-y-1">
                    {headings.map((heading, index) => <li key={heading.id}><a href={`#${heading.id}`} className="flex min-h-10 items-start gap-2.5 rounded-lg px-2 py-2 text-[11px] leading-5 text-white/45 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400"><span aria-hidden="true" className="text-[9px] tabular-nums text-tertiary-400/60">{String(index + 1).padStart(2, "0")}</span><span className="wrap-anywhere">{heading.title}</span></a></li>)}
                  </ol>
                </details>
              </nav>
            </aside>}
            <div className="mx-auto min-w-0 w-full max-w-[68ch] space-y-5 wrap-anywhere text-[15px] leading-8 text-white/65 sm:text-base sm:leading-8 [&>h2:first-child]:pt-0">
              {children}
            </div>
          </div>
          <footer className="mt-10 flex flex-col gap-4 rounded-2xl border border-white/8 bg-linear-to-br from-white/[0.035] to-transparent p-4 sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div><p className="text-sm font-medium text-white/85">Encore un peu d’inspiration ?</p><p className="mt-1 text-xs leading-5 text-white/40">D’autres histoires et conseils vous attendent dans le journal.</p></div>
            <div className="flex flex-wrap items-center gap-2">
              <AppButton href="#article-top" variant="secondary" aria-label="Revenir en haut de l’article" className="min-h-10 px-3! text-xs! shadow-none!"><ArrowUp size={14} aria-hidden="true" /></AppButton>
              <AppButton href="/journal" className="min-h-10 px-4! text-xs! shadow-none!">Explorer le journal<ArrowUpRight size={14} aria-hidden="true" /></AppButton>
            </div>
          </footer>
        </article>
      </div>
    </main>
  );
}
