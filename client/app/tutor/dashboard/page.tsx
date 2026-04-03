"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, CreditCard, Star, Users, Video, CalendarDays, ArrowRight, DollarSign } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

const earningsData = [
  { month: "T1", amount: 4500000 },
  { month: "T2", amount: 3800000 },
  { month: "T3", amount: 5200000 },
];

const recentStudents = [
  { id: "1", name: "Nguyễn Văn A", subject: "Toán học", sessions: 8, lastSession: "Hôm qua" },
  { id: "2", name: "Trần Thị B", subject: "Tiếng Anh", sessions: 5, lastSession: "2 ngày trước" },
  { id: "3", name: "Lê Văn C", subject: "Vật lý", sessions: 3, lastSession: "1 tuần trước" },
];

export default function TutorDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Xin chào, {user?.fullName ?? "Thầy/Cô"}!</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Đây là tổng quan hoạt động dạy học của bạn.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Thu nhập tháng này", value: "5.2M", icon: DollarSign, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300" },
          { label: "Buổi dạy hoàn thành", value: "34", icon: Video, color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300" },
          { label: "Học sinh đang dạy", value: "8", icon: Users, color: "text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-300" },
          { label: "Đánh giá trung bình", value: "4.9", icon: Star, color: "text-rose-600 bg-rose-100 dark:bg-rose-900 dark:text-rose-300" },
        ].map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thu nhập 3 tháng gần nhất</CardTitle>
              <CardDescription>Tổng thu nhập từ các buổi dạy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-32">
                {earningsData.map((item) => {
                  const maxAmount = Math.max(...earningsData.map(e => e.amount));
                  const heightPercent = (item.amount / maxAmount) * 100;
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">{item.amount / 1000000}M</span>
                      <div className="w-full bg-blue-100 dark:bg-blue-900 rounded-t-lg transition-all hover:bg-blue-200 dark:hover:bg-blue-800" style={{ height: `${heightPercent}%` }} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Yêu cầu dạy học mới</CardTitle>
                <CardDescription>Các yêu cầu chờ bạn xác nhận</CardDescription>
              </div>
              <Badge variant="destructive">3 yêu cầu mới</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { student: "Trần Thị B", subject: "Toán học", time: "28/03 - 14:00", message: "Em muốn học toán lớp 12 để luyện thi THPTQG đó." },
                { student: "Nguyễn Văn C", subject: "Tiếng Anh", time: "29/03 - 10:00", message: "Anh ơi em cần luyện IELTS, trình độ hiện tại 5.0." },
                { student: "Lê Thị D", subject: "Vật lý", time: "30/03 - 16:00", message: "Con gái em học lớp 11, cần gia sư dạy kèm thường xuyên." },
              ].map((req, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold dark:bg-blue-900 dark:text-blue-300">
                      {req.student.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">{req.student}</p>
                      <Badge variant="secondary" className="text-xs">{req.subject}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5"><Clock className="w-3 h-3 inline mr-1" />{req.time}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">{req.message}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Nhận</Button>
                    <Button size="sm" variant="outline">Từ chối</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Lịch dạy hôm nay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { time: "09:00 - 10:00", student: "Nguyễn Văn A", subject: "Toán học", status: "completed" },
                { time: "14:00 - 15:00", student: "Trần Thị B", subject: "Toán học", status: "upcoming" },
                { time: "16:00 - 17:00", student: "Lê Văn C", subject: "Vật lý", status: "upcoming" },
              ].map((session, i) => (
                <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${session.status === "upcoming" ? "bg-blue-50 border border-blue-100 dark:bg-blue-950 dark:border-blue-900" : "bg-gray-50 dark:bg-gray-800"}`}>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{session.time.split(" - ")[0]}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{session.student}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{session.subject}</p>
                  </div>
                  {session.status === "upcoming" && (
                    <Button size="sm" variant="outline" className="text-xs h-7 border-blue-200 text-blue-600 dark:border-blue-700 dark:text-blue-400">
                      <Video className="w-3 h-3 mr-1" /> Vào dạy
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Học sinh của bạn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentStudents.map((student) => (
                <div key={student.id} className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold dark:bg-blue-900 dark:text-blue-300">
                      {student.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{student.sessions} buổi - {student.lastSession}</p>
                  </div>
                </div>
              ))}
              <Link href="/tutor/students">
                <Button variant="ghost" size="sm" className="w-full text-blue-600 dark:text-blue-400">
                  Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
