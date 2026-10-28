"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function SiteFrame({ children, header, footer }: { children: ReactNode; header: ReactNode; footer: ReactNode }) {
  const pathname = usePathname();
  const fullscreenAuth = pathname === "/se-connecter" || pathname === "/creer-un-compte";

  useEffect(() => {
    if (!fullscreenAuth) return;
    const rootOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = rootOverflow;
      document.body.style.overflow = bodyOverflow;
    };
  }, [fullscreenAuth]);

  if (fullscreenAuth) return <div className="h-dvh overflow-hidden bg-noir-800">{children}</div>;
  return <div><div className="sticky left-0 top-0 z-30 w-full">{header}</div>{children}{footer}</div>;
}
