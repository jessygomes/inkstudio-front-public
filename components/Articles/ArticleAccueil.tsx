import HomeJournalView from "./HomeJournalView";
import { getLatestPublicArticlesAction } from "@/lib/actions/article.action";

export default async function ArticleAccueil() {
  let articles: Awaited<ReturnType<typeof getLatestPublicArticlesAction>> = [];
  try {
    articles = await getLatestPublicArticlesAction();
  } catch (error) {
    console.error("Erreur chargement derniers articles:", error);
  }
  return <HomeJournalView articles={articles} />;
}
