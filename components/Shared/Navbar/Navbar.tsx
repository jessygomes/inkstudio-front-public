"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
// import SearchNavbar from "../Search/SearchNavbar";

export default function Navbar() {
  const pathname = usePathname();

  const navRef = useRef<HTMLUListElement>(null);

  const links = [
    // { href: "/", label: "Accueil" },
    // { href: "/trouver-un-salon", label: "Trouver un salon" },
    { href: "/en-savoir-plus", label: "En savoir plus" },
    // { href: "/je-suis-tatoueur", label: "Je suis tatoueur ?" },
  ];

  return (
    <nav className="flex justify-between items-center py-4 mx-20">
      {" "}
      <p className="font-two uppercase font-bold text-xl text-white">
        InkStudio
      </p>
      <ul ref={navRef} className="flex gap-8">
        {links.map((link, index) => {
          const isActive = pathname === link.href;

          return (
            <li
              key={index}
              className={`${
                isActive
                  ? "active font-three text-white font-bold"
                  : "font-thin"
              } pb-1 text-white text-sm font-three pt-1 px-2 tracking-widest hover:text-white/70 transition-all duration-300`}
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
