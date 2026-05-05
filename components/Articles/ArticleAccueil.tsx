import Link from "next/link";
import { getLatestPublicArticlesAction } from "@/lib/actions/article.action";

const toExcerpt = (text: string, maxLength = 140) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};

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
    <section className="bg-noir-700 py-20">
      <div className="mx-4 sm:mx-8 lg:mx-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-tertiary-400 font-one">
              Journal Inkera
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white font-two sm:text-4xl">
              Les 3 derniers articles
            </h2>
          </div>

          <Link
            href="/articles"
            className="hidden rounded-2xl border border-white/15 px-4 py-2 text-xs text-white/80 transition-colors hover:border-white/30 hover:text-white font-one sm:inline-flex"
          >
            Voir tous les articles
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.id}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white/4 backdrop-blur-sm transition-colors hover:border-tertiary-400/35"
            >
              <div className="h-44 w-full bg-noir-900/60">
                {article.imageUrls?.[0] ? (
                  <img
                    src={article.imageUrls[0]}
                    alt={article.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-white/40 font-one">
                    Inkera
                  </div>
                )}
              </div>

              <div className="p-5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/50 font-one">
                  {new Date(article.createdAt).toLocaleDateString("fr-FR")} - {article.author}
                </p>
                <h3 className="mt-2 line-clamp-2 text-xl text-white font-two">
                  {article.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/75 font-one">
                  {toExcerpt(article.content)}
                </p>

                <Link
                  href={`/articles/${article.id}`}
                  className="mt-4 inline-flex text-sm text-tertiary-300 transition-colors hover:text-tertiary-200 font-one"
                >
                  Lire l&apos;article
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/articles"
            className="inline-flex rounded-2xl border border-white/15 px-4 py-2 text-xs text-white/80 transition-colors hover:border-white/30 hover:text-white font-one"
          >
            Voir tous les articles
          </Link>
        </div>
      </div>
    </section>
  );
}
