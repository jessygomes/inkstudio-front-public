"use client";
import React, { useEffect, useState } from "react";
// import Link from "next/link";
import Navbar from "./Navbar/Navbar";
import NavMobile from "./Navbar/NavbarMobile";
import Image from "next/image";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

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
          isScrolled ? "bg-noir-700 backdrop-blur-sm" : "bg-transparent"
        }`}
      >
        <Navbar showLogo={isScrolled} />
      </div>

      <div
        className={`lg:hidden py-2 px-4 flex justify-between items-center mt-2 transition-all duration-300 ${
          isScrolled ? "bg-noir-700 backdrop-blur-sm" : "bg-transparent"
        }`}
      >
        <Image
          src="/images/logo_inline_white.png"
          alt="Logo"
          width={100}
          height={50}
          className={`w-25 md:w-35 h-auto transition-opacity duration-300 ${
            isScrolled ? "opacity-100" : "opacity-0"
          }`}
        />
        <NavMobile />
      </div>
    </>
  );
}
