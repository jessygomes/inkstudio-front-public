"use client";
import { useRouter } from "next/navigation";
import React from "react";

interface BtnBackProps {
  className?: string;
  children?: React.ReactNode;
}

export default function BtnBack({ className = "", children }: BtnBackProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`inline-block bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white font-one tracking-widest font-semibold px-10 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg border border-white/20 hover:border-white/30 ${className}`}
    >
      {children || "← Retour"}
    </button>
  );
}
