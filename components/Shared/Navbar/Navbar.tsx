/* eslint-disable react/no-unescaped-entities */
"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { useMessagingContext } from "@/components/Context/MessageProvider";
import { FaInstagram, FaTiktok } from "react-icons/fa";

type NavbarProps = {
  showLogo?: boolean;
};

export default function Navbar({ showLogo = false }: NavbarProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { unreadCount } = useMessagingContext();

  const navRef = useRef<HTMLUListElement>(null);

  const links = [
    { href: "/", label: "Accueil" },
    { href: "/trouver-un-salon", label: "Trouver un salon" },
    { href: "/journal", label: "Journal" },
    { href: "/en-savoir-plus", label: "En savoir plus" },
  ];

  const socialLinks = [
    {
      href: "https://www.instagram.com/the.inkera",
      label: "Instagram Inkera",
      icon: FaInstagram,
    },
    {
      href: "https://www.tiktok.com/@inkera2?_r=1&_t=ZN-96K7CgxVqsw",
      label: "TikTok Inkera",
      icon: FaTiktok,
    },
  ];

  return (
    <nav className="flex justify-between items-center py-4 mx-20">
      <Link href={"/"} className="w-37.5 h-12.5 flex items-center">
        <Image
          src="/images/logo_inline_white.png"
          alt="Logo"
          width={150}
          height={50}
          className={`transition-opacity duration-300 ${
            showLogo ? "opacity-100" : "opacity-0"
          }`}
        />
      </Link>
      <ul ref={navRef} className="flex gap-6 items-center">
        {links.map((link, index) => {
          const isActive = pathname === link.href;
          const isHomeAccueilLink = pathname === "/" && link.href === "/";

          return (
            <li
              key={index}
              className={`${
                isActive
                  ? "active font-two text-white font-bold"
                  : "font-normal"
              } pb-1 text-white text-sm font-two pt-1 px-2 tracking-widest hover:text-white/70 transition-all duration-300 ${
                isHomeAccueilLink
                  ? showLogo
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                  : "opacity-100"
              }`}
            >
              <Link href={link.href}>{link.label}</Link>
            </li>
          );
        })}
        <li className="flex items-center gap-2">
          {socialLinks.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                title={item.label}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/75 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/12 hover:text-white"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            );
          })}
        </li>
        {status === "authenticated" && session?.user ? (
          <Link
            href="/mon-profil"
            aria-label="Accéder à mon profil"
            className="group relative inline-flex items-center justify-center rounded-full transition-all duration-300"
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-noir-700/80 ring-1 ring-white/15 transition-all duration-300 group-hover:ring-white/35">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={`${session.user.firstName} ${session.user.lastName}`}
                  fill
                  sizes="40px"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-tertiary-300/45 to-tertiary-500/50 flex items-center justify-center">
                  <span className="text-white font-bold text-sm tracking-wide">
                    {session.user.firstName?.charAt(0)}
                    {session.user.lastName?.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full border border-noir-700 flex items-center justify-center shadow-md">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        ) : (
          <Link href="/se-connecter">
            <div className="cursor-pointer px-8 py-2 bg-linear-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-2xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-two text-xs">
              Se connecter
            </div>
          </Link>
        )}
        
      </ul>
    </nav>
  );
}
