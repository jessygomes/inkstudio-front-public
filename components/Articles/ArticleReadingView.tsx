import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowUp, Clock, UserRound } from "lucide-react";
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
    <section id="article-top" className="scroll-mt-24 bg-noir-700 px-4 pb-16 pt-20 font-one sm:px-8 sm:pb-24 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Fil d’Ariane" className="mb-8 flex items-center gap-2 text-xs text-white/50 sm:mb-12">
          <Link href="/" className="inline-flex min-h-11 items-center hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400">Accueil</Link>
          <span aria-hidden="true">/</span>
          <Link href="/journal" className="inline-flex min-h-11 items-center hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400">Journal</Link>
          <span aria-hidden="true">/</span><span aria-current="page" className="text-white/80">Article</span>
        </nav>
        <article>
          <header className="mb-8 sm:mb-10">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-tertiary-400">Le journal Inkera</p>
            <h1 className="max-w-7xl wrap-anywhere text-balance font-two text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">{article.title}</h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/60 sm:mt-8">
              {article.author && <span className="inline-flex items-center gap-2 text-white/85"><UserRound size={16} aria-hidden="true" className="text-tertiary-400" />{article.author}</span>}
              {hasDate && <time dateTime={date.toISOString()}>Publié le {date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</time>}
              <span className="inline-flex items-center gap-2"><Clock size={15} aria-hidden="true" />{minutes} min de lecture</span>
            </div>
          </header>
          {article.imageUrls?.[0] && <figure className="relative mb-10 aspect-[4/3] overflow-hidden rounded-xl bg-white/5 sm:mb-14 sm:aspect-[21/9]">
            <Image src={article.imageUrls[0]} alt={article.title} fill priority sizes="(min-width: 1440px) 1280px, (min-width: 1024px) calc(100vw - 160px), (min-width: 640px) calc(100vw - 64px), calc(100vw - 32px)" className="object-cover" />
          </figure>}
          <div className={`grid items-start gap-8 border-t border-white/10 pt-8 sm:pt-10 ${hasContents ? "lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14" : ""}`}>
            {hasContents && <aside className="min-w-0 lg:sticky lg:top-28">
              <nav aria-label="Sommaire de l’article">
                <details open className="border-b border-white/10 pb-5 lg:border-b-0">
                  <summary className="min-h-11 cursor-pointer text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-tertiary-400">Dans cet article</summary>
                  <ol className="mt-2 space-y-1 border-l border-white/15">
                    {headings.map((heading, index) => <li key={heading.id}><a href={`#${heading.id}`} className="flex min-h-11 items-start gap-3 border-l-2 border-transparent px-4 py-2 text-sm leading-6 text-white/60 transition-colors hover:border-tertiary-400 hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400"><span aria-hidden="true" className="text-xs leading-6 text-tertiary-400/75">{String(index + 1).padStart(2, "0")}</span><span className="wrap-anywhere">{heading.title}</span></a></li>)}
                  </ol>
                </details>
              </nav>
            </aside>}
            <div className="mx-auto min-w-0 w-full max-w-[70ch] space-y-5 wrap-anywhere text-base leading-8 text-white/80 sm:text-lg sm:leading-9">
              {children}
            </div>
          </div>
          <footer className="mt-12 flex flex-col gap-5 border-t border-white/10 pt-6 sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-lg text-white">Poursuivez votre lecture</p><p className="mt-1 text-sm text-white/55">Retrouvez les autres articles du journal Inkera.</p></div>
            <div className="flex flex-wrap items-center gap-3">
              <AppButton href="#article-top" variant="secondary" icon={<ArrowUp size={16} aria-hidden="true" />} className="min-h-11 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400">En haut</AppButton>
              <AppButton href="/journal" icon={<ArrowLeft size={16} aria-hidden="true" />} className="min-h-11 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400">Tous les articles</AppButton>
            </div>
          </footer>
        </article>
      </div>
    </section>
  );
}
