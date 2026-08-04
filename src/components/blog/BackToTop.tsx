"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 left-6 z-50 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:shadow-lg hover:border-amber-300 transition-all"
    >
      <ChevronUp className="w-5 h-5 text-gray-400" />
    </button>
  );
}