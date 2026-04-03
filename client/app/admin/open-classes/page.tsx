"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Loader2,
  AlertCircle,
  Megaphone,
  Eye,
  EyeOff,
  CheckCircle,
  Plus,
  Pencil,
  X,
  ChevronDown,
  Circle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api-client";

interface TutorOption {
  id: string;
  fullName: string;
  email: string;
  subjects: { id: string; name: string }[];
}

interface SubjectOption {
  id: string;
  name: string;
}

interface ClassOption {
  id: string;
  name: string;
  level: number;
}

interface OpenClassItem {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  tutorId: string;
  tutorName: string;
  subjectId: string;
  subjectName: string;
  classId?: string;
  className?: string;
  maxStudents: number;
  currentStudents: number;
  pricePerStudent: number;
  totalRevenue: number;
  status: string;
  isPublished: boolean;
  startDate: string;
  endDate: string;
  totalSessions: number;
  scheduleDesc?: string;
}

interface CreateForm {
  tutorId: string;
  subjectId: string;
  classId: string;
  title: string;
  description: string;
  coverImageUrl: string;
  maxStudents: number;
  pricePerStudent: number;
  startDate: string;
  endDate: string;
  scheduleDesc: string;
  totalSessions: number;
}

const emptyForm: CreateForm = {
  tutorId: "",
  subjectId: "",
  classId: "",
  title: "",
  description: "",
  coverImageUrl: "",
  maxStudents: 20,
  pricePerStudent: 0,
  startDate: "",
  endDate: "",
  scheduleDesc: "",
  totalSessions: 10,
};

