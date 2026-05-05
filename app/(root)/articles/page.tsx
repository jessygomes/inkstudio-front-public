import Link from "next/link";
import type { Metadata } from "next";
import { getPublicArticlesAction } from "@/lib/actions/article.action";
import FinalCtaSection from "@/components/Home/FinalCtaSection";

export const metadata: Metadata = {
  title: "Articles - Inkera",
  description: "Tous les articles Inkera sur l'univers du tatouage.",
};

const toExcerpt = (text: string, maxLength = 180) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
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
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-tertiary-400 font-one">
            Journal Inkera
          </p>
          <h1 className="mt-3 text-4xl font-bold text-white font-two sm:text-5xl">
            Tous nos articles
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/65 font-one sm:text-base">
            Conseils, inspirations et tendances autour du tatouage.
          </p>
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
              <article
                key={article.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/4 backdrop-blur-sm transition-colors hover:border-tertiary-400/35"
              >
                <div className="h-48 w-full bg-noir-900/60">
                  {article.imageUrls?.[0] ? (
                    <img
                      src={article.imageUrls[0]}
                      alt={article.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="p-6">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/50 font-one">
                    {new Date(article.createdAt).toLocaleDateString("fr-FR")} - {article.author}
                  </p>
                  <h2 className="mt-2 line-clamp-2 text-2xl text-white font-two">
                    {article.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/75 font-one">
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
        )}
      </div>
    </section>
    <FinalCtaSection />
    </>
  );
}
