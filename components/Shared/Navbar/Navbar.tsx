/* eslint-disable react/no-unescaped-entities */
"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const navRef = useRef<HTMLUListElement>(null);

  const links = [
    { href: "/", label: "Accueil" },
    { href: "/trouver-un-salon", label: "Trouver un salon" },
    { href: "/en-savoir-plus", label: "En savoir plus" },
  ];

  return (
    <nav className="flex justify-between items-center py-4 mx-20">
      <Image
        src="/images/logo_inline_white.png"
        alt="Logo"
        width={150}
        height={50}
      />
      <ul ref={navRef} className="flex gap-8 items-center">
        {links.map((link, index) => {
          const isActive = pathname === link.href;

          return (
            <li
              key={index}
              className={`${
                isActive
                  ? "active font-two text-white font-bold"
                  : "font-normal"
              } pb-1 text-white text-sm font-two pt-1 px-2 tracking-widest hover:text-white/70 transition-all duration-300`}
            >
              <Link href={link.href}>{link.label}</Link>
            </li>
          );
        })}
        {status === "authenticated" && session?.user ? (
          <Link href="/mon-profil">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-1 border-white/30 transition-all duration-300 cursor-pointer hover:scale-105">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={`${session.user.firstName} ${session.user.lastName}`}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-tertiary-400/40 to-tertiary-500/40 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {session.user.firstName?.charAt(0)}
                    {session.user.lastName?.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ) : (
          <Link href="/se-connecter">
            <div className="cursor-pointer px-8 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-two text-xs">
              Se connecter / S'inscrire
            </div>
          </Link>
        )}
      </ul>
    </nav>
  );
}
