// src/app/blog/page.tsx

import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  Eye,
  Search,
  BookOpen,
  ChevronLeft,
  Hash,
  ArrowLeft,
  X,
} from "lucide-react";

// ==================== Metadata ====================
export const metadata: Metadata = {
  title: "مقالات آموزشی زبان انگلیسی | زبانیون",
  description:
    "مجموعه مقالات آموزشی زبان انگلیسی شامل گرامر، مکالمه، آیلتس، لغات و نکات یادگیری زبان",
  openGraph: {
    title: "مقالات آموزشی زبان انگلیسی | زبانیون",
    description:
      "مجموعه مقالات آموزشی زبان انگلیسی شامل گرامر، مکالمه، آیلتس، لغات و نکات یادگیری زبان",
  },
};

// ==================== Types ====================
interface ArticleCard {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string | null;
  keywords: string[];
  readingTime: number | null;
  viewCount: number;
  publishedAt: Date | null;
}

interface CategoryResult {
  category: string | null;
}

// ==================== Helper: Persian Date ====================
function formatPersianDate(date: Date): string {
  return new Date(date).toLocaleDateString("fa-IR", {
    month: "short",
    day: "numeric",
  });
}

// ==================== Decorative Elements ====================
function DecorativeLine({ className = "" }: { className?: string }) {
  return (
    <svg
      width="80"
      height="6"
      viewBox="0 0 80 6"
      fill="none"
      className={className}
    >
      <path
        d="M0,3 Q20,6 40,3 Q60,0 80,3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        className="opacity-40"
      />
    </svg>
  );
}

