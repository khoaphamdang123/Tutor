"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, AlertCircle, CreditCard, CheckCircle2, XCircle } from "lucide-react";
import api from "@/lib/api-client";

interface PaymentItem {
  id: string;
  studentId: string;
  tutorId: string;
  amount: number;
  platformFee: number;
  tutorPayout: number;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
}

const STATUS_VARIANT: Record<string, "default" | "success" | "destructive" | "warning" | "outline"> = {
  Pending: "warning",
  Completed: "success",
  Failed: "destructive",
  Refunded: "outline",
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/payments/admin/all");
      setPayments(res.data.data);
    } catch {
      setError("Không thể tải danh sách thanh toán.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const filtered = payments.filter((p) => {
    const matchSearch = !search ||
      p.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
      p.studentId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = [...new Set(payments.map((p) => p.status))];
  const totalRevenue = payments.filter((p) => p.status === "Completed").reduce((sum, p) => sum + p.amount, 0);
  const totalPlatformFee = payments.filter((p) => p.status === "Completed").reduce((sum, p) => sum + p.platformFee, 0);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý Thanh toán</h1>
        <p className="text-slate-500 mt-1">Theo dõi các giao dịch thanh toán trên nền tảng</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Tổng thanh toán</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{payments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString("vi-VN")}₫</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Phí nền tảng</p>
            <p className="text-2xl font-bold text-blue-600">{totalPlatformFee.toLocaleString("vi-VN")}₫</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm theo mã giao dịch…"
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
              <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Không có thanh toán nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Mã giao dịch</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Số tiền</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Phí nền tảng</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Thanh toán cho gia sư</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Phương thức</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Trạng thái</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-gray-500">{p.transactionId ?? p.id.slice(0, 8)}</td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{p.amount.toLocaleString("vi-VN")}₫</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{p.platformFee.toLocaleString("vi-VN")}₫</td>
                      <td className="py-3 px-4 text-green-600 font-medium">{p.tutorPayout.toLocaleString("vi-VN")}₫</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 capitalize">{p.paymentMethod}</td>
                      <td className="py-3 px-4">
                        <Badge variant={STATUS_VARIANT[p.status] ?? "outline"} className="text-xs">{p.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(p.createdAt)}</td>
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
