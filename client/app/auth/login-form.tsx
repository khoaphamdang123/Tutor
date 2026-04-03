"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, AlertCircle, GraduationCap } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { authApi } from "@/lib/api-client";

export default function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setTokens = useAuthStore((state) => state.setTokens);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data } = await authApi.login(email, password);
      setUser(data.user);
      setTokens(data.accessToken, data.refreshToken);
      router.push(`/${data.user.role}/dashboard`);
    } catch {
      setError("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
    } finally {
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
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mật khẩu</Label>
          <Link href="/(auth)/forgot-password" className="text-xs text-indigo-600 hover:underline">
            Quên mật khẩu?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
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

      <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500">hoặc</span>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-lg p-4">
        <p className="text-sm text-indigo-900 font-medium mb-2 flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          Dùng thử ngay
        </p>
        <p className="text-xs text-indigo-700">
          Đăng ký tài khoản mới để bắt đầu học thử miễn phí với gia sư.
        </p>
      </div>
    </form>
  );
}
