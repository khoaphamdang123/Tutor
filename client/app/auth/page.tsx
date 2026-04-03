"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const registerSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string(),
  role: z.enum(["Student", "Tutor"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

const resetPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  token: z.string().min(1, "Token không được để trống"),
  newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const { toast } = useToast();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });
  const forgotForm = useForm<ForgotPasswordForm>({ resolver: zodResolver(forgotPasswordSchema) });
  const resetForm = useForm<ResetPasswordForm>({ resolver: zodResolver(resetPasswordSchema) });

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", { Email: data.email, Password: data.password });
      if (res.data.success) {
        const { token, refreshToken, expiresAt, user } = res.data.data;
        setTokens(token, refreshToken, expiresAt);
        setUser(user);
        toast({ title: "Đăng nhập thành công", description: "Chào mừng bạn quay trở lại!" });
        const role = res.data.data.user.role;
        if (role === "Admin") router.push("/admin/dashboard");
        else if (role === "Tutor") router.push("/tutor/dashboard");
        else router.push("/student/dashboard");
      } else {
        toast({ title: "Đăng nhập thất bại", description: res.data.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.response?.data?.message ?? "Đăng nhập thất bại", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/register", {
        Email: data.email,
        Password: data.password,
        FullName: data.fullName,
        Role: data.role,
      });
      if (res.data.success) {
        const { token, refreshToken, expiresAt, user } = res.data.data;
        setTokens(token, refreshToken, expiresAt);
        setUser(user);
        toast({ title: "Đăng ký thành công", description: "Chào mừng bạn đến với GiaSu Plus!" });
        if (data.role === "Tutor") router.push("/tutor/dashboard");
        else router.push("/student/dashboard");
      } else {
        toast({ title: "Đăng ký thất bại", description: res.data.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.response?.data?.message ?? "Đăng ký thất bại", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPassword = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { Email: data.email });
      if (res.data.success) {
        setForgotSent(true);
      } else {
        toast({ title: "Lỗi", description: res.data.message, variant: "destructive" });
      }
    } catch {
      setForgotSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        Email: data.email,
        Token: data.token,
        NewPassword: data.newPassword,
      });
      if (res.data.success) {
        toast({ title: "Đặt lại mật khẩu thành công", description: "Bạn có thể đăng nhập ngay bây giờ." });
        router.push("/auth");
      } else {
        toast({ title: "Lỗi", description: res.data.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.response?.data?.message ?? "Đặt lại mật khẩu thất bại", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">GiaSu Plus</h1>
          <p className="text-gray-500 mt-2">Kết nối tri thức, kiến tạo tương lai</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="login" className="flex-1">Đăng nhập</TabsTrigger>
            <TabsTrigger value="register" className="flex-1">Đăng ký</TabsTrigger>
            <TabsTrigger value="forgot" className="flex-1 text-xs px-1">Quên mật khẩu?</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Đăng nhập</CardTitle>
                <CardDescription>Nhập thông tin tài khoản của bạn</CardDescription>
              </CardHeader>
              <form onSubmit={loginForm.handleSubmit(onLogin)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" placeholder="email@example.com"
                      {...loginForm.register("email")} />
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-red-500">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mật khẩu</Label>
                    <div className="relative">
                      <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                        {...loginForm.register("password")} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-red-500">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Đăng nhập
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Đăng ký tài khoản mới</CardTitle>
                <CardDescription>Tạo tài khoản để bắt đầu học tập hoặc giảng dạy</CardDescription>
              </CardHeader>
              <form onSubmit={registerForm.handleSubmit(onRegister)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Họ và tên</Label>
                    <Input placeholder="Nguyễn Văn A" {...registerForm.register("fullName")} />
                    {registerForm.formState.errors.fullName && (
                      <p className="text-xs text-red-500">{registerForm.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="email@example.com" {...registerForm.register("email")} />
                    {registerForm.formState.errors.email && (
                      <p className="text-xs text-red-500">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Mật khẩu</Label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="Ít nhất 6 ký tự"
                        {...registerForm.register("password")} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-xs text-red-500">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Xác nhận mật khẩu</Label>
                    <Input type="password" placeholder="Nhập lại mật khẩu" {...registerForm.register("confirmPassword")} />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-red-500">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Bạn là</Label>
                    <select {...registerForm.register("role")}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                      <option value="Student">Học sinh</option>
                      <option value="Tutor">Gia sư</option>
                    </select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Đăng ký
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Forgot Password Tab */}
          <TabsContent value="forgot">
            <Card>
              <CardHeader>
                <CardTitle>Quên mật khẩu?</CardTitle>
                <CardDescription>
                  Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu
                </CardDescription>
              </CardHeader>

              {forgotSent ? (
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center text-center py-4 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Đã gửi email đặt lại mật khẩu!</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Nếu tài khoản với email này tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setForgotSent(false)}
                      className="mt-2"
                    >
                      Gửi lại
                    </Button>
                  </div>
                </CardContent>
              ) : (
                <form onSubmit={forgotForm.handleSubmit(onForgotPassword)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email đã đăng ký</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="email@example.com"
                          className="pl-9"
                          {...forgotForm.register("email")}
                        />
                      </div>
                      {forgotForm.formState.errors.email && (
                        <p className="text-xs text-red-500">{forgotForm.formState.errors.email.message}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Gửi liên kết đặt lại
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      Nhớ mật khẩu rồi?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setForgotSent(false);
                          forgotForm.reset();
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Đăng nhập ngay
                      </button>
                    </p>
                  </CardFooter>
                </form>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
