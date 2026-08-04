"use client";

import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  content: string;
}

export function TableOfContents({ content }: Props) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // صبر می‌کنیم تا DOM رندر شود
    const timer = setTimeout(() => {
      const articleContent = document.querySelector('.article-content');
      if (!articleContent) return;

      const els = articleContent.querySelectorAll("h2, h3");
      const items: { id: string; text: string; level: number }[] = [];

      els.forEach((el, i) => {
        const id = `toc-${i}`;
        el.id = id;
        items.push({ id, text: el.textContent || "", level: el.tagName === "H2" ? 2 : 3 });
      });

      setHeadings(items);
    }, 100);

    return () => clearTimeout(timer);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // ارتفاع هدر sticky
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setIsOpen(false);
    }
  };

  if (headings.length < 2) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:cursor-default"
      >
        <span className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-500" />
          فهرست مطالب
        </span>
        <span className="text-[10px] text-gray-400 lg:hidden">{isOpen ? "▲" : "▼"}</span>
      </button>
      <nav className={`px-4 pb-3 space-y-0.5 ${isOpen ? "block" : "hidden"} lg:block`}>
        {headings.map((h) => (
          <button
            key={h.id}
            onClick={() => scrollToHeading(h.id)}
            className={`block w-full text-right text-[11px] py-1.5 px-2 rounded-lg transition-colors truncate ${
              h.level === 3 ? "pr-5" : ""
            } ${
              activeId === h.id
                ? "bg-amber-50 text-amber-600 font-medium"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {h.level === 3 && <span className="text-gray-300 ml-1">—</span>}
            {h.text}
          </button>
        ))}
      </nav>
    </div>
  );
}