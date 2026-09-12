/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";
import UpdateProfil from "@/components/MonProfil/UpdateProfil";
import AppButton from "@/components/Shared/AppButton";

export default async function ModifierProfilPage() {
  const session = await auth();
  // Redirection si pas authentifié ou pas client
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-noir-700 px-4 pt-10 flex items-center justify-center">
        <div className="max-w-md text-center">
          <p className="text-white/60 font-one mb-4">
            Vous devez être connecté en tant que client pour accéder à cette
            page.
          </p>
          <AppButton
            href="/connexion"
            className="min-h-11 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400"
          >
            Se connecter
          </AppButton>
        </div>
      </div>
    );
  }

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-noir-700">
      <UpdateProfil {...user} />
    </div>
  );
}
