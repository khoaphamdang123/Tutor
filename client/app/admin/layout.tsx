"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import AdminSidebar from "@/components/shared/admin-sidebar";
import { useAuthStore } from "@/lib/auth-store";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Always call ALL hooks first — never before any conditional return
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  const isAuthPage = pathname.startsWith("/admin/auth");
  const isAuthorized = isAuthenticated && user?.role === "Admin";

  // Redirect to admin login if not authenticated or not an Admin
  useEffect(() => {
    if (!isAuthorized) {
      router.replace("/admin/auth");
    }
  }, [isAuthorized, router]);

  // Admin auth page: no sidebar/topbar shell
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Not authorized yet: render nothing while redirecting
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950">
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              Admin Panel
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
