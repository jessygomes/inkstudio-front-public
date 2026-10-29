import type { Metadata } from "next";
import { BookOpen, Newspaper } from "lucide-react";
import { getPublicArticlesAction } from "@/lib/actions/article.action";
import FinalCtaSection from "@/components/Home/FinalCtaSection";
import ArticleCard from "@/components/Articles/ArticleCard";

export const metadata: Metadata = {
  title: "Le journal - Inkera",
  description: "Conseils, inspirations et tendances autour du tatouage dans le journal Inkera.",
};

export default async function ArticlesPage() {
  let articles = [] as Awaited<ReturnType<typeof getPublicArticlesAction>>;
  let errorMessage = "";
  try {
    articles = await getPublicArticlesAction();
  } catch {
    errorMessage = "Le journal n’est pas disponible pour le moment. Réessayez dans quelques instants.";
  }

  return (
    <>
      <main className="min-h-[60vh] w-full bg-noir-800 px-4 pb-16 pt-4 font-one sm:px-6 sm:pt-5 lg:px-10 xl:px-16">
        <header className="flex items-start gap-3 py-1 sm:py-2">
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-tertiary-400/15 bg-tertiary-400/8 text-tertiary-400"><Newspaper size={17} aria-hidden="true" /></span>
          <div><p className="mb-1 text-[9px] uppercase tracking-[0.16em] text-white/35">Un autre regard sur le tatouage</p><h1 className="text-xl font-medium leading-tight tracking-tight text-white sm:text-2xl">Le journal Inkera</h1><p className="mt-1 text-xs leading-5 text-white/45">Conseils, histoires et inspirations pour accompagner votre prochain projet.</p></div>
        </header>

        <div className="mb-5 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
          <h2 className="text-sm font-medium text-white/80">À découvrir dans le journal</h2>
          {!errorMessage && <p role="status" className="rounded-full border border-white/8 bg-white/[0.025] px-2.5 py-1 text-[10px] text-white/45">{articles.length} article{articles.length > 1 ? "s" : ""}</p>}
        </div>
        {errorMessage && <div role="alert" className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 text-center text-sm leading-6 text-white/60">{errorMessage}</div>}
        {!errorMessage && !articles.length && <div className="rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center"><BookOpen size={26} aria-hidden="true" className="mx-auto mb-3 text-tertiary-400/60" /><p className="text-sm text-white/80">Le journal prépare ses prochaines histoires.</p><p className="mt-2 text-xs text-white/40">Retrouvez bientôt nos conseils et inspirations autour du tatouage.</p></div>}
        {!!articles.length && <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{articles.map(article => <ArticleCard key={article.id} article={article} />)}</div>}
      </main>
      <FinalCtaSection />
    </>
  );
}
