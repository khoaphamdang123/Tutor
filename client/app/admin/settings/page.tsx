"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/lib/auth-store";
import { Loader2, Save } from "lucide-react";
import api from "@/lib/api-client";

const profileSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Mật khẩu hiện tại không được để trống"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
    },
  });

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const handleSaveProfile = async (data: ProfileForm) => {
    setSavingProfile(true);
    try {
      const res = await api.put("/auth/profile", {
        FullName: data.fullName,
        Phone: data.phone,
      });
      if (res.data.success) {
        toast({ title: "Thành công", description: "Hồ sơ đã được cập nhật." });
      } else {
        toast({ title: "Lỗi", description: res.data.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.response?.data?.message ?? "Cập nhật thất bại.", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (data: PasswordForm) => {
    setSavingPassword(true);
    try {
      const res = await api.post("/auth/change-password", {
        CurrentPassword: data.currentPassword,
        NewPassword: data.newPassword,
      });
      if (res.data.success) {
        toast({ title: "Thành công", description: "Mật khẩu đã được thay đổi." });
        passwordForm.reset();
      } else {
        toast({ title: "Lỗi", description: res.data.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.response?.data?.message ?? "Đổi mật khẩu thất bại.", variant: "destructive" });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cài đặt</h1>
        <p className="text-slate-500 mt-1">Quản lý hồ sơ và bảo mật tài khoản quản trị</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin hồ sơ</CardTitle>
          <CardDescription>Cập nhật tên và thông tin liên hệ của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(handleSaveProfile)} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled className="opacity-60" />
              <p className="text-xs text-gray-400">Email không thể thay đổi</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input id="fullName" {...profileForm.register("fullName")} />
              {profileForm.formState.errors.fullName && (
                <p className="text-xs text-red-500">{profileForm.formState.errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" {...profileForm.register("phone")} placeholder="0xxxxxxxxx" />
            </div>
            <Button type="submit" disabled={savingProfile} className="gap-2">
              {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" /> Lưu thay đổi
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>Thay đổi mật khẩu để bảo vệ tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword")} />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input id="confirmPassword" type="password" {...passwordForm.register("confirmPassword")} />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" disabled={savingPassword} className="gap-2">
              {savingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" /> Đổi mật khẩu
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
