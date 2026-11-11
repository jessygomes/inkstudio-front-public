import {
  getInspirationFilterOptionsAction,
  getInspirationPortfolioPhotosAction,
} from "@/lib/actions/inspiration.action";
import InspirationMosaicFeed from "@/components/Inspiration/InspirationMosaicFeed";
import { parseInspirationFilters } from "@/components/Inspiration/inspirationFilters";

type InspirationPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InspirationPage({
  searchParams,
}: InspirationPageProps) {
  const params = await searchParams;
  const initialSelection = parseInspirationFilters((key) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  });

  const [initialData, filterOptions] = await Promise.all([
    getInspirationPortfolioPhotosAction({
      page: 1,
      limit: 12,
      ...initialSelection,
    }),
    getInspirationFilterOptionsAction(),
  ]);

  return (
    <main className="w-full bg-noir-800 py-4 sm:py-5">
      <InspirationMosaicFeed
        initialData={initialData}
        initialFilters={filterOptions}
        initialSelection={initialSelection}
      />
    </main>
  );
}
