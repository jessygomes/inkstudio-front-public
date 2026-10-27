import Register from "@/components/Auth/Register";
import AuthPageShell from "@/components/Auth/AuthPageShell";
import { currentUser } from "@/lib/auth.server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Créer votre compte client gratuit | Inkera",
  description: "Créez votre compte client Inkera : rassemblez et partagez vos inspirations, gardez vos favoris et échangez directement avec les artistes.",
};

export default async function RegisterPage() {
  const user = await currentUser();
  if (user) redirect("/");
  return <AuthPageShell><Register /></AuthPageShell>;
}
