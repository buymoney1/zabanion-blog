"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Users,
  Eye,
  TrendingUp,
  Loader2,
  MessageSquare,
  Sparkles,
  ArrowUpLeft,
  Plus,
  PenTool,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  totalArticles: number;
  publishedArticles: number;
  totalViews: number;
  totalPreregistrations: number;
  todayPreregistrations: number;
}

// ==================== Decorative Elements ====================
function DecorativeCircle({
  className = "",
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
    >
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="4 3"
        className="opacity-25"
      />
      <circle
        cx="20"
        cy="20"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="opacity-45"
      />
    </svg>
  );
}

function DecorativeLine({ className = "" }: { className?: string }) {
  return (
    <svg
      width="60"
      height="5"
      viewBox="0 0 60 5"
      fill="none"
      className={className}
    >
      <path
        d="M0,2.5 Q15,5 30,2.5 Q45,0 60,2.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        className="opacity-25"
      />
    </svg>
  );
}

// ==================== Skeleton Loader ====================
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Title Skeleton */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-full bg-stone-200" />
        <div className="h-7 w-32 bg-stone-200 rounded-lg" />
        <div className="h-4 w-24 bg-stone-100 rounded-md" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-stone-200/60 p-5"
          >
            <div className="w-8 h-8 bg-stone-100 rounded-xl mb-4" />
            <div className="h-8 w-16 bg-stone-200 rounded-lg mb-2" />
            <div className="h-3 w-20 bg-stone-100 rounded-md" />
          </div>
        ))}
      </div>

      {/* Action Cards Skeleton */}
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-stone-200/60 p-6 flex flex-col items-center"
          >
            <div className="w-12 h-12 bg-stone-100 rounded-2xl mb-4" />
            <div className="h-5 w-28 bg-stone-200 rounded-lg mb-2" />
            <div className="h-3 w-40 bg-stone-100 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== Main Component ====================
