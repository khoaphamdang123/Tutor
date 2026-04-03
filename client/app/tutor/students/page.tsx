import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, CalendarDays, Star, ArrowRight, Search, Video } from "lucide-react";
import DashboardLayout from "@/components/shared/dashboard-layout";

const students = [
  { id: "1", name: "Nguyễn Văn A", avatar: "A", subject: "Toán học", sessions: 8, rating: 5, lastSession: "Hôm nay", status: "active" },
  { id: "2", name: "Trần Thị B", avatar: "B", subject: "Tiếng Anh", sessions: 5, rating: 5, lastSession: "2 ngày trước", status: "active" },
  { id: "3", name: "Lê Văn C", avatar: "C", subject: "Vật lý", sessions: 3, rating: 4, lastSession: "1 tuần trước", status: "active" },
  { id: "4", name: "Phạm Thị D", avatar: "D", subject: "Hóa học", sessions: 2, rating: 0, lastSession: "2 tuần trước", status: "inactive" },
  { id: "5", name: "Hoàng Văn E", avatar: "E", subject: "Toán học", sessions: 12, rating: 5, lastSession: "Hôm qua", status: "active" },
];

export default function StudentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Học sinh của tôi</h1>
            <p className="text-slate-500 mt-1">Quản lý danh sách học sinh đang dạy</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Tìm học sinh..." className="pl-9 h-10 w-64 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-slate-900">8</p><p className="text-sm text-slate-500">Học sinh đang học</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-slate-900">6</p><p className="text-sm text-slate-500">Hoàn thành khóa học</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-slate-900">4.9</p><p className="text-sm text-slate-500">Đánh giá TB</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {students.map((student) => (
                <div key={student.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">{student.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{student.name}</p>
                      <Badge variant={student.status === "active" ? "default" : "secondary"} className="text-xs">
                        {student.status === "active" ? "Đang học" : "Không hoạt động"}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{student.subject} - {student.sessions} buổi - Lần cuối: {student.lastSession}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {student.rating > 0 ? (
                      <>
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-medium">{student.rating}</span>
                      </>
                    ) : (
                      <span className="text-slate-400 text-xs">Chưa đánh giá</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"><CalendarDays className="w-4 h-4 mr-1" />Lịch</Button>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700"><Video className="w-4 h-4 mr-1" />Dạy</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
