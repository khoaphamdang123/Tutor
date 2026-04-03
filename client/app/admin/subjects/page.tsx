"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, BookOpen, Plus, Pencil, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api-client";

interface SubjectItem {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export default function AdminSubjectsPage() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SubjectItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/subjects");
      setSubjects(res.data.data);
    } catch {
      setError("Không thể tải danh sách môn học.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
    setShowModal(true);
  };

  const openEdit = (s: SubjectItem) => {
    setEditing(s);
    setForm({ name: s.name, description: s.description ?? "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Lỗi", description: "Tên môn không được để trống.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/subjects/${editing.id}`, { Name: form.name, Description: form.description });
        toast({ title: "Thành công", description: "Môn học đã được cập nhật." });
      } else {
        await api.post("/subjects", { Name: form.name, Description: form.description });
        toast({ title: "Thành công", description: "Môn học mới đã được tạo." });
      }
      setShowModal(false);
      fetchSubjects();
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.response?.data?.message ?? "Thao tác thất bại.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (s: SubjectItem) => {
    try {
      if (s.isActive) {
        await api.delete(`/subjects/${s.id}`);
        toast({ title: "Thành công", description: `Môn "${s.name}" đã bị vô hiệu hóa.` });
      } else {
        await api.put(`/subjects/${s.id}/reactivate`, {});
        toast({ title: "Thành công", description: `Môn "${s.name}" đã được kích hoạt.` });
      }
      fetchSubjects();
    } catch {
      toast({ title: "Lỗi", description: "Thao tác thất bại.", variant: "destructive" });
    }
  };

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý Môn học</h1>
          <p className="text-slate-500 mt-1">Thêm và quản lý các môn học trên nền tảng</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Thêm môn
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm môn học…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Không có môn học nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Môn học</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Mô tả</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Trạng thái</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{s.name}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs max-w-xs truncate">{s.description ?? "—"}</td>
                      <td className="py-3 px-4">
                        {s.isActive
                          ? <Badge variant="success" className="text-xs">Hoạt động</Badge>
                          : <Badge variant="destructive" className="text-xs">Không hoạt động</Badge>
                        }
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(s)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={s.isActive ? "text-red-500 hover:text-red-600" : "text-green-500 hover:text-green-600"}
                            onClick={() => handleToggleActive(s)}
                          >
                            {s.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{editing ? "Sửa môn học" : "Thêm môn học mới"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tên môn học</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ví dụ: Toán học"
                />
              </div>
              <div className="space-y-2">
                <Label>Mô tả (tùy chọn)</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả ngắn về môn học…"
                />
              </div>
            </CardContent>
            <div className="px-6 pb-4 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>Hủy</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editing ? "Lưu thay đổi" : "Tạo mới"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
