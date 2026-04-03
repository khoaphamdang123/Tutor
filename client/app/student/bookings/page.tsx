import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, Video, X, Star, MessageSquare } from "lucide-react";
import DashboardLayout from "@/components/shared/dashboard-layout";

const bookings = [
  { id: "1", tutor: "Th.S Lê Minh Tuấn", subject: "Toán học", date: "26/03/2026", time: "14:00 - 15:00", status: "upcoming", price: 150000, meetingLink: "#" },
  { id: "2", tutor: "CN. Phạm Thị Hương", subject: "Tiếng Anh", date: "27/03/2026", time: "10:00 - 11:00", status: "upcoming", price: 120000, meetingLink: "#" },
  { id: "3", tutor: "Th.S Hoàng Văn An", subject: "Vật lý", date: "25/03/2026", time: "16:00 - 17:00", status: "completed", price: 130000, meetingLink: "#" },
  { id: "4", tutor: "Th.S Lê Minh Tuấn", subject: "Toán học", date: "23/03/2026", time: "14:00 - 15:00", status: "completed", price: 150000, meetingLink: "#" },
  { id: "5", tutor: "CN. Phạm Thị Hương", subject: "Tiếng Anh", date: "20/03/2026", time: "09:00 - 10:00", status: "cancelled", price: 120000, meetingLink: "#" },
];

export default function BookingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lịch học của tôi</h1>
          <p className="text-slate-500 mt-1">Quản lý các buổi học đã đặt</p>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Sắp tới</TabsTrigger>
            <TabsTrigger value="completed">Đã hoàn thành</TabsTrigger>
            <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 mt-4">
            {bookings.filter(b => b.status === "upcoming").map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Avatar className="w-12 h-12 hidden sm:flex">
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                        {booking.tutor.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{booking.tutor}</h3>
                        <Badge variant="secondary">{booking.subject}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {booking.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {booking.time}</span>
                        <span className="font-semibold text-indigo-600">{booking.price.toLocaleString()}đ</span>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:ml-auto">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-1" /> Nhắn tin
                      </Button>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        <Video className="w-4 h-4 mr-1" /> Vào phòng học
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-4">
            {bookings.filter(b => b.status === "completed").map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Avatar className="w-12 h-12 hidden sm:flex">
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                        {booking.tutor.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{booking.tutor}</h3>
                        <Badge variant="secondary">{booking.subject}</Badge>
                        <Badge variant="default" className="bg-emerald-100 text-emerald-700">Hoàn thành</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {booking.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {booking.time}</span>
                        <span className="font-semibold">{booking.price.toLocaleString()}đ</span>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:ml-auto">
                      <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                        <Star className="w-4 h-4 mr-1" /> Đánh giá
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4 mt-4">
            {bookings.filter(b => b.status === "cancelled").map((booking) => (
              <Card key={booking.id} className="opacity-70">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Avatar className="w-12 h-12 hidden sm:flex">
                      <AvatarFallback className="bg-slate-100 text-slate-500 font-semibold">
                        {booking.tutor.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-500">{booking.tutor}</h3>
                        <Badge variant="outline" className="text-red-600 border-red-200">Đã hủy</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-500">
                        <span>{booking.date}</span>
                        <span>{booking.subject}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="sm:ml-auto">Đặt lại</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