export default function AdminOpenClassesPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<OpenClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Dropdowns
  const [tutors, setTutors] = useState<TutorOption[]>([]);
  const [currentTutorSubjects, setCurrentTutorSubjects] = useState<SubjectOption[]>([]);
  const [gradeClasses, setGradeClasses] = useState<ClassOption[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<OpenClassItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateForm>(emptyForm);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/open-classes/admin/me");
      setClasses(res.data.data ?? []);
    } catch {
      setError("Không thể tải danh sách lớp mở.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDropdowns = useCallback(async (preselectTutorId?: string) => {
    setLoadingDropdowns(true);
    try {
      const [tutorsRes, classesRes] = await Promise.all([
        api.get("/tutors/admin", { params: { pageSize: 100 } }),
        api.get("/classes"),
      ]);
      const mapped = (tutorsRes.data.data?.tutors ?? []).map((t: any) => ({
        id: t.id,
        fullName: t.fullName,
        email: t.email ?? "",
        subjects: (t.subjects ?? []).map((s: any) => ({
          id: s.subjectId,
          name: s.subjectName,
        })),
      }));
      setTutors(mapped);
      setGradeClasses(classesRes.data.data ?? []);

      // Pre-select subjects for the given tutor (used by openEdit)
      if (preselectTutorId) {
        const found = mapped.find(t => t.id === preselectTutorId);
        setCurrentTutorSubjects(found?.subjects ?? []);
      }
    } catch {
      toast({ title: "Lỗi", description: "Không thể tải dữ liệu dropdown.", variant: "destructive" });
    } finally {
      setLoadingDropdowns(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const openCreate = async () => {
    setEditing(null);
    setForm(emptyForm);
    setCurrentTutorSubjects([]);
    await fetchDropdowns();
    setShowModal(true);
  };

  const openEdit = async (item: OpenClassItem) => {
    setEditing(item);
    await fetchDropdowns(item.tutorId);
    setForm({
      tutorId: item.tutorId,
      subjectId: item.subjectId,
      classId: item.classId ?? "",
      title: item.title,
      description: item.description ?? "",
      coverImageUrl: item.coverImageUrl ?? "",
      maxStudents: item.maxStudents,
      pricePerStudent: item.pricePerStudent,
      startDate: item.startDate,
      endDate: item.endDate,
      scheduleDesc: item.scheduleDesc ?? "",
      totalSessions: item.totalSessions,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Lỗi", description: "Tiêu đề lớp không được để trống.", variant: "destructive" });
      return;
    }
    if (!form.tutorId) {
      toast({ title: "Lỗi", description: "Vui lòng chọn gia sư.", variant: "destructive" });
      return;
    }
    if (!form.subjectId) {
      toast({ title: "Lỗi", description: "Vui lòng chọn môn học.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = {
      TutorId: form.tutorId,
      SubjectId: form.subjectId,
      ClassId: form.classId || null,
      Title: form.title.trim(),
      Description: form.description || null,
      CoverImageUrl: form.coverImageUrl || null,
      MaxStudents: form.maxStudents,
      PricePerStudent: form.pricePerStudent,
      StartDate: form.startDate,
      EndDate: form.endDate,
      ScheduleDesc: form.scheduleDesc || null,
      TotalSessions: form.totalSessions,
    };

    try {
      if (editing) {
        await api.put(`/open-classes/${editing.id}`, payload);
        toast({ title: "Thành công", description: "Lớp mở đã được cập nhật." });
      } else {
        await api.post("/open-classes", payload);
        toast({ title: "Thành công", description: "Lớp mở mới đã được tạo." });
      }
      setShowModal(false);
      fetchClasses();
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.response?.data?.message ?? "Thao tác thất bại.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async (item: OpenClassItem) => {
    try {
      if (item.isPublished) {
        await api.patch(`/open-classes/${item.id}/unpublish`);
        toast({ title: "Đã gỡ đăng", description: `Lớp "${item.title}" đã được gỡ đăng.` });
      } else {
        await api.patch(`/open-classes/${item.id}/publish`);
        toast({ title: "Đã đăng tải", description: `Lớp "${item.title}" đã được xuất bản.` });
      }
      fetchClasses();
    } catch {
      toast({ title: "Lỗi", description: "Thao tác thất bại.", variant: "destructive" });
    }
  };

  const handleStatusChange = async (item: OpenClassItem, newStatus: string) => {
    if (item.status === newStatus) return;
    try {
      // Map status to the correct backend endpoint
      const statusEndpoint: Record<string, string> = {
        Active: "publish",
        Draft: "unpublish",
        Completed: "complete",
        Cancelled: "cancel",
      };
      const endpoint = statusEndpoint[newStatus];
      if (!endpoint) return;
      await api.patch(`/open-classes/${item.id}/${endpoint}`);
      toast({ title: "Đã cập nhật", description: `Lớp "${item.title}" chuyển sang "${newStatus}".` });
      fetchClasses();
    } catch {
      toast({ title: "Lỗi", description: "Thao tác thất bại.", variant: "destructive" });
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "Active": return "success";
      case "Draft": return "secondary";
      case "Cancelled": return "destructive";
      case "Completed": return "default";
      default: return "outline";
    }
  };

  const filtered = classes.filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.tutorName.toLowerCase().includes(search.toLowerCase()) ||
      c.subjectName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const uniqueStatuses = [...new Set(classes.map((c) => c.status))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý Lớp mở</h1>
          <p className="text-slate-500 mt-1">Tạo, sửa và quản lý các lớp mở trên nền tảng</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Thêm lớp mở
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm lớp mở…"
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
              {uniqueStatuses.map((s) => (
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
              <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Không có lớp mở nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Lớp mở</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Gia sư</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Môn / Lớp</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Học sinh</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Doanh thu</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Trạng thái</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{c.title}</p>
                          <p className="text-xs text-gray-500">{c.totalSessions} buổi · {new Date(c.startDate).toLocaleDateString("vi-VN")}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{c.tutorName}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <Badge variant="secondary" className="text-xs w-fit">{c.subjectName}</Badge>
                          {c.className && <Badge variant="outline" className="text-xs w-fit">{c.className}</Badge>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{c.currentStudents}</span>
                          <span className="text-gray-400">/ {c.maxStudents}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {c.totalRevenue.toLocaleString("vi-VN")}₫
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <Badge variant={statusVariant(c.status)} className="text-xs w-fit">{c.status}</Badge>
                          {c.isPublished
                            ? <Badge variant="success" className="text-xs w-fit flex gap-1 items-center"><CheckCircle className="w-3 h-3" /> Đã đăng</Badge>
                            : <Badge variant="outline" className="text-xs w-fit">Chưa đăng</Badge>
                          }
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Status dropdown */}
                          <Select
                            value={c.status}
                            onValueChange={(newStatus) => handleStatusChange(c, newStatus)}
                          >
                            <SelectTrigger className="h-8 w-[110px] text-xs [&>span]:hidden [&>[data-placeholder]]:hidden [&>[data-placeholder]]:!text-gray-400">
                              <Badge variant={statusVariant(c.status)} className="text-xs">
                                {c.status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Draft">
                                <span className="flex items-center gap-1.5">
                                  <Circle className="w-3 h-3 text-gray-400" /> Nháp
                                </span>
                              </SelectItem>
                              <SelectItem value="Active">
                                <span className="flex items-center gap-1.5">
                                  <CheckCircle className="w-3 h-3 text-green-500" /> Hoạt động
                                </span>
                              </SelectItem>
                              <SelectItem value="Completed">
                                <span className="flex items-center gap-1.5">
                                  <CheckCircle className="w-3 h-3 text-blue-500" /> Hoàn thành
                                </span>
                              </SelectItem>
                              <SelectItem value="Cancelled">
                                <span className="flex items-center gap-1.5">
                                  <X className="w-3 h-3 text-red-500" /> Đã hủy
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Edit */}
                          <Button size="sm" variant="ghost" onClick={() => openEdit(c)} title="Sửa">
                            <Pencil className="w-4 h-4" />
                          </Button>

                          {/* Publish toggle */}
                          <Button size="sm" variant="ghost" onClick={() => handlePublishToggle(c)} title={c.isPublished ? "Gỡ đăng" : "Đăng tải"}>
                            {c.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa lớp mở" : "Tạo lớp mở mới"}</DialogTitle>
            <DialogDescription>
              {editing ? "Cập nhật thông tin lớp mở." : "Điền thông tin để tạo một lớp mở mới."}
            </DialogDescription>
          </DialogHeader>

          {loadingDropdowns ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Tutor */}
              <div className="space-y-2">
                <Label htmlFor="tutor">Gia sư *</Label>
                <Select value={form.tutorId} onValueChange={(v) => {
                  const selected = tutors.find(t => t.id === v);
                  setForm(prev => ({
                    ...prev,
                    tutorId: v,
                    subjectId: "", // reset subject when tutor changes
                  }));
                  setCurrentTutorSubjects(selected?.subjects ?? []);
                }}>
                  <SelectTrigger id="tutor">
                    <SelectValue placeholder="Chọn gia sư…" />
                  </SelectTrigger>
                  <SelectContent>
                    {tutors.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.fullName} — {t.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Môn học *</Label>
                {!form.tutorId ? (
                  <Select disabled>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Vui lòng chọn gia sư trước…" />
                    </SelectTrigger>
                  </Select>
                ) : currentTutorSubjects.length === 0 ? (
                  <Select disabled>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Gia sư này chưa có môn học nào." />
                    </SelectTrigger>
                  </Select>
                ) : (
                  <Select value={form.subjectId} onValueChange={(v) => setForm({ ...form, subjectId: v })}>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Chọn môn học…" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentTutorSubjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Grade Class (optional) */}
              <div className="space-y-2">
                <Label htmlFor="gradeClass">Cấp lớp (tùy chọn)</Label>
                <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v })}>
                  <SelectTrigger id="gradeClass">
                    <SelectValue placeholder="Chọn cấp lớp (không bắt buộc)…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Không chọn —</SelectItem>
                    {gradeClasses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} (Cấp {c.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
                <Label className="text-xs uppercase tracking-wider text-gray-400 font-medium">Thông tin lớp</Label>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề lớp *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ví dụ: Toán lớp 10 — Học kỳ II"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả chi tiết về lớp học…"
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label htmlFor="cover">Link ảnh bìa</Label>
                <Input
                  id="cover"
                  value={form.coverImageUrl}
                  onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
                  placeholder="https://…"
                />
              </div>

              {/* Max Students & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxStudents">Số học sinh tối đa</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    min={1}
                    value={form.maxStudents}
                    onChange={(e) => setForm({ ...form, maxStudents: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Học phí / học sinh (₫)</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    value={form.pricePerStudent}
                    onChange={(e) => setForm({ ...form, pricePerStudent: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Ngày bắt đầu</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Ngày kết thúc</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Total Sessions & Schedule */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalSessions">Tổng số buổi</Label>
                  <Input
                    id="totalSessions"
                    type="number"
                    min={1}
                    value={form.totalSessions}
                    onChange={(e) => setForm({ ...form, totalSessions: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduleDesc">Mô tả lịch học</Label>
                  <Input
                    id="scheduleDesc"
                    value={form.scheduleDesc}
                    onChange={(e) => setForm({ ...form, scheduleDesc: e.target.value })}
                    placeholder="Thứ 3, 5 — 18h–20h"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving || loadingDropdowns}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving || loadingDropdowns}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? "Lưu thay đổi" : "Tạo lớp mở"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
