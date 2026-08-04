import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/Sidebar";
import {
  Sparkles,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import Link from "next/link";

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
        className="opacity-30"
      />
      <circle
        cx="20"
        cy="20"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="opacity-50"
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

// ==================== Main Layout ====================
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] selection:bg-[#e6b741]/30 selection:text-[#0F1F18] relative">
      {/* ===== Background Texture ===== */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.008]"
        style={{
          backgroundImage: `radial-gradient(circle at 15% 25%, #b45309 1px, transparent 1px),
                            radial-gradient(circle at 85% 75%, #166534 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
        }}
      />

      {/* ===== Background Blurs ===== */}
      <div className="fixed top-0 right-0 w-[50%] h-[50%] bg-[#e6b741]/[0.015] rounded-full blur-[120px] pointer-events-none -translate-y-1/4 translate-x-1/4" />
      <div className="fixed bottom-0 left-0 w-[40%] h-[40%] bg-[#2D6A4F]/[0.015] rounded-full blur-[100px] pointer-events-none translate-y-1/4 -translate-x-1/4" />

      {/* ===== Top Bar ===== */}
      <header className="sticky top-0 z-30 h-14 bg-white/70 backdrop-blur-xl border-b border-stone-200/60 flex items-center justify-between px-6">
        {/* Left: Logo + Brand */}
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 shadow-md shadow-amber-200/30 flex items-center justify-center transition-transform group-hover:scale-105">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div className="h-5 w-px bg-stone-200" />
          <span className="text-sm font-black text-stone-800 tracking-tight hidden sm:block">
            پنل مدیریت
          </span>
          <DecorativeLine className="text-[#e6b741] hidden sm:block" />
        </Link>

        {/* Right: User Info + Actions */}
        <div className="flex items-center gap-4">
          {/* Online Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-stone-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            آنلاین
          </div>

          {/* Admin Badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 rounded-full px-3 py-1.5">
            <Sparkles className="w-3 h-3 text-[#e6b741]" />
            <span className="text-[10px] font-bold text-amber-700">
              ADMIN
            </span>
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center text-xs font-bold text-stone-600 shadow-sm">
              {session.user.name?.[0] || "A"}
            </div>
            <div className="hidden md:block text-right">
              <p className="text-[11px] font-bold text-stone-700 leading-tight">
                {session.user.name || "ادمین"}
              </p>
              <p className="text-[9px] text-stone-400 leading-tight">
                {session.user.email || ""}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Decorative Top Border ===== */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#e6b741]/20 to-transparent" />

      {/* ===== Main Layout ===== */}
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 mr-64 p-6 md:p-8 min-h-[calc(100vh-3.5rem)]">
          {/* Subtle container with shadow for depth */}
          <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm shadow-stone-100/50 p-6 md:p-8 min-h-[calc(100vh-8rem)] relative">
            {/* Decorative corner element */}
            <DecorativeCircle
              size={32}
              className="absolute top-4 left-4 text-[#e6b741]/20 pointer-events-none"
            />

            {children}
          </div>
        </main>
      </div>

      {/* ===== Footer Bar ===== */}
      <footer className="border-t border-stone-200/60 bg-white/50 backdrop-blur-sm px-6 py-2.5 flex items-center justify-between text-[10px] text-stone-400">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
            <span className="text-white font-black text-[7px]">Z</span>
          </div>
          <span>زبانیون — پنل مدیریت</span>
        </div>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}