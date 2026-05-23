import ForgotPassword from "@/components/Auth/ForgotPassword";
import { currentUser } from "@/lib/auth.server";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  description:
    "Recevez un lien de réinitialisation pour retrouver l'accès à votre compte Inkera Studio.",
  keywords: [
    "mot de passe oublié",
    "réinitialisation mot de passe",
    "compte Inkera",
  ],
};

export default async function page() {
  const user = await currentUser();

  if (user) {
    redirect("/mon-profil");
  }

  return (
    <section className="-mt-16 md:-mt-12">
      <div
        className="flex min-h-screen w-full bg-cover bg-center items-center justify-center px-2"
        style={{
          backgroundImage: "url('/images/bv.png')",
          backgroundSize: "cover",
        }}
      >
        <Suspense>
          <ForgotPassword />
        </Suspense>
      </div>
    </section>
  );
}