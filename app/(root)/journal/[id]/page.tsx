import ArticleReadingView from "@/components/Articles/ArticleReadingView";
import AppButton from "@/components/Shared/AppButton";
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

const isHeading = (line: string) => /^#{1,3}\s+/.test(line) || (!line.startsWith("- ") && !subtitleWithContentRegex.test(line) && isLikelySubtitle(line));

const renderArticleContent = (content: string) => {
  const lines = content.split("\n");

  return lines.map((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      return null;
    }

    if (line.startsWith("- ")) {
      return (
        <p key={`bullet-${index}`} className="flex items-start gap-2 text-inherit">
          <span className="mt-3.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tertiary-400" />
          <span>{line.slice(2).trim()}</span>
        </p>
      );
    }

    const subtitleWithTextMatch = line.match(subtitleWithContentRegex);
    if (subtitleWithTextMatch && !/^#{1,3}\s+/.test(line)) {
      const [, subtitle, rest] = subtitleWithTextMatch;
      return (
        <p key={`subtitle-content-${index}`} className="text-inherit">
          <strong className="text-white font-semibold">{subtitle}:</strong> {rest}
        </p>
      );
    }

    if (isHeading(line)) {
      const cleanSubtitle = line.replace(/^#{1,3}\s*/, "").trim();
      return (
        <h2 id={`section-${index}`} key={`heading-${index}`} className="scroll-mt-28 pt-6 font-two text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
          {cleanSubtitle}
        </h2>
      );
    }

    return (
      <p key={`p-${index}`} className="text-inherit">
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

  let article;
  try {
    article = await getPublicArticleByIdAction(id);
  } catch (error) {
    if (error instanceof Error && /non trouve|not found|404/i.test(error.message)) {
      notFound();
    }

    return (
      <section className="bg-noir-700 py-20 sm:py-24">
        <div className="mx-4 sm:mx-8 lg:mx-20">
          <div className="mx-auto max-w-3xl rounded-3xl border border-red-400/20 bg-red-500/10 p-8 text-center text-red-100 font-one">
            <p>Une erreur est survenue lors du chargement de l&apos;article.</p>
            <AppButton href="/journal" variant="secondary" className="mt-6 min-h-11">Retour au journal</AppButton>
          </div>
        </div>
      </section>
    );
  }
  const headings = article.content.split("\n").flatMap((rawLine, index) => {
    const line = rawLine.trim();
    return isHeading(line) ? [{ id: `section-${index}`, title: line.replace(/^#{1,3}\s*/, "").trim() }] : [];
  });
  return <ArticleReadingView article={article} headings={headings}>{renderArticleContent(article.content)}</ArticleReadingView>;

}
