import type { Metadata } from "next";
import { auth } from "@/auth";
import { hasUsableSession } from "@/lib/auth-security";
import AuthPageShell from "@/components/Auth/AuthPageShell";
import InvitationFlow, { type InvitationViewer } from "@/components/Invitation/InvitationFlow";
import { getClientInvitation } from "@/lib/actions/clientInvitation.action";

export const dynamic = "force-dynamic";

// Titre neutre : ni token ni nom de salon dans les métadonnées.
export const metadata: Metadata = {
  title: "Votre invitation | Inkera",
  description: "Rejoignez Inkera à l’invitation de votre salon de tatouage.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: "no-referrer",
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

function safeDecode(value: string) {
  try { return decodeURIComponent(value); } catch { return value; }
}

async function getViewer(): Promise<InvitationViewer> {
  const session = await auth();
  if (!session) return { state: "anonymous" };
  if (!hasUsableSession(session)) return { state: "expired" };
  return {
    state: "authenticated",
    role: session.user.role || "",
    email: session.user.email || "",
    firstName: session.user.firstName || "",
  };
}

export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const token = safeDecode((await params).token);
  const [result, viewer] = await Promise.all([getClientInvitation(token), getViewer()]);
  const info = result.ok ? result.data : null;
  const salonName = info?.salonName;

  return (
    <AuthPageShell
      eyebrow={salonName ? `Invitation de ${salonName}` : "Votre compte client gratuit"}
      title={salonName ? <>{salonName}<br />vous attend sur Inkera.</> : undefined}
      intro={salonName ? <>Suivez vos rendez-vous, échangez avec votre tatoueur et créez vos moodboards, gratuitement.</> : undefined}
    >
      <InvitationFlow token={token} info={info} errorCode={result.ok ? undefined : result.code ?? (result.status === 404 ? "INVITATION_NOT_FOUND" : "UNAVAILABLE")} viewer={viewer} />
    </AuthPageShell>
  );
}
