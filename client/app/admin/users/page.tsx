"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Users,
  GraduationCap,
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  UserX,
  UserCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import api, { usersApi } from "@/lib/api-client";
import type { AdminUser, AdminStats } from "@/types";

type Tab = "Student" | "Tutor" | "Admin";

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
}

const PAGE_SIZE = 10;

function roleBadgeVariant(role: string): "default" | "secondary" | "success" | "warning" {
  switch (role) {
    case "Admin": return "default";
    case "Tutor": return "warning";
    default:      return "secondary";
  }
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function PaginationControls({
  page,
  pageSize,
  totalCount,
  onPage,
}: {
  page: number;
  pageSize: number;
  totalCount: number;
  onPage: (p: number) => void;
}) {
  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-gray-500">
        Hiển thị {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} trong {totalCount}
      </p>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2 + i, totalPages));
          return (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPage(p)}
            >
              {p}
            </Button>
          );
        })}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function UserTable({
  users,
  loading,
  error,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onToggleStatus,
}: {
  users: User[];
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (p: number) => void;
  onToggleStatus: (id: string, name: string, currentActive: boolean) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Đang tải dữ liệu…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 py-10 text-red-500">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p>Không có người dùng nào.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="text-left py-3 px-4 font-medium text-gray-500">Người dùng</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Điện thoại</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Ngày tham gia</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Trạng thái</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold dark:bg-blue-900 dark:text-blue-300">
                        {initials(user.fullName)}
                      </AvatarFallback>
                      {user.avatarUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover rounded-full" />
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{user.fullName}</p>
                      <Badge variant={roleBadgeVariant(user.role)} className="mt-0.5 text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.phone ?? "—"}</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{formatDate(user.createdAt)}</td>
                <td className="py-3 px-4">
                  {user.isActive ? (
                    <Badge variant="success" className="text-xs">Hoạt động</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">Bị khóa</Badge>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <Button
                    size="sm"
                    variant={user.isActive ? "outline" : "default"}
                    className={user.isActive ? "text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950" : ""}
                    onClick={() => onToggleStatus(user.id, user.fullName, !!user.isActive)}
                  >
                    {user.isActive ? (
                      <><UserX className="w-4 h-4 mr-1" /> Khóa</>
                    ) : (
                      <><UserCheck className="w-4 h-4 mr-1" /> Mở khóa</>
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationControls
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPage={onPageChange}
      />
    </>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("Student");
  const [search, setSearch] = useState("");

  const [studentPage, setStudentPage] = useState(1);
  const [tutorPage, setTutorPage] = useState(1);
  const [adminPage, setAdminPage] = useState(1);

  const [studentUsers, setStudentUsers] = useState<AdminUser[]>([]);
  const [tutorUsers, setTutorUsers] = useState<AdminUser[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  const [studentPagination, setStudentPagination] = useState<PaginationInfo>({ page: 1, pageSize: PAGE_SIZE, totalCount: 0 });
  const [tutorPagination, setTutorPagination] = useState<PaginationInfo>({ page: 1, pageSize: PAGE_SIZE, totalCount: 0 });
  const [adminPagination, setAdminPagination] = useState<PaginationInfo>({ page: 1, pageSize: PAGE_SIZE, totalCount: 0 });

  const [loading, setLoading] = useState({ Student: false, Tutor: false, Admin: false });
  const [errors, setErrors] = useState({ Student: null as string | null, Tutor: null as string | null, Admin: null as string | null });

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async (role: Tab, page: number, searchTerm: string) => {
    setLoading((prev) => ({ ...prev, [role]: true }));
    setErrors((prev) => ({ ...prev, [role]: null }));
    try {
      const res = await usersApi.list({ role, page, pageSize: PAGE_SIZE, search: searchTerm || undefined });
      const data = res.data.data;
      const users = data.users;
      switch (role) {
        case "Student": setStudentUsers(users); setStudentPagination({ page: data.page, pageSize: data.pageSize, totalCount: data.totalCount }); break;
        case "Tutor":   setTutorUsers(users);   setTutorPagination({ page: data.page, pageSize: data.pageSize, totalCount: data.totalCount }); break;
        case "Admin":   setAdminUsers(users);    setAdminPagination({ page: data.page, pageSize: data.pageSize, totalCount: data.totalCount }); break;
      }
    } catch {
      setErrors((prev) => ({ ...prev, [role]: "Không thể tải dữ liệu. Vui lòng thử lại." }));
    } finally {
      setLoading((prev) => ({ ...prev, [role]: false }));
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const pageMap: Record<Tab, number> = { Student: studentPage, Tutor: tutorPage, Admin: adminPage };
      fetchUsers(activeTab, pageMap[activeTab], search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, activeTab, studentPage, tutorPage, adminPage, fetchUsers]);

  // Load stats
  useEffect(() => {
    setStatsLoading(true);
    usersApi.getStats()
      .then((res) => setStats(res.data.data as AdminStats))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  // Load initial tab
  useEffect(() => {
    const pageMap: Record<Tab, number> = { Student: studentPage, Tutor: tutorPage, Admin: adminPage };
    fetchUsers(activeTab, pageMap[activeTab], search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handlePageChange = (tab: Tab, page: number) => {
    switch (tab) {
      case "Student": setStudentPage(page); break;
      case "Tutor":   setTutorPage(page);   break;
      case "Admin":   setAdminPage(page);    break;
    }
  };

  const handleToggleStatus = async (id: string, name: string, currentActive: boolean) => {
    if (!confirm(`Bạn có chắc muốn ${currentActive ? "khóa" : "mở khóa"} tài khoản "${name}"?`)) return;
    setTogglingId(id);
    try {
      await usersApi.toggleStatus(id);
      // Refresh current tab
      const pageMap: Record<Tab, number> = { Student: studentPage, Tutor: tutorPage, Admin: adminPage };
      await fetchUsers(activeTab, pageMap[activeTab], search);
      // Refresh stats
      const statsRes = await usersApi.getStats();
      setStats(statsRes.data.data as AdminStats);
    } catch {
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setTogglingId(null);
    }
  };

  const getUsers = (tab: Tab) => {
    switch (tab) {
      case "Student": return studentUsers;
      case "Tutor":   return tutorUsers;
      case "Admin":   return adminUsers;
    }
  };

  const getPagination = (tab: Tab): PaginationInfo => {
    switch (tab) {
      case "Student": return studentPagination;
      case "Tutor":   return tutorPagination;
      case "Admin":   return adminPagination;
    }
  };

  const getLoading = (tab: Tab) => loading[tab];
  const getError = (tab: Tab) => errors[tab];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý người dùng</h1>
        <p className="text-slate-500 mt-1">Xem và quản lý tài khoản học sinh, gia sư và quản trị viên</p>
      </div>

      {/* Stats cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</p>
                  <p className="text-xs text-slate-500">Tổng người dùng</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.studentCount}</p>
                  <p className="text-xs text-slate-500">Học sinh</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.tutorCount}</p>
                  <p className="text-xs text-slate-500">Gia sư</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.adminCount}</p>
                  <p className="text-xs text-slate-500">Quản trị viên</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.inactiveCount}</p>
                  <p className="text-xs text-slate-500">Bị khóa</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Tabs + Search */}
      <Card>
        <CardContent className="p-0">
          {/* Tab bar + search row */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
              <TabsList>
                <TabsTrigger value="Student" className="gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  Học sinh
                </TabsTrigger>
                <TabsTrigger value="Tutor" className="gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  Gia sư
                </TabsTrigger>
                <TabsTrigger value="Admin" className="gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Quản trị viên
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm theo tên hoặc email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          {/* Tab content — must stay inside <Tabs> */}
          <div className="p-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
              <TabsContent value="Student" className="m-0">
                <UserTable
                  users={getUsers("Student")}
                  loading={getLoading("Student")}
                  error={getError("Student")}
                  page={studentPagination.page}
                  pageSize={studentPagination.pageSize}
                  totalCount={studentPagination.totalCount}
                  onPageChange={(p) => handlePageChange("Student", p)}
                  onToggleStatus={handleToggleStatus}
                />
              </TabsContent>

              <TabsContent value="Tutor" className="m-0">
                <UserTable
                  users={getUsers("Tutor")}
                  loading={getLoading("Tutor")}
                  error={getError("Tutor")}
                  page={tutorPagination.page}
                  pageSize={tutorPagination.pageSize}
                  totalCount={tutorPagination.totalCount}
                  onPageChange={(p) => handlePageChange("Tutor", p)}
                  onToggleStatus={handleToggleStatus}
                />
              </TabsContent>

              <TabsContent value="Admin" className="m-0">
                <UserTable
                  users={getUsers("Admin")}
                  loading={getLoading("Admin")}
                  error={getError("Admin")}
                  page={adminPagination.page}
                  pageSize={adminPagination.pageSize}
                  totalCount={adminPagination.totalCount}
                  onPageChange={(p) => handlePageChange("Admin", p)}
                  onToggleStatus={handleToggleStatus}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
