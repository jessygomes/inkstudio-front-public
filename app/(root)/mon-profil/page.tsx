/* eslint-disable @typescript-eslint/no-explicit-any */

import { auth } from "@/auth";
import ProfilGlobal from "@/components/MonProfil/ProfilGlobal";
import Link from "next/link";

export default async function MonProfilPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-noir-700 via-noir-600 to-noir-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 font-one mb-4">
            Vous devez être connecté en tant que client pour accéder à cette
            page.
          </p>
          <Link
            href="/se-connecter"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-xl transition-all duration-300 font-one text-sm shadow-lg hover:scale-105"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-gradient-to-b from-noir-700 via-noir-500 to-noir-700 pt-20">
      <ProfilGlobal {...user} />
    </div>
  );
}
