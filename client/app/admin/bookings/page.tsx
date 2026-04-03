"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, AlertCircle, CalendarCheck, Clock, GraduationCap } from "lucide-react";
import api from "@/lib/api-client";

interface BookingItem {
  id: string;
  studentName: string;
  tutorName: string;
  subjectName: string;
  className?: string;
  startTime: string;
  endTime: string;
  status: string;
  price: number;
  notes?: string;
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "success" | "destructive" | "warning" | "outline"> = {
  Pending: "warning",
  Confirmed: "success",
  Completed: "default",
  Cancelled: "destructive",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/bookings/admin/all");
      setBookings(res.data.data);
    } catch {
      setError("Không thể tải danh sách đặt lịch.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const filtered = bookings.filter((b) => {
    const matchSearch = !search ||
      b.studentName.toLowerCase().includes(search.toLowerCase()) ||
      b.tutorName.toLowerCase().includes(search.toLowerCase()) ||
      b.subjectName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = [...new Set(bookings.map((b) => b.status))];

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý Đặt lịch</h1>
        <p className="text-slate-500 mt-1">Xem tất cả lịch hẹn giữa học sinh và gia sư</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm học sinh, gia sư, môn…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">Tất cả trạng thái</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Đang tải…
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 py-10 px-4 text-red-500">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Không có lịch hẹn nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Học sinh</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Gia sư</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Môn</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Thời gian</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Giá</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{b.studentName}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{b.tutorName}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <Badge variant="secondary" className="text-xs w-fit">{b.subjectName}</Badge>
                          {b.className && <Badge variant="outline" className="text-xs w-fit">{b.className}</Badge>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="text-xs">{formatDateTime(b.startTime)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {b.price.toLocaleString("vi-VN")}₫
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={STATUS_VARIANT[b.status] ?? "outline"} className="text-xs">{b.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
