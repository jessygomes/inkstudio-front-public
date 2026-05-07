"use client";
import React, { useEffect, useState } from "react";
// import Link from "next/link";
import Navbar from "./Navbar/Navbar";
import NavMobile from "./Navbar/NavbarMobile";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isAuthPage = pathname === "/se-connecter" || pathname === "/creer-un-compte";
  const showTransparentHeader = (isHomePage && !isScrolled) || isAuthPage;
  const shouldShowLogo = !showTransparentHeader || isAuthPage;

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50); // Activer le blur après 50px de scroll
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div
        className={`hidden lg:block transition-all duration-300 ${
          showTransparentHeader
            ? "bg-transparent"
            : "bg-noir-700 backdrop-blur-sm"
        }`}
      >
        <Navbar showLogo={shouldShowLogo} />
      </div>

      <div
        className={`lg:hidden py-2 px-4 flex justify-between items-center mt-2 transition-all duration-300 ${
          showTransparentHeader
            ? "bg-transparent"
            : "bg-noir-700 backdrop-blur-sm"
        }`}
      >
        <Link href={"/"} className=" flex items-center">
        <Image
          src="/images/logo_inline_white.png"
          alt="Logo"
          width={100}
          height={50}
          className={`w-30 md:w-40 h-auto transition-opacity duration-300 ${
            shouldShowLogo ? "opacity-100" : "opacity-0"
          }`}
        />
        </Link>
        <NavMobile />
      </div>
    </>
  );
}
