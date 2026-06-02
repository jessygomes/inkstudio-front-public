import {
  getInspirationFilterOptionsAction,
  getInspirationPortfolioPhotosAction,
} from "@/lib/actions/inspiration.action";
import InspirationMosaicFeed from "@/components/Inspiration/InspirationMosaicFeed";

export default async function InspirationPage() {
  const [initialData, filterOptions] = await Promise.all([
    getInspirationPortfolioPhotosAction({
      page: 1,
      limit: 12,
    }),
    getInspirationFilterOptionsAction(),
  ]);

  return (
    <main className="w-full px-4 py-6 sm:py-8 lg:px-20 bg-noir-700">
      <InspirationMosaicFeed
        initialData={initialData}
        initialFilters={filterOptions}
      />
    </main>
  );
}
