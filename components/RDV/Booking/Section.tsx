import React from "react";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export default function Section({ title, children }: SectionProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 sm:p-8 backdrop-blur-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white/95 font-one text-sm tracking-[0.2em] uppercase font-semibold">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
