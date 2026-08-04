"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement;
      const st = window.scrollY;
      const dh = h.scrollHeight - window.innerHeight;
      setProgress(dh > 0 ? Math.min((st / dh) * 100, 100) : 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (progress < 1) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2px] bg-gray-100">
      <div
        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}