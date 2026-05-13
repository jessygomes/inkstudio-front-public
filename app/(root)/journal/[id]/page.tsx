import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicArticleByIdAction } from "@/lib/actions/article.action";

type PageProps = {
  params: Promise<{ id: string }>;
};

const subtitleWithContentRegex = /^([^:]{2,80}):\s+(.+)$/;

const isLikelySubtitle = (line: string) => {
  const clean = line.replace(/^#{1,3}\s*/, "").trim();

  if (!clean || clean.length > 80) return false;
  if (/[.!?]$/.test(clean)) return false;

  const wordsCount = clean.split(/\s+/).length;
  return wordsCount >= 1 && wordsCount <= 10;
};

const renderArticleContent = (content: string) => {
  const lines = content.split("\n");

  return lines.map((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      return <div key={`space-${index}`} className="h-2" />;
    }

    if (line.startsWith("- ")) {
      return (
        <p key={`bullet-${index}`} className="flex items-start gap-2 text-sm leading-7 text-white/85 font-one sm:text-base">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-tertiary-300" />
          <span>{line.slice(2).trim()}</span>
        </p>
      );
    }

    const subtitleWithTextMatch = line.match(subtitleWithContentRegex);
    if (subtitleWithTextMatch) {
      const [, subtitle, rest] = subtitleWithTextMatch;
      return (
        <p key={`subtitle-content-${index}`} className="text-sm leading-7 text-white/85 font-one sm:text-base">
          <strong className="text-white font-semibold">{subtitle}:</strong> {rest}
        </p>
      );
    }

    if (isLikelySubtitle(line)) {
      const cleanSubtitle = line.replace(/^#{1,3}\s*/, "").trim();
      return (
        <h3 key={`h3-${index}`} className="pt-3 text-lg font-semibold text-white font-two sm:text-xl">
          {cleanSubtitle}
        </h3>
      );
    }

    return (
      <p key={`p-${index}`} className="text-sm leading-7 text-white/85 font-one sm:text-base">
        {line}
      </p>
    );
  });
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const article = await getPublicArticleByIdAction(id);
    return {
      title: `${article.title} - Inkera`,
      description: article.content.slice(0, 150),
    };
  } catch {
    return {
      title: "Article - Inkera",
    };
  }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const article = await getPublicArticleByIdAction(id);

    return (
      <section className="relative isolate overflow-hidden bg-noir-700 py-20 sm:py-0 sm:pt-16 sm:pb-24">
        <div className="relative mx-4 sm:mx-8 lg:mx-20">
          <div className="mx-auto max-w-5xl">
            <Link
              href="/journal"
              className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/65 transition-colors hover:text-white font-one"
            >
              <span className="text-sm">←</span>
              Retour aux articles
            </Link>

            <article className="overflow-hidden rounded-4xl border border-white/10 bg-white/4 shadow-[0_25px_80px_-35px_rgba(0,0,0,0.9)] backdrop-blur-sm">
              {article.imageUrls?.[0] ? (
                <div className="relative h-64 w-full bg-noir-900/60 sm:h-80">
                  <Image
                    src={article.imageUrls[0]}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 900px"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-noir-900/70 via-noir-900/20 to-transparent" />
                </div>
              ) : null}

              <div className="p-6 sm:p-10">
                <p className="text-[11px] uppercase tracking-[0.14em] text-tertiary-300 font-one">
                  {new Date(article.createdAt).toLocaleDateString("fr-FR")} - {article.author}
                </p>

                <h1 className="mt-3 text-3xl font-bold leading-tight text-white font-two sm:text-5xl">
                  {article.title}
                </h1>

                <div className="mt-6 space-y-3">
                  {renderArticleContent(article.content)}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    if (error instanceof Error && /non trouve|not found|404/i.test(error.message)) {
      notFound();
    }

    return (
      <section className="bg-noir-700 py-20 sm:py-24">
        <div className="mx-4 sm:mx-8 lg:mx-20">
          <div className="mx-auto max-w-3xl rounded-3xl border border-red-400/20 bg-red-500/10 p-8 text-center text-red-100 font-one">
            Une erreur est survenue lors du chargement de l&apos;article.
          </div>
        </div>
      </section>
    );
  }
}