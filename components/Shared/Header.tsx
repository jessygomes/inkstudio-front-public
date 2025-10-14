import React from "react";
// import Link from "next/link";
import Navbar from "./Navbar/Navbar";
import NavMobile from "./Navbar/NavbarMobile";

export default function Header() {
  return (
    <>
      <div className="hidden lg:block">
        <Navbar />
      </div>

      <div className="lg:hidden px-4 pt-8 rounded-2xl flex justify-between items-center mx-2">
        <p className="text-xl font-one font-bold text-white ">InkStudio</p>
        <NavMobile />
      </div>
    </>
  );
}
