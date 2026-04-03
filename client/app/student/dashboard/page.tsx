"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CalendarDays,
  Clock,
  Star,
  Video,
  ArrowRight,
  BookOpen,
  MessageSquare,
  CreditCard,
  Search,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

const upcomingSessions = [
  { id: "1", tutor: "Th.S Lê Minh Tuấn", subject: "Toán học", date: "Hôm nay", time: "14:00 - 15:00", status: "confirmed" },
  { id: "2", tutor: "CN. Phạm Thị Hương", subject: "Tiếng Anh", date: "Ngày mai", time: "10:00 - 11:00", status: "confirmed" },
  { id: "3", tutor: "Th.S Hoàng Văn An", subject: "Vật lý", date: "28/03", time: "16:00 - 17:00", status: "pending" },
];

const recentTutors = [
  { id: "1", name: "Th.S Lê Minh Tuấn", subject: "Toán học", rating: 4.9, sessions: 24 },
  { id: "2", name: "CN. Phạm Thị Hương", subject: "Tiếng Anh", rating: 4.8, sessions: 18 },
  { id: "3", name: "Th.S Hoàng Văn An", subject: "Vật lý", rating: 4.7, sessions: 12 },
];

export default function StudentDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Xin chào, {user?.fullName ?? "bạn"}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Chào mừng bạn quay trở lại. Hãy tiếp tục hành trình học tập.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Buổi học hoàn thành", value: "12", icon: Video, color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300" },
          { label: "Giờ học", value: "24h", icon: Clock, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300" },
          { label: "Gia sư đã học", value: "5", icon: BookOpen, color: "text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-300" },
          { label: "Đánh giá TB", value: "4.8", icon: Star, color: "text-rose-600 bg-rose-100 dark:bg-rose-900 dark:text-rose-300" },
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
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Buổi học sắp tới</CardTitle>
                <CardDescription>Lịch học trong tuần này</CardDescription>
              </div>
              <Link href="/student/bookings">
                <Button variant="ghost" size="sm" className="text-blue-600">
                  Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold dark:bg-blue-900 dark:text-blue-300">
                      {session.tutor.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">{session.tutor}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{session.subject}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{session.date}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{session.time}</p>
                  </div>
                  <Badge variant={session.status === "confirmed" ? "default" : "secondary"}>
                    {session.status === "confirmed" ? "Đã xác nhận" : "Chờ xác nhận"}
                  </Badge>
                  <Link href={`/student/session/${session.id}`}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Video className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Hành động nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/student/search" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Search className="w-4 h-4 mr-2" /> Tìm gia sư mới
                </Button>
              </Link>
              <Link href="/student/messages" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" /> Tin nhắn
                  <Badge variant="destructive" className="ml-auto h-5">3</Badge>
                </Button>
              </Link>
              <Link href="/student/payments" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" /> Nạp tiền
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Tutors */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Gia sư đã học</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentTutors.map((tutor) => (
                <div key={tutor.id} className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold dark:bg-blue-900 dark:text-blue-300">
                      {tutor.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{tutor.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{tutor.sessions} buổi học</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-medium">{tutor.rating}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
