"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  LogOut,
  Sparkles,
  ChevronLeft,
  Key,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  X,
} from "lucide-react";

// ==================== Types ====================
interface MenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  userName?: string | null;
  userEmail?: string | null;
}

// ==================== Menu Configuration ====================
const menuItems: MenuItem[] = [
  { href: "/admin/dashboard", label: "داشبورد", icon: LayoutDashboard },
  { href: "/admin/articles", label: "مقالات", icon: FileText },
  { href: "/admin/prompts", label: "پرامپت‌ها", icon: MessageSquare },
  { href: "/admin/preregistrations", label: "پیش‌ثبت‌نام‌ها", icon: Users },
  { href: "/admin/keyword-pools", label: "کیوردها", icon: Key },
];

// ==================== User Profile Dropdown ====================
function UserProfileSection({
  collapsed,
  userName,
  userEmail,
}: {
  collapsed: boolean;
  userName?: string | null;
  userEmail?: string | null;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (collapsed) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center text-xs font-bold text-stone-600 shadow-sm hover:shadow-md transition-all"
          title={userName || "ادمین"}
        >
          {userName?.[0]?.toUpperCase() || "A"}
        </button>

        {showMenu && (
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-2xl border border-stone-200 shadow-xl p-2 z-50">
            <div className="px-3 py-2 border-b border-stone-100 mb-1">
              <p className="text-sm font-bold text-stone-800">{userName || "ادمین"}</p>
              <p className="text-[10px] text-stone-400">{userEmail || ""}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-stone-50 transition-all group"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center text-xs font-bold text-stone-600 shadow-sm flex-shrink-0">
          {userName?.[0]?.toUpperCase() || "A"}
        </div>
        <div className="flex-1 text-right min-w-0">
          <p className="text-[11px] font-bold text-stone-700 leading-tight truncate">
            {userName || "ادمین"}
          </p>
          <p className="text-[9px] text-stone-400 leading-tight truncate">
            {userEmail || ""}
          </p>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
            showMenu ? "rotate-180" : ""
          }`}
        />
      </button>

      {showMenu && (
        <div className="absolute bottom-full right-0 mb-2 w-full bg-white rounded-2xl border border-stone-200 shadow-xl p-2 z-50">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            خروج از حساب
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== Mobile Bottom Navigation ====================
function MobileBottomNav({ pathname }: { pathname: string }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-stone-200/60 z-40 lg:hidden pb-safe">
      <div className="flex items-center justify-around px-1 py-1.5">
        {menuItems.slice(0, 5).map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all min-w-[56px] relative ${
                isActive
                  ? "text-amber-600"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <div className={`relative ${isActive ? "scale-110" : ""} transition-transform`}>
                <Icon className="w-5 h-5" />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full border-2 border-white" />
                )}
              </div>
              <span className="text-[9px] font-bold leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ==================== Main Sidebar Component ====================
export default function AdminSidebar({
  collapsed,
  onToggleCollapse,
  userName,
  userEmail,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Listen for custom event from header
  useEffect(() => {
    const handler = () => setMobileOpen(true);
    window.addEventListener("toggle-mobile-sidebar", handler);
    return () => window.removeEventListener("toggle-mobile-sidebar", handler);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  // ===== Shared Navigation Content =====
  const navigationContent = (
    <nav className="flex-1 space-y-1 overflow-y-auto">
      {menuItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2.5 rounded-xl text-sm font-medium transition-all group relative ${
              collapsed && !mobileOpen ? "justify-center px-0 py-3" : "px-3 py-2.5"
            } ${
              isActive
                ? "bg-amber-50 text-amber-700 shadow-sm"
                : "text-stone-500 hover:text-stone-700 hover:bg-stone-50"
            }`}
            title={collapsed && !mobileOpen ? item.label : undefined}
          >
            <Icon
              className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                isActive ? "text-amber-600" : ""
              }`}
            />
            {(!collapsed || mobileOpen) && (
              <>
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <ChevronLeft className="w-3 h-3 mr-auto text-amber-500" />
                )}
              </>
            )}
            {collapsed && !mobileOpen && isActive && (
              <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-amber-500 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  // ===== Shared Footer Content =====
  const footerContent = (
    <div className={`mt-4 space-y-2 ${collapsed && !mobileOpen ? "flex flex-col items-center" : ""}`}>
      {/* Collapse Toggle (Desktop only) */}
      <button
        onClick={onToggleCollapse}
        className={`hidden lg:flex items-center gap-2.5 rounded-xl text-sm font-medium text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-all ${
          collapsed ? "justify-center w-10 h-10 mx-auto" : "w-full px-3 py-2.5"
        }`}
        title={collapsed ? "باز کردن منو" : "بستن منو"}
      >
        {collapsed ? (
          <PanelLeft className="w-4 h-4" />
        ) : (
          <>
            <PanelLeftClose className="w-4 h-4" />
            <span>بستن منو</span>
          </>
        )}
      </button>

      {/* User Profile */}
      <UserProfileSection
        collapsed={collapsed && !mobileOpen}
        userName={userName}
        userEmail={userEmail}
      />

      {/* Logout */}
      {(!collapsed || mobileOpen) && (
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>خروج</span>
        </button>
      )}
    </div>
  );

  // ===== Header Content =====
  const headerContent = (
    <div className={`flex items-center mb-8 pt-2 ${collapsed && !mobileOpen ? "justify-center" : "px-2"}`}>
      {(!collapsed || mobileOpen) ? (
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-md shadow-amber-200/30 flex items-center justify-center transition-transform group-hover:scale-105 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-stone-900">زبانیون</h2>
            <p className="text-[10px] text-stone-400">پنل مدیریت</p>
          </div>
        </Link>
      ) : (
        <Link
          href="/admin"
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-md shadow-amber-200/30 flex items-center justify-center hover:scale-105 transition-transform"
          title="داشبورد"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </Link>
      )}
    </div>
  );

  return (
    <>
      {/* ===== Desktop Sidebar ===== */}
      <aside
        className={`hidden lg:flex flex-col fixed right-0 top-14 h-[calc(100vh-3.5rem)] bg-white border-l border-stone-200 transition-all duration-300 z-30 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className={`flex flex-col h-full transition-all duration-300 ${
          collapsed ? "items-center px-2" : "px-4"
        }`}>
          {headerContent}
          {navigationContent}
          {footerContent}
        </div>
      </aside>

      {/* ===== Mobile Overlay ===== */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ===== Mobile Slide-in Sidebar ===== */}
      <aside
        ref={sidebarRef}
        className={`lg:hidden fixed top-0 right-0 h-full w-72 bg-white border-l border-stone-200 z-50 transform transition-transform duration-300 ease-in-out shadow-xl ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 left-4 w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors"
            aria-label="بستن منو"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Use same header without collapsed mode */}
          <div className="flex items-center mb-8 pt-2 px-2">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-md shadow-amber-200/30 flex items-center justify-center transition-transform group-hover:scale-105 flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-black text-stone-900">زبانیون</h2>
                <p className="text-[10px] text-stone-400">پنل مدیریت</p>
              </div>
            </Link>
          </div>

          {navigationContent}
          {footerContent}
        </div>
      </aside>

      {/* ===== Mobile Bottom Navigation ===== */}
      <MobileBottomNav pathname={pathname} />
    </>
  );
}