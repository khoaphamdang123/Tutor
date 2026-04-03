"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Search, Loader2, AlertCircle, Star, Users, Plus, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import api, { tutorsApi } from "@/lib/api-client";
import type { AdminTutor, AdminTutorSearchResult, TutorStats, Subject, Class, CreateTutorRequest, UpdateTutorRequest } from "@/types";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, ConfirmDialog } from "@/components/ui/dialog";
import { MultiSelect } from "@/components/ui/multi-select";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 10;

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

// ─── Tutor Form Modal ────────────────────────────────────────────────────────

interface TutorFormData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  bio: string;
  hourlyRate: string;
  education: string;
  yearsOfExperience: string;
  subjectIds: string[];
  classIds: string[];
  isVerified: boolean;
  isAvailable: boolean;
}

const emptyForm: TutorFormData = {
  email: "", password: "", fullName: "", phone: "",
  bio: "", hourlyRate: "", education: "", yearsOfExperience: "",
  subjectIds: [], classIds: [],
  isVerified: false, isAvailable: true,
};

function TutorFormModal({
  open,
  tutor,
  subjects,
  classes,
  loading,
  isLoadingDropdowns,
  onSave,
  onClose,
}: {
  open: boolean;
  tutor?: AdminTutor;
  subjects: Subject[];
  classes: Class[];
  loading: boolean;
  isLoadingDropdowns?: boolean;
  onSave: (data: TutorFormData, isNew: boolean) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<TutorFormData>(emptyForm);

  useEffect(() => {
    if (open) {
      if (tutor) {
        setForm({
          email: tutor.email ?? "",
          password: "",
          fullName: tutor.fullName,
          phone: tutor.phone ?? "",
          bio: tutor.bio ?? "",
          hourlyRate: String(tutor.hourlyRate),
          education: tutor.education ?? "",
          yearsOfExperience: tutor.yearsOfExperience != null ? String(tutor.yearsOfExperience) : "",
          subjectIds: tutor.subjects.map((s) => s.subjectId),
          classIds: tutor.classes.map((c) => c.classId),
          isVerified: tutor.isVerified,
          isAvailable: tutor.isAvailable,
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, tutor]);

  const isNew = !tutor;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form, isNew);
  };

  const inputClass = "w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none";

  return (
    <Dialog open={open} onClose={onClose} className="max-w-lg max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{isNew ? "Thêm gia sư mới" : "Chỉnh sửa gia sư"}</DialogTitle>
            <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <XCircle className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </DialogHeader>

        <DialogContent className="space-y-4">
          {/* Account Info */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Thông tin tài khoản</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs text-gray-600 dark:text-gray-400">Email *</Label>
                <Input
                  type="email"
                  required
                  disabled={!isNew}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={inputClass + " disabled:opacity-60"}
                  placeholder="tutor@example.com"
                />
              </div>
              {isNew && (
                <div className="col-span-2">
                  <Label className="text-xs text-gray-600 dark:text-gray-400">Mật khẩu *</Label>
                  <Input
                    type="text"
                    required
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className={inputClass}
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>
              )}
              <div>
                <Label className="text-xs text-gray-600 dark:text-gray-400">Họ tên *</Label>
                <Input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className={inputClass}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600 dark:text-gray-400">Số điện thoại</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className={inputClass}
                  placeholder="0xxx..."
                />
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hồ sơ gia sư</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-600 dark:text-gray-400">Học phí / giờ (VNĐ) *</Label>
                <Input
                  type="number"
                  required
                  min="0"
                  value={form.hourlyRate}
                  onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))}
                  className={inputClass}
                  placeholder="150000"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600 dark:text-gray-400">Số năm kinh nghiệm</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.yearsOfExperience}
                  onChange={(e) => setForm((f) => ({ ...f, yearsOfExperience: e.target.value }))}
                  className={inputClass}
                  placeholder="2"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-gray-600 dark:text-gray-400">Học vấn</Label>
                <Input
                  value={form.education}
                  onChange={(e) => setForm((f) => ({ ...f, education: e.target.value }))}
                  className={inputClass}
                  placeholder="ĐH Sư phạm TP.HCM"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-gray-600 dark:text-gray-400">Giới thiệu bản thân</Label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  className={inputClass + " resize-none"}
                  placeholder="Kinh nghiệm giảng dạy, phong cách giảng dạy..."
                />
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Môn giảng dạy</p>
            <MultiSelect
              options={subjects.map((s) => ({ value: s.id, label: s.name }))}
              selected={form.subjectIds}
              onChange={(ids) => setForm((f) => ({ ...f, subjectIds: ids }))}
              placeholder="Chọn môn học…"
              disabled={isLoadingDropdowns}
              loading={isLoadingDropdowns}
            />
          </div>

          {/* Classes */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lớp giảng dạy</p>
            <MultiSelect
              options={classes.map((c) => ({ value: c.id, label: `${c.name} (Cấp ${c.level})` }))}
              selected={form.classIds}
              onChange={(ids) => setForm((f) => ({ ...f, classIds: ids }))}
              placeholder="Chọn cấp lớp…"
              disabled={isLoadingDropdowns}
              loading={isLoadingDropdowns}
            />
          </div>

          {/* Toggles */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isVerified}
                  onChange={(e) => setForm((f) => ({ ...f, isVerified: e.target.checked }))}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Đã xác minh</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Có thể đặt lịch</span>
              </label>
            </div>
          </div>
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isNew ? "Tạo gia sư" : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminTutorsPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [tutors, setTutors] = useState<AdminTutor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<TutorStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState<AdminTutor | undefined>();
  const [formSaving, setFormSaving] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<AdminTutor | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTutors = useCallback(async (pageNum: number, searchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await tutorsApi.list({ search: searchTerm || undefined, page: pageNum, pageSize: PAGE_SIZE });
      const data = res.data.data;
      setTutors(data.tutors);
      setTotalCount(data.totalCount);
    } catch {
      setError("Không thể tải danh sách gia sư. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchTutors(page, search), 400);
    return () => clearTimeout(timer);
  }, [search, page, fetchTutors]);

  // Load stats
  useEffect(() => {
    tutorsApi.getStats()
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  // Load subjects & classes for form
  useEffect(() => {
    if (!formOpen) return;
    setFormLoading(true);
    Promise.all([
      api.get<{ success: boolean; data: Subject[] }>("/subjects"),
      api.get<{ success: boolean; data: Class[] }>("/classes"),
    ]).then(([sRes, cRes]) => {
      setSubjects(sRes.data.data);
      setClasses(cRes.data.data);
    }).catch(() => {})
      .finally(() => setFormLoading(false));
  }, [formOpen]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const openAdd = () => {
    setEditingTutor(undefined);
    setFormOpen(true);
  };

  const openEdit = (tutor: AdminTutor) => {
    setEditingTutor(tutor);
    setFormOpen(true);
  };

  const handleSave = async (formData: TutorFormData, isNew: boolean) => {
    setFormSaving(true);
    try {
      if (isNew) {
        const req: CreateTutorRequest = {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone || undefined,
          bio: formData.bio || undefined,
          hourlyRate: Number(formData.hourlyRate),
          education: formData.education || undefined,
          yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : undefined,
          subjectIds: formData.subjectIds,
          classIds: formData.classIds,
        };
        await tutorsApi.create(req);
      } else {
        const req: UpdateTutorRequest = {
          bio: formData.bio || undefined,
          hourlyRate: Number(formData.hourlyRate),
          education: formData.education || undefined,
          yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : undefined,
          subjectIds: formData.subjectIds,
          classIds: formData.classIds,
          isVerified: formData.isVerified,
          isAvailable: formData.isAvailable,
        };
        await tutorsApi.update(editingTutor!.id, req);
      }
      setFormOpen(false);
      fetchTutors(page, search);
      tutorsApi.getStats().then((res) => setStats(res.data.data));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Đã xảy ra lỗi.";
      alert(msg);
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await tutorsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchTutors(page, search);
      tutorsApi.getStats().then((res) => setStats(res.data.data));
    } catch {
      alert("Xóa thất bại. Vui lòng thử lại.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý Gia sư</h1>
          <p className="text-slate-500 mt-1">Tạo, chỉnh sửa và xóa hồ sơ gia sư</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Thêm gia sư
        </Button>
      </div>

      {/* Stats */}
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
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalTutors}</p>
                  <p className="text-xs text-slate-500">Tổng gia sư</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.verifiedTutors}</p>
                  <p className="text-xs text-slate-500">Đã xác minh</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.unverifiedTutors}</p>
                  <p className="text-xs text-slate-500">Chưa xác minh</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.availableTutors}</p>
                  <p className="text-xs text-slate-500">Có thể đặt lịch</p>
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
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.unavailableTutors}</p>
                  <p className="text-xs text-slate-500">Không khả dụng</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm theo tên hoặc email…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 h-9"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Đang tải…
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 py-10 px-4 text-red-500">
              <AlertCircle className="w-5 h-5" /> <span>{error}</span>
            </div>
          ) : tutors.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Không có gia sư nào.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Gia sư</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Môn giảng dạy</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Lớp</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Đánh giá</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Học phí / giờ</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Trạng thái</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tutors.map((tutor) => (
                      <tr
                        key={tutor.id}
                        className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-amber-100 text-amber-700 text-sm font-semibold dark:bg-amber-900 dark:text-amber-300">
                                {initials(tutor.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{tutor.fullName}</p>
                              <p className="text-xs text-gray-500">{tutor.email}</p>
                              <p className="text-xs text-gray-400">{formatDate(tutor.createdAt)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {tutor.subjects.slice(0, 2).map((s) => (
                              <Badge key={s.subjectId} variant="secondary" className="text-xs">{s.subjectName}</Badge>
                            ))}
                            {tutor.subjects.length > 2 && (
                              <Badge variant="secondary" className="text-xs">+{tutor.subjects.length - 2}</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {tutor.classes.slice(0, 2).map((c) => (
                              <Badge key={c.classId} variant="outline" className="text-xs">{c.className}</Badge>
                            ))}
                            {tutor.classes.length > 2 && (
                              <Badge variant="outline" className="text-xs">+{tutor.classes.length - 2}</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-semibold text-sm">{tutor.rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-400 ml-1">({tutor.reviewCount})</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {tutor.hourlyRate.toLocaleString("vi-VN")}₫
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            {tutor.isVerified
                              ? <Badge variant="success" className="text-xs w-fit">Đã xác minh</Badge>
                              : <Badge variant="outline" className="text-xs text-gray-500 w-fit">Chưa xác minh</Badge>}
                            {tutor.isAvailable
                              ? <Badge variant="default" className="text-xs w-fit bg-green-600">Có thể đặt</Badge>
                              : <Badge variant="destructive" className="text-xs w-fit">Không khả dụng</Badge>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(tutor)} title="Sửa">
                              <Pencil className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(tutor)} title="Xóa">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-500">
                    Hiển thị {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} trong {totalCount}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
                      Trước
                    </Button>
                    <span className="flex items-center px-3 text-sm text-gray-500">{page} / {totalPages}</span>
                    <Button size="sm" variant="outline" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <TutorFormModal
        open={formOpen}
        tutor={editingTutor}
        subjects={subjects}
        classes={classes}
        loading={formSaving}
        isLoadingDropdowns={formLoading}
        onSave={handleSave}
        onClose={() => setFormOpen(false)}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa gia sư"
        message={`Bạn có chắc muốn xóa gia sư "${deleteTarget?.fullName}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
