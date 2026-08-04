"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Users,
  Loader2,
  Crown,
  UserCheck,
  TrendingUp,
  Medal,
  Phone,
  Calendar,
  Hash,
  ArrowUpDown,
  RefreshCw,
  UserX,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

// ==================== Types ====================
interface Registration {
  id: string;
  username: string;
  phone: string;
  referralCode: string | null;
  queuePosition: number;
  priorityScore: number;
  referralCount: number;
  status: string;
  createdAt: string;
}

interface Stats {
  total: number;
  totalReferrals: number;
  todayNew: number;
  topReferrer: { username: string; count: number } | null;
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
      width="50"
      height="5"
      viewBox="0 0 50 5"
      fill="none"
      className={className}
    >
      <path
        d="M0,2.5 Q12.5,5 25,2.5 Q37.5,0 50,2.5"
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
function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-stone-200/60 p-4"
          >
            <div className="w-8 h-8 bg-stone-100 rounded-xl mb-3" />
            <div className="h-7 w-16 bg-stone-200 rounded-lg mb-2" />
            <div className="h-3 w-20 bg-stone-100 rounded-md" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden">
        <div className="p-4 bg-stone-50/50 border-b border-stone-100">
          <div className="h-8 bg-stone-100 rounded-lg w-full" />
        </div>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="p-4 border-b border-stone-50 flex items-center gap-4"
          >
            <div className="h-4 w-8 bg-stone-100 rounded" />
            <div className="h-4 w-24 bg-stone-100 rounded" />
            <div className="h-4 w-32 bg-stone-100 rounded" />
            <div className="h-4 w-20 bg-stone-100 rounded" />
            <div className="h-4 w-16 bg-stone-100 rounded" />
            <div className="h-4 w-12 bg-stone-100 rounded" />
            <div className="h-4 w-24 bg-stone-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== Helper: Safe Number Formatter ====================
function safeToLocaleString(value: number | undefined | null): string {
  if (value === undefined || value === null) return "۰";
  return value.toLocaleString("fa-IR");
}

// ==================== Main Component ====================
export default function PreregistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [stats, setStats] = useState<Stats>({
    total: 0,
    totalReferrals: 0,
    todayNew: 0,
    topReferrer: null,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<
    "priorityScore" | "referralCount" | "createdAt"
  >("priorityScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        search,
        limit: "25",
        sortBy,
        sortOrder,
        status: statusFilter,
      });
      const res = await fetch(`/api/admin/preregistrations?${params}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Safely set registrations
      setRegistrations(Array.isArray(data.registrations) ? data.registrations : []);

      // Safely set stats with defaults
      setStats({
        total: data.stats?.total ?? 0,
        totalReferrals: data.stats?.totalReferrals ?? 0,
        todayNew: data.stats?.todayNew ?? 0,
        topReferrer: data.stats?.topReferrer ?? null,
      });

      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error("Failed to load registrations:", err);
      setError("خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.");
      setRegistrations([]);
      setStats({ total: 0, totalReferrals: 0, todayNew: 0, topReferrer: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, search, sortBy, sortOrder, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Toggle sort
  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Stats cards - all values safely formatted
  const statsCards = [
    {
      icon: Users,
      label: "کل ثبت‌نام‌ها",
      value: safeToLocaleString(stats?.total),
      color: "from-blue-50 to-blue-100/50",
      iconColor: "text-blue-500",
      bgIcon: "bg-blue-50",
    },
    {
      icon: UserCheck,
      label: "دعوت‌های موفق",
      value: safeToLocaleString(stats?.totalReferrals),
      color: "from-emerald-50 to-emerald-100/50",
      iconColor: "text-emerald-500",
      bgIcon: "bg-emerald-50",
    },
    {
      icon: TrendingUp,
      label: "ثبت‌نام امروز",
      value: safeToLocaleString(stats?.todayNew),
      color: "from-purple-50 to-purple-100/50",
      iconColor: "text-purple-500",
      bgIcon: "bg-purple-50",
      highlight: (stats?.todayNew ?? 0) > 0,
    },
    {
      icon: Crown,
      label: "برترین دعوت‌کننده",
      value: stats?.topReferrer ? `@${stats.topReferrer.username}` : "—",
      subValue: stats?.topReferrer
        ? `${safeToLocaleString(stats.topReferrer.count)} دعوت`
        : "",
      color: "from-amber-50 to-amber-100/50",
      iconColor: "text-amber-500",
      bgIcon: "bg-amber-50",
    },
  ];

  // Status filter options
  const statusOptions = [
    { value: "all", label: "همه" },
    { value: "active", label: "فعال" },
    { value: "invited", label: "دعوت شده" },
    { value: "registered", label: "ثبت‌نام کامل" },
  ];

  return (
    <div className="relative">
      {/* ==================== Header ==================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <DecorativeCircle
            size={28}
            className="text-[#e6b741]/40 flex-shrink-0"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
              پیش‌ثبت‌نام‌ها
            </h1>
            <DecorativeLine className="text-[#e6b741] mt-1" />
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 text-[11px] font-medium text-stone-400 hover:text-[#e6b741] bg-white border border-stone-200/60 rounded-full px-3.5 py-2 transition-all hover:border-[#e6b741]/30"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          بروزرسانی
        </button>
      </div>

      {/* ==================== Error State ==================== */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200/60 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <UserX className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-700 mb-0.5">خطا</p>
            <p className="text-xs text-red-500">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-all"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {/* ==================== Stats Cards ==================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statsCards.map((card, i) => (
          <div
            key={i}
            className="group relative bg-white rounded-2xl border border-stone-200/60 p-4 hover:border-[#e6b741]/20 hover:shadow-md transition-all duration-300 overflow-hidden"
            style={{
              animationDelay: `${i * 80}ms`,
              animation: "fadeInUp 0.5s ease-out both",
            }}
          >
            {/* Background Gradient */}
            <div
              className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${card.color} rounded-full -translate-y-1/2 translate-x-1/2 opacity-40 pointer-events-none`}
            />

            {/* Icon */}
            <div
              className={`relative z-10 w-8 h-8 ${card.bgIcon} rounded-xl flex items-center justify-center mb-3`}
            >
              <card.icon className={`w-4 h-4 ${card.iconColor}`} />
            </div>

            {/* Value */}
            <p className="relative z-10 text-lg font-black text-stone-900 mb-1">
              {card.value}
              {card.highlight && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-500 bg-emerald-50 rounded-full px-1.5 py-0.5 mr-2 align-middle">
                  <Sparkles className="w-2.5 h-2.5" />
                  جدید
                </span>
              )}
            </p>

