"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function AuthBackButton() {
  const router = useRouter();
  return <button type="button" onClick={() => { if (window.history.length > 1) router.back(); else router.replace("/"); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs text-white/65 transition hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400"><ArrowLeft size={15} aria-hidden="true" />Retour</button>;
}
