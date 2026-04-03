"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, RefreshCcw, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api-client";

interface RefundItem {
  id: string;
  enrollmentId: string;
  classTitle: string;
  studentId: string;
  studentName: string;
  amount: number;
  reason?: string;
  status: string;
  adminNotes?: string;
  processedAt?: string;
  createdAt: string;
}

const STATUS_VARIANT: Record<string, "default" | "warning" | "destructive" | "success" | "outline"> = {
  Pending: "warning",
  Approved: "success",
  Rejected: "destructive",
};

export default function AdminRefundsPage() {
  const { toast } = useToast();
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [showApproveModal, setShowApproveModal] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/refunds");
      setRefunds(res.data.data);
    } catch {
      setError("Không thể tải danh sách yêu cầu hoàn tiền.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRefunds(); }, [fetchRefunds]);

  const handleApprove = async () => {
    if (!showApproveModal) return;
    setProcessingId(showApproveModal);
    try {
      await api.patch(`/admin/refunds/${showApproveModal}`, { Status: "Approved", AdminNotes: adminNotes });
      toast({ title: "Thành công", description: "Yêu cầu hoàn tiền đã được chấp nhận." });
      setShowApproveModal(null);
      setAdminNotes("");
      fetchRefunds();
    } catch {
      toast({ title: "Lỗi", description: "Thao tác thất bại.", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!showRejectModal) return;
    setProcessingId(showRejectModal);
    try {
      await api.patch(`/admin/refunds/${showRejectModal}`, { Status: "Rejected", AdminNotes: adminNotes });
      toast({ title: "Thành công", description: "Yêu cầu hoàn tiền đã bị từ chối." });
      setShowRejectModal(null);
      setAdminNotes("");
      fetchRefunds();
    } catch {
      toast({ title: "Lỗi", description: "Thao tác thất bại.", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const pending = refunds.filter((r) => r.status === "Pending");
  const processed = refunds.filter((r) => r.status !== "Pending");

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Yêu cầu Hoàn tiền</h1>
        <p className="text-slate-500 mt-1">Xử lý các yêu cầu hoàn tiền từ học sinh</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-amber-600">{pending.length}</p>
                <p className="text-xs text-slate-500">Chờ xử lý</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">{processed.filter((r) => r.status === "Approved").length}</p>
                <p className="text-xs text-slate-500">Đã duyệt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">{processed.filter((r) => r.status === "Rejected").length}</p>
                <p className="text-xs text-slate-500">Đã từ chối</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Đang tải…
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 py-10 px-4 text-red-500">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      ) : refunds.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <RefreshCcw className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>Không có yêu cầu hoàn tiền nào.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Học sinh</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Lớp học</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Số tiền</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Lý do</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Trạng thái</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Ngày yêu cầu</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{r.studentName}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{r.classTitle}</td>
                      <td className="py-3 px-4 font-medium text-red-600">{r.amount.toLocaleString("vi-VN")}₫</td>
                      <td className="py-3 px-4 text-gray-500 text-xs max-w-xs truncate">{r.reason ?? "—"}</td>
                      <td className="py-3 px-4">
                        <Badge variant={STATUS_VARIANT[r.status] ?? "outline"} className="text-xs">{r.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(r.createdAt)}</td>
                      <td className="py-3 px-4 text-right">
                        {r.status === "Pending" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-950"
                              onClick={() => { setShowApproveModal(r.id); setAdminNotes(""); }}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => { setShowRejectModal(r.id); setAdminNotes(""); }}
                            >
                              <XCircle className="w-4 h-4 mr-1" /> Từ chối
                            </Button>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 text-right">{r.adminNotes ? `Ghi chú: ${r.adminNotes}` : "—"}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chấp nhận hoàn tiền</h3>
              </div>
              <p className="text-sm text-gray-500">Bạn có chắc muốn chấp nhận yêu cầu hoàn tiền này?</p>
              <textarea
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 resize-none"
                rows={3}
                placeholder="Ghi chú (tùy chọn)…"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowApproveModal(null)} disabled={!!processingId}>Hủy</Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                  disabled={!!processingId}
                >
                  {processingId && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Xác nhận duyệt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Từ chối hoàn tiền</h3>
              </div>
              <p className="text-sm text-gray-500">Bạn có chắc muốn từ chối yêu cầu hoàn tiền này?</p>
              <textarea
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 resize-none"
                rows={3}
                placeholder="Lý do từ chối…"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowRejectModal(null)} disabled={!!processingId}>Hủy</Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!!processingId}
                >
                  {processingId && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Xác nhận từ chối
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
