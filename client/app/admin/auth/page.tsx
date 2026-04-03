"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Shield, Mail, CheckCircle2 } from "lucide-react";
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
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

const registerSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function AdminAuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const { toast } = useToast();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });
  const forgotForm = useForm<ForgotPasswordForm>({ resolver: zodResolver(forgotPasswordSchema) });

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", { Email: data.email, Password: data.password });
      if (res.data.success) {
        if (res.data.data.user.role !== "Admin") {
          toast({ title: "Truy cập bị từ chối", description: "Bạn không có quyền truy cập khu vực quản trị.", variant: "destructive" });
          return;
        }
        setTokens(res.data.data.token, res.data.data.refreshToken, res.data.data.expiresAt);
        setUser(res.data.data.user);
        toast({ title: "Đăng nhập thành công", description: "Chào mừng Quản trị viên!" });
        router.push("/admin/dashboard");
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
        Role: "Admin",
      });
      if (res.data.success) {
        setTokens(res.data.data.token, res.data.data.refreshToken, res.data.data.expiresAt);
        setUser(res.data.data.user);
        toast({ title: "Đăng ký thành công", description: "Tài khoản quản trị viên đã được tạo!" });
        router.push("/admin/dashboard");
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

  return (
    <div className="relative w-full max-w-md">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="w-full mb-6 bg-slate-800 border border-slate-700">
          <TabsTrigger
            value="login"
            className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-300"
          >
            Đăng nhập
          </TabsTrigger>
          <TabsTrigger
            value="register"
            className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-300"
          >
            Đăng ký
          </TabsTrigger>
          <TabsTrigger
            value="forgot"
            className="flex-1 text-xs px-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-300"
          >
            Quên mật khẩu?
          </TabsTrigger>
        </TabsList>

        {/* Login Tab */}
        <TabsContent value="login">
          <Card className="border-slate-700 bg-slate-800/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Đăng nhập Quản trị
              </CardTitle>
              <CardDescription className="text-slate-400">
                Nhập thông tin tài khoản quản trị viên
              </CardDescription>
            </CardHeader>
            <form onSubmit={loginForm.handleSubmit(onLogin)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-slate-300">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="admin@example.com"
                    className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-red-400">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-slate-300">Mật khẩu</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 pr-10 focus:border-blue-500 focus:ring-blue-500"
                      {...loginForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-red-400">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Đăng nhập
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Register Tab */}
        <TabsContent value="register">
          <Card className="border-slate-700 bg-slate-800/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Đăng ký Quản trị viên
              </CardTitle>
              <CardDescription className="text-slate-400">
                Tạo tài khoản quản trị viên mới cho hệ thống
              </CardDescription>
            </CardHeader>
            <form onSubmit={registerForm.handleSubmit(onRegister)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-fullName" className="text-slate-300">Họ và tên</Label>
                  <Input
                    id="reg-fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    {...registerForm.register("fullName")}
                  />
                  {registerForm.formState.errors.fullName && (
                    <p className="text-xs text-red-400">{registerForm.formState.errors.fullName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-slate-300">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="admin@example.com"
                    className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    {...registerForm.register("email")}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-xs text-red-400">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-slate-300">Mật khẩu</Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ít nhất 6 ký tự"
                      className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 pr-10 focus:border-blue-500 focus:ring-blue-500"
                      {...registerForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-xs text-red-400">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirmPassword" className="text-slate-300">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <Input
                      id="reg-confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu"
                      className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 pr-10 focus:border-blue-500 focus:ring-blue-500"
                      {...registerForm.register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-red-400">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Tạo tài khoản
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Forgot Password Tab */}
        <TabsContent value="forgot">
          <Card className="border-slate-700 bg-slate-800/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Quên mật khẩu?
              </CardTitle>
              <CardDescription className="text-slate-400">
                Nhập email quản trị viên đã đăng ký để nhận liên kết đặt lại mật khẩu
              </CardDescription>
            </CardHeader>

            {forgotSent ? (
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center text-center py-4 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Đã gửi email đặt lại mật khẩu!</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Nếu tài khoản với email này tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setForgotSent(false)}
                    className="mt-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    Gửi lại
                  </Button>
                </div>
              </CardContent>
            ) : (
              <form onSubmit={forgotForm.handleSubmit(onForgotPassword)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email" className="text-slate-300">Email quản trị viên</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="admin@example.com"
                        className="pl-9 bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                        {...forgotForm.register("email")}
                      />
                    </div>
                    {forgotForm.formState.errors.email && (
                      <p className="text-xs text-red-400">{forgotForm.formState.errors.email.message}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Gửi liên kết đặt lại
                  </Button>
                  <p className="text-xs text-slate-500 text-center">
                    Nhớ mật khẩu rồi?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setForgotSent(false);
                        forgotForm.reset();
                      }}
                      className="text-blue-400 hover:text-blue-300 hover:underline"
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

      {/* Back to main site */}
      <div className="text-center mt-6">
        <a
          href="/auth"
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← Quay lại trang đăng nhập thông thường
        </a>
      </div>
    </div>
  );
}
