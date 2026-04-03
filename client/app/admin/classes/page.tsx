"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Layers, Plus, Pencil, Trash2, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api-client";

interface ClassItem {
  id: string;
  name: string;
  level: number;
  description?: string;
  isActive: boolean;
}

export default function AdminClassesPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: "", level: 1, description: "" });

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/classes");
      setClasses(res.data.data);
    } catch {
      setError("Không thể tải danh sách lớp học.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", level: 1, description: "" });
    setShowModal(true);
  };

  const openEdit = (cls: ClassItem) => {
    setEditing(cls);
    setForm({ name: cls.name, level: cls.level, description: cls.description ?? "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Lỗi", description: "Tên lớp không được để trống.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/classes/${editing.id}`, { Name: form.name, Level: form.level, Description: form.description });
        toast({ title: "Thành công", description: "Lớp học đã được cập nhật." });
      } else {
        await api.post("/classes", { Name: form.name, Level: form.level, Description: form.description });
        toast({ title: "Thành công", description: "Lớp học mới đã được tạo." });
      }
      setShowModal(false);
      fetchClasses();
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.response?.data?.message ?? "Thao tác thất bại.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cls: ClassItem) => {
    if (!confirm(`Bạn có chắc muốn vô hiệu hóa lớp "${cls.name}"?`)) return;
    try {
      await api.delete(`/classes/${cls.id}`);
      toast({ title: "Thành công", description: "Lớp học đã bị vô hiệu hóa." });
      fetchClasses();
    } catch {
      toast({ title: "Lỗi", description: "Không thể xóa lớp học.", variant: "destructive" });
    }
  };

  const filtered = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý Lớp học</h1>
          <p className="text-slate-500 mt-1">Thêm, sửa, xóa các cấp lớp trên nền tảng</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Thêm lớp
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm lớp…"
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
              <Layers className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Không có lớp học nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Lớp</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Cấp</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Mô tả</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Trạng thái</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cls) => (
                    <tr key={cls.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{cls.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">Cấp {cls.level}</Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{cls.description ?? "—"}</td>
                      <td className="py-3 px-4">
                        {cls.isActive
                          ? <Badge variant="success" className="text-xs">Hoạt động</Badge>
                          : <Badge variant="destructive" className="text-xs">Không hoạt động</Badge>
                        }
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(cls)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {cls.isActive && (
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600"
                              onClick={() => handleDelete(cls)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{editing ? "Sửa lớp học" : "Thêm lớp học mới"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tên lớp</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ví dụ: Lớp 10"
                />
              </div>
              <div className="space-y-2">
                <Label>Cấp (số)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Mô tả (tùy chọn)</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả ngắn…"
                />
              </div>
            </CardContent>
            <div className="px-6 pb-4 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>
                Hủy
              </Button>
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