// ==================== Page Component ====================
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const category = params.category || "";
  const limit = 12;

  // --- Build Query ---
  const where: Record<string, unknown> = { isPublished: true };

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
      { keywords: { hasSome: [search] } },
    ];
  }

  if (category) {
    where.category = category;
  }

  // --- Data Fetching ---
  const [articles, total, categoriesResult] = await Promise.all([
    prisma.seoArticle.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        keywords: true,
        readingTime: true,
        viewCount: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.seoArticle.count({ where }),
    prisma.seoArticle.findMany({
      where: { isPublished: true, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    }) as Promise<CategoryResult[]>,
  ]);

  // Extract unique category strings
  const categories: string[] = categoriesResult
    .map((cat: CategoryResult) => cat.category)
    .filter((cat: string | null): cat is string => cat !== null);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-[#FBFBF9] selection:bg-[#e6b741]/30 selection:text-[#0F1F18] relative">
      {/* ===== Subtle Background Texture ===== */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.012]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 35%, #b45309 1px, transparent 1px),
                            radial-gradient(circle at 75% 65%, #166534 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* ===== Background Blurs ===== */}
      <div className="fixed top-0 right-0 w-[60%] h-[60%] bg-[#e6b741]/[0.03] rounded-full blur-[150px] pointer-events-none -translate-y-1/4 translate-x-1/4" />
      <div className="fixed bottom-0 left-0 w-[50%] h-[50%] bg-[#2D6A4F]/[0.03] rounded-full blur-[130px] pointer-events-none translate-y-1/4 -translate-x-1/4" />

      {/* ==================== Header with Integrated Search ==================== */}
      <header className="sticky top-0 z-40 px-4 py-4">
        <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-xl shadow-lg shadow-black/[0.03] rounded-full px-4 py-2.5 flex items-center gap-3 border border-stone-200/50">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="زبانیون"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg object-contain"
            />
            <div className="h-5 w-px bg-stone-200" />
            <span className="text-stone-400 text-[11px] font-medium hidden lg:inline-block whitespace-nowrap">
              کتابخانه یادگیری زبان
            </span>
          </Link>

          {/* Search Bar - Inside Header */}
          <form method="GET" className="flex-1 min-w-0">
            <div className="relative flex items-center bg-stone-50/80 border border-stone-200/60 rounded-full overflow-hidden transition-all focus-within:bg-white focus-within:border-[#e6b741]/40 focus-within:shadow-md focus-within:shadow-amber-100/20">
              <Search className="absolute right-3.5 w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="جستجوی مقاله..."
                className="w-full h-9 pr-9 pl-3 bg-transparent text-xs outline-none placeholder:text-stone-300 text-stone-700"
              />
              {search && (
                <Link
                  href="/blog"
                  className="ml-1 p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                >
                  <X className="w-3 h-3" />
                </Link>
              )}
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/"
              className="group flex items-center gap-1.5 bg-[#e6b741] hover:bg-[#d4a635] text-[#0F1F18] px-4 py-2 rounded-full text-xs font-bold transition-all shadow-[0_4px_15px_rgba(230,183,65,0.2)] hover:shadow-[0_6px_20px_rgba(230,183,65,0.3)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="hidden sm:inline">پیش‌ثبت‌نام</span>
              <span className="sm:hidden">ثبت‌نام</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ==================== Hero Section ==================== */}
      <section className="pt-8 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-stone-900 mb-3 leading-[1.15] tracking-tight">
            مسیر یادگیری‌ات رو با{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#e6b741]">
                مقاله‌های ما
              </span>
              <DecorativeLine className="absolute -bottom-2 right-0 text-[#e6b741]" />
            </span>{" "}
            پیدا کن
          </h1>
        </div>
      </section>

      {/* ==================== Category Filter - Single Row with Horizontal Scroll ==================== */}
      {categories.length > 0 && (
        <div className="px-4 pb-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide flex-nowrap">
              <Link
                href="/blog"
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-bold transition-all duration-300 whitespace-nowrap ${
                  !category
                    ? "bg-stone-800 text-white shadow-lg shadow-stone-200/50"
                    : "bg-white border border-stone-200 text-stone-500 hover:border-[#e6b741]/30 hover:text-[#e6b741]"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3 h-3" />
                  همه
                </span>
              </Link>

              {categories.map((cat: string) => (
                <Link
                  key={cat}
                  href={`/blog?category=${encodeURIComponent(cat)}`}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-bold transition-all duration-300 whitespace-nowrap ${
                    category === cat
                      ? "bg-[#e6b741] text-[#0F1F18] shadow-lg shadow-amber-200/30"
                      : "bg-white border border-stone-200 text-stone-500 hover:border-[#e6b741]/30 hover:text-[#e6b741]"
                  }`}
                >
                  {cat}
                </Link>
              ))}

              {/* Fade gradient for scroll hint */}
              <div className="w-12 h-8 bg-gradient-to-l from-[#FBFBF9] to-transparent flex-shrink-0 pointer-events-none sticky right-0" />
            </div>
          </div>
        </div>
      )}

      {/* ==================== Articles Grid - 4 Columns Desktop ==================== */}
      <section className="px-4 pb-10">
        <div className="max-w-6xl mx-auto">
          {articles.length === 0 ? (
            // Empty State
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Search className="w-6 h-6 text-stone-300" />
              </div>
              <h2 className="text-lg font-bold text-stone-800 mb-2">
                مقاله‌ای یافت نشد
              </h2>
              <p className="text-stone-400 text-xs mb-6">
                {search
                  ? `نتیجه‌ای برای "${search}" پیدا نشد`
                  : "هنوز مقاله‌ای در این دسته‌بندی منتشر نشده"}
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#e6b741] hover:text-amber-600 bg-amber-50 hover:bg-amber-100 px-4 py-2.5 rounded-full transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                همه مقالات
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {articles.map((article: ArticleCard, index: number) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== Pagination ==================== */}
      {totalPages > 1 && (
        <div className="px-4 pb-12">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-1.5">
            {/* Previous */}
            {page > 1 ? (
              <Link
                href={`/blog?page=${page - 1}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`}
                className="w-9 h-9 rounded-xl border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-[#e6b741]/40 hover:text-[#e6b741] transition-all"
                aria-label="صفحه قبل"
              >
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </Link>
            ) : (
              <div className="w-9 h-9 rounded-xl border border-stone-100 bg-stone-50/50 flex items-center justify-center text-stone-300 cursor-not-allowed">
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </div>
            )}

            {/* Page Numbers */}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }

              const isActive = page === pageNum;

              return (
                <Link
                  key={pageNum}
                  href={`/blog?page=${pageNum}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`}
                  className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-stone-800 text-white shadow-lg shadow-stone-200/50"
                      : "bg-white border border-stone-200 text-stone-500 hover:border-[#e6b741]/30 hover:text-[#e6b741]"
                  }`}
                >
                  {pageNum.toLocaleString("fa-IR")}
                </Link>
              );
            })}

            {/* Next */}
            {page < totalPages ? (
              <Link
                href={`/blog?page=${page + 1}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`}
                className="w-9 h-9 rounded-xl border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-[#e6b741]/40 hover:text-[#e6b741] transition-all"
                aria-label="صفحه بعد"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
            ) : (
              <div className="w-9 h-9 rounded-xl border border-stone-100 bg-stone-50/50 flex items-center justify-center text-stone-300 cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Article Card Component ====================
function ArticleCard({
  article,
  index,
}: {
  article: ArticleCard;
  index: number;
}) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group block bg-white rounded-[24px] border border-stone-200/80 overflow-hidden hover:border-[#e6b741]/30 hover:shadow-xl hover:shadow-amber-100/20 transition-all duration-300 hover:-translate-y-1"
      style={{
        animationDelay: `${index * 60}ms`,
        animation: "fadeInUp 0.5s ease-out both",
      }}
    >
      {/* Cover Image */}
      <div className="relative aspect-[4/3] bg-stone-50 overflow-hidden">
        {article.coverImage ? (
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-50 via-amber-100/30 to-emerald-50/50 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-amber-300/50 group-hover:scale-110 transition-transform duration-500" />
          </div>
        )}

        {/* Category Badge */}
        {article.category && (
          <div className="absolute top-2.5 right-2.5">
            <span className="inline-block text-[10px] font-bold text-[#0F1F18]/70 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-stone-100">
              {article.category}
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Title */}
        <h3 className="text-sm font-bold text-stone-800 mb-1.5 line-clamp-2 leading-relaxed group-hover:text-[#e6b741] transition-colors">
          {article.title}
        </h3>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-[11px] text-stone-400 line-clamp-2 mb-3 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between pt-2.5 border-t border-stone-100">
          <div className="flex items-center gap-2.5 text-[10px] text-stone-400">
            {article.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readingTime} min
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {article.viewCount.toLocaleString("fa-IR")}
            </span>
          </div>

          {article.publishedAt && (
            <span className="text-[10px] text-stone-400">
              {formatPersianDate(article.publishedAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}