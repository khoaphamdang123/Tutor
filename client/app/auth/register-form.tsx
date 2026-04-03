"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, AlertCircle, CheckCircle2, GraduationCap, BookOpen } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { authApi } from "@/lib/api-client";

export default function RegisterForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setTokens = useAuthStore((state) => state.setTokens);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<string>("student");


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
  
    const data = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role,
    };

    if (formData.get("password") !== formData.get("confirmPassword")) {
      setError("Mật khẩu xác nhận không khớp.");
      setLoading(false);
      return;
    }

    const roleMap: Record<string, string> = { student: "Student", tutor: "Tutor" };

    try {
      const { data: response } = await authApi.register({ ...data, role: roleMap[role] ?? "Student" });

      if (response.success) {
        const { token, refreshToken, expiresAt, user } = response.data;
        setTokens(token, refreshToken, expiresAt);
        setUser(user);
        router.push(`/${user.role.toLowerCase()}/dashboard`);
      } else {
        setError(response.message ?? "Đăng ký thất bại. Vui lòng thử lại.");
      }
    } catch {
      setError("Email đã được sử dụng hoặc có lỗi xảy ra. Vui lòng thử lại.");
    } finally 
    {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Họ và tên</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Nguyễn Văn A"
          required
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="nguyen@example.com"
          required
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Tối thiểu 8 ký tự"
            required
            minLength={8}
            className="h-11 pr-10"
          />
        
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Nhập lại mật khẩu"
          required
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label>Bạn là</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Chọn vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Học sinh - Tìm gia sư để học
              </div>
            </SelectItem>
            <SelectItem value="tutor">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Gia sư - Dạy học kiếm thu nhập
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-start gap-2 text-xs text-slate-500">
        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
        <span>
          Bằng việc đăng ký, bạn đồng ý với{" "}
          <span className="text-indigo-600">Điều khoản sử dụng</span> và{" "}
          <span className="text-indigo-600">Chính sách bảo mật</span> của GiaSư Plus.
        </span>
      </div>

      <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
        {loading ? "Đang đăng ký..." : "Tạo tài khoản miễn phí"}
      </Button>
    </form>
  );
}
