"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
// import SearchNavbar from "../Search/SearchNavbar";

export default function Navbar() {
  const pathname = usePathname();

  const navRef = useRef<HTMLUListElement>(null);

  const links = [
    { href: "/", label: "Accueil" },
    // { href: "/trouver-un-salon", label: "Trouver un salon" },
    { href: "/en-savoir-plus", label: "En savoir plus" },
    // { href: "/je-suis-tatoueur", label: "Je suis tatoueur ?" },
    { href: "/mon-profil", label: "Mon profil" },
  ];

  return (
    <nav className="flex justify-between items-center py-4 mx-20">
      {" "}
      {/* <p className="font-two font-bold text-xl text-white">TheInkEra</p> */}
      <Image
        src="/images/logo_inline_white.png"
        alt="Logo"
        width={150}
        height={50}
      />
      <ul ref={navRef} className="flex gap-8">
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
        {/* <SearchNavbar className="hidden md:block" /> */}
      </ul>
    </nav>
  );
}
