"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaRegUserCircle, FaHome } from "react-icons/fa";
import { LuSend, LuStore, LuHome } from "react-icons/lu";

export default function Header() {
  const navMenu = [
    { name: "Services", icon: LuStore, path: "/services" },
    { name: "Habitats", icon: LuHome, path: "/habitats" },
    { name: "Contact", icon: LuSend, path: "/contact" },
  ];

  const [isMobile, setIsMobile] = useState(false);
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1300);
      setIsFull(window.innerWidth > 1600)
    };

    window.addEventListener("resize", handleResize);

    handleResize();
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const headerStyle = {
    backgroundImage: `url('/images/Header.png')`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: isMobile ? "center" : isFull ? "center bottom -400px" : "center bottom -300px",
  };

  return (
    <header
      className="absolute flex flex-col items-center h-[250px] w-full border-b-4 border-green-100"
      style={headerStyle}
    >
      <nav className="flex justify-between items-center w-full md:w-3/4 py-4 px-1 text-lg md:text-xl text-white mb-12 font-caption">
        <Link href="/home">
          <FaHome size="36px" className="hover:text-yellow-300" />
        </Link>

        <ul className="w-2/3 flex w-full justify-center gap-6 sm:gap-12 items-center text-sm sm:text-xl md:text-2xl">
          {navMenu.map((item) => (
            <li key={item.name}>
              <Link href={item.path} className="flex items-center gap-2 hover:text-yellow-300">
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/login">
          <FaRegUserCircle size="32px" className="hover:text-yellow-300" />
        </Link>
      </nav>
      <h1 className="font-bold text-white text-4xl text-center">ARCADIA</h1>
    </header>
  );
}
