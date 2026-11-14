import type { Metadata } from "next";
import FollowUpFlow from "@/components/FollowUp/FollowUpFlow";

export const dynamic = "force-dynamic";

// Lien personnel : jamais indexé, jamais transmis en référent.
export const metadata: Metadata = {
  title: "Votre suivi après la séance | Inkera",
  description: "Partagez votre photo et votre retour avec votre salon.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: "no-referrer",
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

function safeDecode(value: string) {
  try { return decodeURIComponent(value); } catch { return value; }
}

export default async function FollowUpPage({ params }: { params: Promise<{ token: string }> }) {
  const token = safeDecode((await params).token);
  return (
    <div className="min-h-screen bg-noir-800 font-one">
      <div className="mx-page pb-16 pt-8 sm:pt-12">
        <FollowUpFlow key={token} token={token} />
      </div>
    </div>
  );
}
