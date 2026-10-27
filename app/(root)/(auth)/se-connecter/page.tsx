import { Login } from "@/components/Auth/Login";
import AuthPageShell from "@/components/Auth/AuthPageShell";
import { currentUser } from "@/lib/auth.server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Se connecter à votre espace client | Inkera",
  description: "Retrouvez vos moodboards, vos favoris, vos rendez-vous et vos échanges avec les artistes dans votre espace client Inkera.",
};

export default async function LoginPage() {
  const user = await currentUser();
  if (user) redirect("/mon-profil");
  return <AuthPageShell><Suspense fallback={<p role="status" className="min-h-96 text-sm text-white/55">Chargement du formulaire…</p>}><Login /></Suspense></AuthPageShell>;
}
