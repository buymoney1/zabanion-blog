"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, FileText, MessageSquare,
  Users, LogOut, Sparkles, ChevronLeft,
} from "lucide-react";

const menuItems = [
  { href: "/admin/dashboard", label: "داشبورد", icon: LayoutDashboard },
  { href: "/admin/articles", label: "مقالات", icon: FileText },
  { href: "/admin/prompts", label: "پرامپت‌ها", icon: MessageSquare },
  { href: "/admin/preregistrations", label: "پیش‌ثبت‌نام‌ها", icon: Users },
  { href: "/admin/keyword-pools", label: "کیوردها", icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed right-0 top-0 h-full w-64 bg-white border-l border-stone-200 p-4 flex flex-col">
      <div className="flex items-center gap-2.5 mb-8 px-2">
        <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-black text-stone-900">زبانیون</h2>
          <p className="text-[10px] text-stone-400">پنل مدیریت</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-amber-50 text-amber-700"
                  : "text-stone-500 hover:text-stone-700 hover:bg-stone-50"
              }`}>
              <Icon className="w-4 h-4" />
              {item.label}
              {isActive && <ChevronLeft className="w-3 h-3 mr-auto" />}
            </Link>
          );
        })}
      </nav>

      <button onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all mt-4">
        <LogOut className="w-4 h-4" />
        خروج
      </button>
    </aside>
  );
}