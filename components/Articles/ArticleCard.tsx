import Link from "next/link";
import { PublicArticle } from "@/lib/actions/article.action";

const toExcerpt = (text: string, maxLength = 130) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};

type ArticleCardProps = {
  article: PublicArticle;
};

export default function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = new Date(article.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/4 backdrop-blur-sm transition-all duration-300 hover:border-tertiary-400/40 hover:bg-white/6 hover:shadow-xl hover:shadow-tertiary-500/10 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 w-full shrink-0 overflow-hidden bg-noir-900/60">
        {article.imageUrls?.[0] ? (
          <img
            src={article.imageUrls[0]}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs uppercase tracking-[0.22em] text-white/30 font-one">
              Inkera
            </span>
          </div>
        )}
        {/* Gradient bas */}
        <div className="absolute inset-0 bg-linear-to-t from-noir-900/70 via-transparent to-transparent" />

        {/* Badge auteur */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
          <span className="rounded-full border border-white/15 bg-noir-900/60 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/70 font-one backdrop-blur-sm">
            {article.author}
          </span>
          <span className="rounded-full border border-white/10 bg-noir-900/60 px-2.5 py-1 text-[10px] text-white/50 font-one backdrop-blur-sm">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-white font-two transition-colors duration-300 group-hover:text-tertiary-100">
          {article.title}
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-white/65 font-one">
          {toExcerpt(article.content)}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
          <Link
            href={`/journal/${article.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-tertiary-300 transition-all duration-300 hover:text-tertiary-200 font-one"
          >
            Lire l&apos;article
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>

          {/* Accent dot */}
          <span className="h-1.5 w-1.5 rounded-full bg-tertiary-400/50 group-hover:bg-tertiary-400 transition-colors duration-300" />
        </div>
      </div>

      {/* Accent line au hover */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-tertiary-400/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </article>
  );
}
