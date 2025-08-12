import BookingFlow from "@/components/RDV/BookingFlow";
import Image from "next/image";
import { notFound } from "next/navigation";

type PageParams = { params: { slug: string; loc: string } };

async function getSalon(slug: string, loc: string) {
  const base = process.env.NEXT_PUBLIC_BACK_URL!;
  const url = `${base}/users/${encodeURIComponent(slug)}/${encodeURIComponent(
    loc
  )}`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load salon (${res.status})`);
  return res.json();
}

export default async function Page({ params }: PageParams) {
  const salon = await getSalon(params.slug, params.loc);
  if (!salon) notFound();

  // Selon ton backend, adapte ces champs
  const salonSummary = {
    id: salon.id, // <- important
    name: salon.salonName,
    image: salon.image ?? null,
    address: salon.address ?? null,
    city: salon.city ?? null,
    postalCode: salon.postalCode ?? null,
    phone: salon.phone ?? null,
    tatoueurs: salon.Tatoueur || [],
  };

  // RDV côté backend exige un userId : prends celui lié au salon
  const userId: string = salon.userId; // adapte si différent dans ta réponse API

  return (
    <div className="min-h-screen bg-noir-700 sm:px-8 lg:px-20 pt-24">
      <section className="px-4 py-8">
        <div className="mx-auto max-w-5xl">
          {/* En-tête salon */}
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="relative h-48 w-48 rounded-xl overflow-hidden border border-white/10 bg-white/10">
                {salonSummary.image ? (
                  <Image
                    src={salonSummary.image}
                    alt={salonSummary.name}
                    className="h-full w-full object-cover"
                    width={1000}
                    height={1000}
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-white/40 text-xs">
                    N/A
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-white/95 font-one text-base tracking-[0.18em] uppercase truncate">
                  {salonSummary.name}
                </h1>
                <p className="text-white/60 text-xs">
                  {[
                    salonSummary.address,
                    salonSummary.postalCode,
                    salonSummary.city,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="text-white/95 font-one text-xs tracking-[0.18em] uppercase">
                  {salonSummary.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Flow de réservation (scopé au salon) */}
          <BookingFlow
            salon={salonSummary}
            apiBase={process.env.NEXT_PUBLIC_BACK_URL}
            defaultTatoueurId={null} // si tu veux pré-sélectionner un artiste
          />
        </div>
      </section>
    </div>
  );
}
