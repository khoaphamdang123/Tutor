"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  Megaphone,
  CalendarCheck,
  CreditCard,
  RefreshCcw,
  Settings,
  ChevronDown,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    title: "Tổng quan",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
      { label: "Người dùng", href: "/admin/users", icon: Users },
    ],
  },
  {
    title: "Quản lý",
    items: [
      { label: "Gia sư", href: "/admin/tutors", icon: GraduationCap },
      { label: "Lớp học", href: "/admin/classes", icon: Layers },
      { label: "Môn học", href: "/admin/subjects", icon: BookOpen },
      { label: "Lớp mở", href: "/admin/open-classes", icon: Megaphone },
    ],
  },
  {
    title: "Hoạt động",
    items: [
      { label: "Đặt lịch", href: "/admin/bookings", icon: CalendarCheck },
      { label: "Thanh toán", href: "/admin/payments", icon: CreditCard },
      { label: "Yêu cầu hoàn tiền", href: "/admin/refunds", icon: RefreshCcw },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <aside className="w-64 bg-slate-900 flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700/50">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-blue-400" />
          <div>
            <span className="font-bold text-lg text-white block">GiaSu Plus</span>
            <span className="text-xs text-slate-400">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {SECTIONS.map((section) => (
          <div key={section.title ?? "main"}>
            {section.title && (
              <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile + logout */}
      <div className="px-3 pb-4 border-t border-slate-700/50 pt-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-blue-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.fullName ?? "Admin"}
                </p>
                <p className="text-xs text-slate-400 truncate">Admin</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500 flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Cài đặt
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                window.location.href = "/admin/auth";
              }}
              className="text-red-400 cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
