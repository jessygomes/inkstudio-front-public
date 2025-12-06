/* eslint-disable react/no-unescaped-entities */
"use client";
import { useUser } from "@/components/Context/UserContext";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MdMenu, MdClose } from "react-icons/md";
import { FaUser } from "react-icons/fa";

export default function NavbarMobile() {
  const { isAuthenticated, user } = useUser();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleClickOutside = (event: MouseEvent) => {
    if (navRef.current && !navRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  const links = [
    { href: "/", label: "Accueil" },
    { href: "/trouver-un-salon", label: "Trouver un salon" },
    { href: "/en-savoir-plus", label: "En savoir plus" },
    // { href: "/je-suis-tatoueur", label: "Je suis tatoueur ?" },
  ];

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav>
      <div className="flex gap-3 items-center justify-between text-white">
        {/* Avatar ou bouton connexion - Modernisé */}
        {isAuthenticated && user ? (
          <Link href="/mon-profil" className="group">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-tertiary-400/50 group-hover:border-tertiary-400 transition-all duration-300 cursor-pointer group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-tertiary-400/25">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={`${user.firstName} ${user.lastName}`}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-tertiary-400/40 to-tertiary-500/40 flex items-center justify-center">
                  <FaUser className="w-4 h-4 text-tertiary-300" />
                </div>
              )}
            </div>
          </Link>
        ) : (
          <Link href="/se-connecter" className="group flex-1 sm:flex-none">
            <div className="cursor-pointer px-4 sm:px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-two text-xs shadow-lg shadow-tertiary-500/25 group-hover:shadow-tertiary-500/40 transform group-hover:scale-105 text-center">
              Connexion
            </div>
          </Link>
        )}

        <button
          onClick={handleOpen}
          className="text-2xl p-2 rounded-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
        >
          <MdMenu size={28} className="text-white" />
        </button>
      </div>

      {/* Overlay avec blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-noir-700/80 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={handleClose}
        />
      )}

      {/* Sidebar Menu - Modernisé */}
      <div
        ref={navRef}
        className={`fixed top-0 right-0 z-50 w-72 h-screen bg-gradient-to-b from-noir-600 to-noir-800 backdrop-blur-xl text-white transform transition-all duration-500 ease-out ${
          isOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 pointer-events-none"
        } border-l border-white/10 shadow-2xl`}
      >
        {/* Header moderne avec gradient */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-white/[0.05] to-white/[0.02]">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold font-two tracking-wider">
              <Image
                src="/images/logo_inline_white.png"
                alt="Logo"
                width={150}
                height={50}
              />
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-2xl p-2 rounded-lg hover:bg-white/10 transition-all duration-300 active:scale-95"
          >
            <MdClose />
          </button>
        </div>

        {/* Navigation links - Modernisés */}
        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2 mb-6">
            {links.map((link, index) => {
              const isActive =
                pathname === link.href ||
                (link.href === "#cestquoi" && pathname === "/");

              return (
                <li key={index}>
                  <Link
                    href={
                      link.href === "#cestquoi" && pathname !== "/"
                        ? `/#cestquoi`
                        : link.href
                    }
                    onClick={handleClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? "bg-gradient-to-r from-tertiary-400/25 to-tertiary-500/15 border border-tertiary-400/40 text-white shadow-lg shadow-tertiary-400/10"
                        : "hover:bg-white/5 text-white/80 hover:text-white border border-transparent"
                    }`}
                  >
                    <div className="flex-1">
                      <span className="text-base font-medium font-one tracking-wide">
                        {link.label}
                      </span>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        isActive
                          ? "bg-tertiary-400 shadow-lg shadow-tertiary-400/50"
                          : "bg-transparent group-hover:bg-white/30"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

          {/* User Section */}
          {isAuthenticated && user ? (
            <div className="space-y-4">
              {/* User Profile Card */}
              <Link href="/mon-profil" onClick={handleClose}>
                <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 rounded-xl p-4 hover:from-white/[0.12] hover:to-white/[0.06] hover:border-white/20 transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-tertiary-400/50 group-hover:border-tertiary-400 transition-all duration-300">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={`${user.firstName} ${user.lastName}`}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-tertiary-400/40 to-tertiary-500/40 flex items-center justify-center">
                          <FaUser className="w-4 h-4 text-tertiary-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-one font-semibold truncate text-sm">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-white/60 font-one text-xs truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link href="/se-connecter" onClick={handleClose}>
                <div className="cursor-pointer px-4 py-3 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-xl transition-all duration-300 font-medium font-one text-sm shadow-lg shadow-tertiary-500/25 hover:shadow-tertiary-500/40 transform hover:scale-105 text-center">
                  Se connecter
                </div>
              </Link>
              <Link href="/creer-un-compte" onClick={handleClose}>
                <div className="cursor-pointer px-4 py-3 bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:from-white/[0.12] hover:to-white/[0.06] text-white/80 hover:text-white border border-white/20 hover:border-white/30 rounded-xl transition-all duration-300 font-medium font-one text-sm text-center">
                  Créer un compte
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
