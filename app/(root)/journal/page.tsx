import type { Metadata } from "next";
import { getPublicArticlesAction } from "@/lib/actions/article.action";
import FinalCtaSection from "@/components/Home/FinalCtaSection";
import ArticleCard from "@/components/Articles/ArticleCard";

export const metadata: Metadata = {
  title: "Articles - Inkera",
  description: "Tous les articles Inkera sur l'univers du tatouage.",
};

export default async function ArticlesPage() {
  let articles = [] as Awaited<ReturnType<typeof getPublicArticlesAction>>;
  let errorMessage = "";

  try {
    articles = await getPublicArticlesAction();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Erreur de chargement des articles";
  }

  return (
    <>
    <section className="bg-noir-700 py-20 sm:py-0 sm:pt-10 sm:pb-24">
      <div className="mx-4 sm:mx-8 lg:mx-20">
        <header className="pb-6 pt-3 font-one sm:pb-8 sm:pt-5">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-tertiary-400">
            Journal Inkera
          </p>
          <h1 className="text-balance font-two text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Tous nos articles
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/60">
            Conseils, inspirations et tendances autour du tatouage.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-white/10 py-5 font-one">
          <p className="text-sm font-medium text-white/85">À découvrir dans le journal</p>
          {!errorMessage && <p role="status" className="text-sm text-white/60">{articles.length} article{articles.length > 1 ? "s" : ""} disponible{articles.length > 1 ? "s" : ""}</p>}
        </div>

        {errorMessage ? (
          <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-6 text-center text-sm text-red-100 font-one">
            {errorMessage}
          </div>
        ) : null}

        {!errorMessage && !articles.length ? (
          <div className="rounded-3xl border border-white/10 bg-white/4 p-8 text-center text-white/70 font-one">
            Aucun article disponible pour le moment.
          </div>
        ) : null}

        {!!articles.length && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
    <FinalCtaSection />
    </>
  );
}
