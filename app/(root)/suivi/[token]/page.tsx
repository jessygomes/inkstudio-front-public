import type { Metadata } from "next";
import FollowUpFlow from "@/components/FollowUp/FollowUpFlow";
import OpenInAppPrompt from "@/components/Shared/OpenInAppPrompt";

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
      {/* Sur téléphone : envoyer le suivi depuis l'app (même chemin), la télécharger, ou rester sur le site. */}
      <OpenInAppPrompt
        appPath={`suivi/${encodeURIComponent(token)}`}
        title="Envoyez votre suivi dans l’app"
        text="Prenez vos photos et envoyez votre suivi de cicatrisation depuis l’app Inkera People. Votre salon pourra vous y répondre."
      />
      <div className="mx-page pb-16 pt-8 sm:pt-12">
        <FollowUpFlow key={token} token={token} />
      </div>
    </div>
  );
}