            {/* Label */}
            <p className="relative z-10 text-[10px] text-stone-400 font-medium">
              {card.label}
            </p>

            {/* Sub value */}
            {card.subValue && (
              <p className="relative z-10 text-[10px] text-stone-500 mt-0.5">
                {card.subValue}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ==================== Filters ==================== */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="جستجو با نام کاربری، شماره موبایل یا کد دعوت..."
            className="w-full h-11 pr-10 pl-4 bg-white border border-stone-200/60 rounded-xl text-sm outline-none transition-all focus:border-[#e6b741]/40 focus:ring-4 focus:ring-amber-50 placeholder:text-stone-300"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                setSearch("");
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 hover:text-red-400 font-bold transition-colors"
            >
              پاک کردن
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex gap-1 bg-white border border-stone-200/60 rounded-xl p-1">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setStatusFilter(option.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                statusFilter === option.value
                  ? "bg-[#e6b741] text-[#0F1F18] shadow-sm"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== Table ==================== */}
      {loading ? (
        <TableSkeleton />
      ) : registrations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-stone-200/60">
          <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mb-4">
            <UserX className="w-8 h-8 text-stone-300" />
          </div>
          <h2 className="text-base font-bold text-stone-800 mb-2">
            هیچ موردی یافت نشد
          </h2>
          <p className="text-sm text-stone-400">
            {search
              ? `نتیجه‌ای برای "${search}" پیدا نشد`
              : "هنوز پیش‌ثبت‌نامی انجام نشده است"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-100">
                  <th className="p-3.5 text-right text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    <Hash className="w-3 h-3 inline-block ml-1" />
                    ردیف
                  </th>
                  <th className="p-3.5 text-right text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    نام کاربری
                  </th>
                  <th className="p-3.5 text-right text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    <Phone className="w-3 h-3 inline-block ml-1" />
                    شماره تماس
                  </th>
                  <th className="p-3.5 text-right text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    دعوت از
                  </th>
                  <th
                    className="p-3.5 text-right text-[10px] font-bold text-stone-400 uppercase tracking-wider cursor-pointer hover:text-[#e6b741] transition-colors select-none"
                    onClick={() => toggleSort("referralCount")}
                  >
                    <div className="flex items-center gap-1">
                      تعداد دعوت
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 text-right text-[10px] font-bold text-stone-400 uppercase tracking-wider cursor-pointer hover:text-[#e6b741] transition-colors select-none"
                    onClick={() => toggleSort("priorityScore")}
                  >
                    <div className="flex items-center gap-1">
                      <Medal className="w-3 h-3" />
                      اولویت
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3.5 text-right text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th
                    className="p-3.5 text-right text-[10px] font-bold text-stone-400 uppercase tracking-wider cursor-pointer hover:text-[#e6b741] transition-colors select-none"
                    onClick={() => toggleSort("createdAt")}
                  >
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      تاریخ
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-50">
                {registrations.map((reg, i) => (
                  <tr
                    key={reg.id}
                    className="hover:bg-amber-50/20 transition-colors group"
                    style={{
                      animationDelay: `${i * 30}ms`,
                      animation: "fadeInUp 0.4s ease-out both",
                    }}
                  >
                    {/* Row Number */}
                    <td className="p-3.5">
                      <span className="text-[11px] text-stone-400 tabular-nums">
                        {(page - 1) * 25 + i + 1}
                      </span>
                    </td>

                    {/* Username */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-[10px] font-bold text-amber-700 flex-shrink-0">
                          {reg.username?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="text-sm font-bold text-stone-800 group-hover:text-[#e6b741] transition-colors">
                          @{reg.username || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="p-3.5">
                      <span
                        className="text-xs text-stone-500 font-mono"
                        dir="ltr"
                      >
                        {reg.phone || "—"}
                      </span>
                    </td>

                    {/* Referral Code */}
                    <td className="p-3.5">
                      {reg.referralCode ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <UserCheck className="w-3 h-3" />
                          @{reg.referralCode}
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-300">—</span>
                      )}
                    </td>

                    {/* Referral Count */}
                    <td className="p-3.5">
                      <span className="text-xs font-bold text-stone-700">
                        {safeToLocaleString(reg.referralCount)}
                      </span>
                    </td>

                    {/* Priority Score */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                ((reg.priorityScore || 0) / 100) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-amber-600">
                          {reg.priorityScore ?? 0}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          reg.status === "active"
                            ? "bg-blue-50 text-blue-600"
                            : reg.status === "invited"
                            ? "bg-purple-50 text-purple-600"
                            : reg.status === "registered"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-stone-50 text-stone-500"
                        }`}
                      >
                        {reg.status === "active" && "فعال"}
                        {reg.status === "invited" && "دعوت شده"}
                        {reg.status === "registered" && "ثبت‌نام کامل"}
                        {reg.status === "inactive" && "غیرفعال"}
                        {!reg.status && "نامشخص"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-3.5">
                      <span className="text-[11px] text-stone-400 whitespace-nowrap">
                        {reg.createdAt
                          ? new Date(reg.createdAt).toLocaleDateString(
                              "fa-IR",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===== Pagination ===== */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-stone-100 bg-stone-50/30">
              <p className="text-[11px] text-stone-400">
                نمایش {(page - 1) * 25 + 1} تا{" "}
                {Math.min(page * 25, stats?.total || 0)} از{" "}
                {safeToLocaleString(stats?.total)} مورد
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:text-[#e6b741] hover:border-[#e6b741]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Page Numbers */}
                {Array.from(
                  { length: Math.min(totalPages, 5) },
                  (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-[11px] font-bold transition-all ${
                          page === pageNum
                            ? "bg-[#e6b741] text-[#0F1F18] shadow-sm"
                            : "bg-white border border-stone-200 text-stone-500 hover:border-[#e6b741]/30"
                        }`}
                      >
                        {safeToLocaleString(pageNum)}
                      </button>
                    );
                  }
                )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:text-[#e6b741] hover:border-[#e6b741]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}