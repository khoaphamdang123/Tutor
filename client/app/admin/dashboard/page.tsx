import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  GraduationCap,
  CreditCard,
  TrendingUp,
  Clock,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";


export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống</h1>
          <p className="text-slate-500 mt-1">Cập nhật tình hình hoạt động của nền tảng GiaSư Plus</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Tổng người dùng", value: "12,458", change: "+8%", icon: Users, color: "text-indigo-600 bg-indigo-100" },
            { label: "Gia sư đã xác minh", value: "487", change: "+12%", icon: GraduationCap, color: "text-emerald-600 bg-emerald-100" },
            { label: "Đơn hàng tháng này", value: "1,234", change: "+15%", icon: CreditCard, color: "text-amber-600 bg-amber-100" },
            { label: "Doanh thu tháng này", value: "890M", change: "+22%", icon: TrendingUp, color: "text-rose-600 bg-rose-100" },
          ].map((stat) => (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                  <Badge variant="default" className="bg-emerald-100 text-emerald-700 text-xs">{stat.change}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Xác minh gia sư mới</CardTitle>
                  <CardDescription>Các yêu cầu xác minh chờ duyệt</CardDescription>
                </div>
                <Link href="/(admin)/verification">
                  <Button variant="ghost" size="sm" className="text-indigo-600">Xem tất cả <ArrowRight className="w-4 h-4 ml-1" /></Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Th.S Nguyễn Văn X", subjects: ["Toán", "Lý"], rating: 4.8, submitted: "2 giờ trước", docs: true },
                  { name: "CN. Trần Thị Y", subjects: ["Anh"], rating: 4.6, submitted: "5 giờ trước", docs: true },
                  { name: "Th.S Hoàng Văn Z", subjects: ["Hóa", "Sinh"], rating: 4.9, submitted: "1 ngày trước", docs: false },
                ].map((tutor, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-semibold">{tutor.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{tutor.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs">{tutor.subjects.join(", ")}</Badge>
                        <span className="text-xs text-slate-500">- {tutor.submitted}</span>
                        {tutor.docs ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="w-3 h-3" /> Đủ giấy tờ</span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-amber-600"><AlertCircle className="w-3 h-3" /> Thiếu giấy tờ</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="w-4 h-4 mr-1" />Duyệt</Button>
                      <Button size="sm" variant="outline"><XCircle className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Khiếu nại gần đây</CardTitle>
                  <CardDescription>Các khiếu nại cần xử lý</CardDescription>
                </div>
                <Badge variant="destructive">3 khiếu nại mới</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { student: "Nguyễn Văn A", tutor: "Th.S Lê Minh T", reason: "Gia sư không đến buổi học", time: "1 giờ trước", severity: "high" },
                  { student: "Trần Thị B", tutor: "CN. Phạm Thị H", reason: "Yêu cầu hoàn tiền", time: "3 giờ trước", severity: "medium" },
                  { student: "Lê Văn C", tutor: "Th.S Hoàng Văn A", reason: "Phản ánh chất lượng dạy", time: "1 ngày trước", severity: "low" },
                ].map((complaint, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={`w-2 h-10 rounded-full ${complaint.severity === "high" ? "bg-red-500" : complaint.severity === "medium" ? "bg-amber-500" : "bg-slate-300"}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{complaint.student}</p>
                        <span className="text-xs text-slate-400">vs {complaint.tutor}</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{complaint.reason} - {complaint.time}</p>
                    </div>
                    <Button size="sm" variant="outline">Xem</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Thống kê nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">Người dùng mới (tuần)</p>
                  <p className="font-semibold text-slate-900">+234</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">Đơn hàng mới (tuần)</p>
                  <p className="font-semibold text-slate-900">+89</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">Tỷ lệ hủy đơn</p>
                  <p className="font-semibold text-emerald-600">2.1%</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">Thu nhập (tuần)</p>
                  <p className="font-semibold text-slate-900">+45M</p>
                </div>
              </CardContent>
            </Card>
          
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Cảnh báo hệ thống</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { message: "3 gia sư chưa xác minh > 7 ngày", severity: "medium" },
                  { message: "5 yêu cầu hoàn tiền đang chờ", severity: "medium" },
                  { message: "Tất cả dịch vụ hoạt động bình thường", severity: "low" },
                ].map((alert, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${alert.severity === "medium" ? "bg-amber-50 border border-amber-200" : "bg-slate-50 border border-slate-200"}`}>
                    <AlertCircle className={`w-4 h-4 flex-shrink-0 ${alert.severity === "medium" ? "text-amber-600" : "text-slate-400"}`} />
                    <p className="text-xs text-slate-600">{alert.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}
