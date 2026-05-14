import Link from "next/link";
import { getLatestPublicArticlesAction } from "@/lib/actions/article.action";
import ArticleCard from "@/components/Articles/ArticleCard";

export default async function ArticleAccueil() {
  let articles = [] as Awaited<ReturnType<typeof getLatestPublicArticlesAction>>;

  try {
    articles = await getLatestPublicArticlesAction();
  } catch (error) {
    console.error("Erreur chargement derniers articles:", error);
  }

  if (!articles.length) {
    return null;
  }

  return (
    <section className="relative isolate overflow-hidden bg-noir-700 py-20">
      <div className="relative mx-4 sm:mx-8 lg:mx-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            {/* Label avec lignes décoratives — cohérent avec les autres sections */}
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-tertiary-400/60" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-tertiary-400 font-one">
                Journal Inkera
              </p>
            </div>
            <h2 className="mt-2 text-3xl font-bold text-white font-two sm:text-4xl">
              Les derniers articles
            </h2>
          </div>

          <Link
            href="/journal"
            className="hidden rounded-2xl border border-white/15 px-4 py-2 text-xs text-white/80 transition-all hover:border-tertiary-400/40 hover:bg-tertiary-500/6 hover:text-white font-one sm:inline-flex"
          >
            Voir tous les articles
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/journal"
            className="inline-flex rounded-2xl border border-white/15 px-4 py-2 text-xs text-white/80 transition-colors hover:border-white/30 hover:text-white font-one"
          >
            Voir tous les articles
          </Link>
        </div>
      </div>
    </section>
  );
}