export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Loading State
  if (loading) {
    return <DashboardSkeleton />;
  }

  // Error State
  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <TrendingUp className="w-8 h-8 text-red-300" />
        </div>
        <h2 className="text-lg font-bold text-stone-800 mb-2">
          خطا در دریافت اطلاعات
        </h2>
        <p className="text-sm text-stone-400 mb-4">
          لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-xs font-bold text-[#e6b741] hover:text-amber-600 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-full transition-all"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  // ==================== Stats Cards Data ====================
  const statsCards = [
    {
      icon: FileText,
      label: "کل مقالات",
      value: stats.totalArticles,
      href: "/admin/articles",
      color: "from-blue-50 to-blue-100/50",
      iconColor: "text-blue-500",
      bgIcon: "bg-blue-50",
    },
    {
      icon: TrendingUp,
      label: "منتشر شده",
      value: stats.publishedArticles,
      href: "/admin/articles?status=published",
      color: "from-emerald-50 to-emerald-100/50",
      iconColor: "text-emerald-500",
      bgIcon: "bg-emerald-50",
    },
    {
      icon: Eye,
      label: "بازدید کل",
      value: stats.totalViews.toLocaleString("fa-IR"),
      href: "#",
      color: "from-purple-50 to-purple-100/50",
      iconColor: "text-purple-500",
      bgIcon: "bg-purple-50",
    },
    {
      icon: Users,
      label: "پیش‌ثبت‌نام کل",
      value: stats.totalPreregistrations.toLocaleString("fa-IR"),
      href: "/admin/preregistrations",
      color: "from-amber-50 to-amber-100/50",
      iconColor: "text-amber-500",
      bgIcon: "bg-amber-50",
    },
    {
      icon: Sparkles,
      label: "ثبت‌نام امروز",
      value: stats.todayPreregistrations.toLocaleString("fa-IR"),
      href: "/admin/preregistrations",
      color: "from-rose-50 to-rose-100/50",
      iconColor: "text-rose-500",
      bgIcon: "bg-rose-50",
      highlight: stats.todayPreregistrations > 0,
    },
  ];

  return (
    <div className="relative">
      {/* ===== Header ===== */}
      <div className="flex items-center gap-3 mb-8">
        <DecorativeCircle size={28} className="text-[#e6b741]/40 flex-shrink-0" />
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
            داشبورد
          </h1>
          <DecorativeLine className="text-[#e6b741] mt-1" />
        </div>
        {/* Today's Date */}
        <div className="mr-auto text-[11px] text-stone-400 bg-white border border-stone-200/60 rounded-full px-3 py-1.5 hidden sm:block">
          {new Date().toLocaleDateString("fa-IR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* ===== Stats Cards ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
        {statsCards.map((card, i) => (
          <Link
            key={i}
            href={card.href}
            className="group relative bg-white rounded-2xl border border-stone-200/60 p-4 md:p-5 hover:border-[#e6b741]/30 hover:shadow-lg hover:shadow-amber-100/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            style={{
              animationDelay: `${i * 80}ms`,
              animation: "fadeInUp 0.5s ease-out both",
            }}
          >
            {/* Background Gradient */}
            <div
              className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${card.color} rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none`}
            />

            {/* Icon */}
            <div
              className={`relative z-10 w-9 h-9 ${card.bgIcon} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
            >
              <card.icon className={`w-4.5 h-4.5 ${card.iconColor}`} />
            </div>

            {/* Value */}
            <p className="relative z-10 text-xl md:text-2xl font-black text-stone-900 mb-1 tracking-tight">
              {card.value}
              {card.highlight && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-500 bg-emerald-50 rounded-full px-1.5 py-0.5 mr-2 align-middle">
                  <ArrowUpLeft className="w-2.5 h-2.5" />
                  جدید
                </span>
              )}
            </p>

            {/* Label */}
            <p className="relative z-10 text-[11px] text-stone-400 font-medium">
              {card.label}
            </p>
          </Link>
        ))}
      </div>

      {/* ===== Quick Actions ===== */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* New Article */}
        <Link
          href="/admin/articles/new"
          className="group relative bg-white rounded-2xl border border-stone-200/60 p-6 hover:border-[#e6b741]/40 hover:shadow-lg hover:shadow-amber-100/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col items-center text-center"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none" />

          {/* Icon */}
          <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <PenTool className="w-6 h-6 text-[#e6b741]" />
          </div>

          {/* Content */}
          <h3 className="relative z-10 text-base font-bold text-stone-800 mb-1.5 group-hover:text-[#e6b741] transition-colors">
            مقاله جدید
          </h3>
          <p className="relative z-10 text-xs text-stone-400 mb-4 leading-relaxed">
            ایجاد مقاله جدید با کمک هوش مصنوعی
          </p>

          {/* CTA */}
          <span className="relative z-10 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#e6b741] group-hover:gap-2 transition-all">
            <Plus className="w-3.5 h-3.5" />
            شروع نوشتن
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          </span>
        </Link>

        {/* Manage Prompts */}
        <Link
          href="/admin/prompts"
          className="group relative bg-white rounded-2xl border border-stone-200/60 p-6 hover:border-[#e6b741]/40 hover:shadow-lg hover:shadow-amber-100/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col items-center text-center"
        >
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-transparent rounded-full -translate-y-1/2 -translate-x-1/2 opacity-60 pointer-events-none" />

          {/* Icon */}
          <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <MessageSquare className="w-6 h-6 text-purple-500" />
          </div>

          {/* Content */}
          <h3 className="relative z-10 text-base font-bold text-stone-800 mb-1.5 group-hover:text-purple-500 transition-colors">
            مدیریت پرامپت‌ها
          </h3>
          <p className="relative z-10 text-xs text-stone-400 mb-4 leading-relaxed">
            ثبت و ویرایش پرامپت‌های تولید محتوا
          </p>

          {/* CTA */}
          <span className="relative z-10 inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-500 group-hover:gap-2 transition-all">
            <Sparkles className="w-3.5 h-3.5" />
            مشاهده پرامپت‌ها
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          </span>
        </Link>
      </div>

      {/* ===== Empty Stats Helpers ===== */}
      {stats.totalArticles === 0 && (
        <div className="mt-6 bg-amber-50/50 border border-amber-200/40 rounded-2xl p-5 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#e6b741] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800 mb-1">
              هنوز مقاله‌ای نساختی!
            </p>
            <p className="text-xs text-amber-600/80 leading-relaxed">
              با کلیک روی «مقاله جدید» اولین مقاله‌ات رو با هوش مصنوعی بساز و
              منتشر کن.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}