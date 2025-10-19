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
          isScrolled ? "bg-noir-800/80 backdrop-blur-sm" : "bg-transparent"
        }`}
      >
        <Navbar />
      </div>

      <div
        className={`lg:hidden py-1 px-2 rounded-2xl flex justify-between items-center mx-2 mt-2 transition-all duration-300 ${
          isScrolled ? "bg-noir-800/80 backdrop-blur-sm" : "bg-transparent"
        }`}
      >
        <Image
          src="/images/logo_inline_white.png"
          alt="Logo"
          width={100}
          height={50}
          className="w-[100px] md:w-[140px] h-auto"
        />
        <NavMobile />
      </div>
    </>
  );
}
