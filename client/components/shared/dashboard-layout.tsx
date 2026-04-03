"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Home,
  LogOut,
  MessageSquare,
  Moon,
  Search,
  Star,
  Sun,
  Users,
  Bell,
  BarChart3,
  Shield,
  Settings,
  GraduationCap,
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
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const STUDENT_NAV: NavItem[] = [
  { label: "Trang chủ", href: "/student/dashboard", icon: Home },
  { label: "Tìm gia sư", href: "/student/search", icon: Search },
  { label: "Lịch hẹn", href: "/student/bookings", icon: CalendarDays },
];

const TUTOR_NAV: NavItem[] = [
  { label: "Trang chủ", href: "/tutor/dashboard", icon: Home },
  { label: "Học sinh", href: "/tutor/students", icon: Users },
  { label: "Lịch dạy", href: "/tutor/calendar", icon: CalendarDays },
  { label: "Thu nhập", href: "/tutor/earnings", icon: CreditCard },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Tổng quan", href: "/admin/dashboard", icon: BarChart3 },
  { label: "Người dùng", href: "/admin/users", icon: Shield },
  { label: "Gia sư", href: "/admin/tutors", icon: GraduationCap },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const role = user?.role ?? "Student";
  const navItems =
    role === "Tutor"
      ? TUTOR_NAV
      : role === "Admin"
      ? ADMIN_NAV
      : STUDENT_NAV;

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-blue-600" />
            <span className="font-bold text-lg text-gray-900 dark:text-white">GiaSu Plus</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="px-3 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.fullName ?? "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.role ?? "Student"}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <Link href="/auth" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Cài đặt
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  window.location.href = "/auth";
                }}
                className="text-red-600 dark:text-red-400"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {navItems.find((n) => n.href === pathname)?.label ?? "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
