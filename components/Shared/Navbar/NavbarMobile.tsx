/* eslint-disable react/no-unescaped-entities */
"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MdMenu, MdClose } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import { useMessagingContext } from "@/components/Context/MessageProvider";
import AppButton from "@/components/Shared/AppButton";

export default function NavbarMobile() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { unreadCount } = useMessagingContext();
  const navRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef(0);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const links = [
    { href: "/", label: "Accueil" },
    { href: "/trouver-un-salon", label: "Trouver un salon" },
    { href: "/inspiration", label: "Inspirations" },
    { href: "/journal", label: "Journal" },
    { href: "/en-savoir-plus", label: "En savoir plus" },
    // { href: "/je-suis-tatoueur", label: "Je suis tatoueur ?" },
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollYRef.current = window.scrollY;

      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";

      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsOpen(false);
        }
      };

      document.addEventListener("keydown", handleEsc);

      return () => {
        document.removeEventListener("keydown", handleEsc);
      };
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";

      if (scrollYRef.current > 0) {
        window.scrollTo(0, scrollYRef.current);
      }
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
    };
  }, [isOpen]);

  return (
    <nav className="w-full max-w-full overflow-x-clip">
      <div className="flex gap-3 items-center justify-between text-white">
        {/* Avatar ou bouton connexion - Modernisé */}
        {status === "authenticated" && session?.user ? (
          <Link href="/mon-profil" className="group relative">
            <div className="relative w-9 h-9 rounded-full overflow-hidden group-hover:border-tertiary-400 transition-all duration-300 cursor-pointer group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-tertiary-400/25">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={`${session.user.firstName} ${session.user.lastName}`}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-tertiary-400/40 to-tertiary-500/40 flex items-center justify-center">
                  <FaUser className="w-4 h-4 text-tertiary-300" />
                </div>
              )}
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        ) : (
          <Link href="/se-connecter" className="group ml-auto">
            <div className="cursor-pointer w-fit px-2 sm:px-6 py-2 bg-linear-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-400 text-white rounded-2xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-two text-xs shadow-lg shadow-tertiary-500/25 group-hover:shadow-tertiary-500/40 transform text-center">
              Connexion
            </div>
          </Link>
        )}

        <button
          onClick={handleOpen}
          className="text-2xl p-2 rounded-2xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
        >
          <MdMenu size={28} className="text-white" />
        </button>
      </div>

      {isMounted &&
        createPortal(
          <>
            {/* Overlay avec blur */}
            <div
              className={`fixed inset-0 z-90 bg-noir-700/80 backdrop-blur-sm transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              onClick={handleClose}
            />

            {/* Sidebar Menu - Modernisé */}
            <div
              ref={navRef}
              className={`fixed top-0 right-0 z-100 w-72 max-w-[85vw] h-dvh bg-noir-700 bg-linear-to-b from-noir-600 to-noir-800 backdrop-blur-xl text-white transform transition-all duration-500 ease-out ${
                isOpen
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0 pointer-events-none"
              } border-l border-white/10 shadow-2xl`}
            >
              {/* Header moderne avec gradient */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-linear-to-r from-white/5 to-white/2">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold font-two tracking-wider">
                    <Image
                      src="/logo/logo_inline_people_white.png"
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
              <div className="flex-1 px-4 py-6 overflow-y-auto h-[calc(100dvh-88px)]">
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
                          className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-300 group ${
                            isActive
                              ? "bg-linear-to-r from-tertiary-400/25 to-tertiary-500/15 border border-tertiary-400/40 text-white shadow-lg shadow-tertiary-400/10"
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

                <div className="mb-6">
                  <p className="mb-3 px-1 text-xs uppercase tracking-wider text-white/45 font-one">
                    Réseaux sociaux
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {socialLinks.map((item) => {
                      const Icon = item.icon;

                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handleClose}
                          aria-label={item.label}
                          title={item.label}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-white/85 transition-all duration-300 hover:border-white/25 hover:bg-white/10 hover:text-white"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="font-one">{item.label.split(" ")[0]}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent my-6" />

                {/* User Section */}
                {status === "authenticated" && session?.user ? (
                  <div className="space-y-4">
                    {/* User Profile Card */}
                    <Link href="/mon-profil" onClick={handleClose}>
                      <div className="bg-linear-to-br from-white/8 to-white/2 border border-white/10 rounded-xl p-4 hover:from-white/12 hover:to-white/6 hover:border-white/20 transition-all duration-300 group cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-tertiary-400/50 group-hover:border-tertiary-400 transition-all duration-300">
                            {session.user.image ? (
                              <Image
                                src={session.user.image}
                                alt={`${session.user.firstName} ${session.user.lastName}`}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-linear-to-br from-tertiary-400/40 to-tertiary-500/40 flex items-center justify-center">
                                <FaUser className="w-4 h-4 text-tertiary-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-one font-semibold truncate text-sm">
                              {session.user.firstName} {session.user.lastName}
                            </p>
                            <p className="text-white/60 font-one text-xs truncate">
                              {session.user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <AppButton
                      href="/se-connecter"
                      onClick={handleClose}
                      variant="primary"
                    >
                      Se connecter
                    </AppButton>
                    <AppButton
                      href="/creer-un-compte"
                      onClick={handleClose}
                      variant="secondary"
                    >
                      Créer un compte
                    </AppButton>
                  </div>
                )}
              </div>
            </div>
          </>,
          document.body,
        )}
    </nav>
  );
}
