import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DollarSign, TrendingUp, Wallet, ArrowDownRight } from "lucide-react";
import DashboardLayout from "@/components/shared/dashboard-layout";

export default function EarningsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thu nhập</h1>
          <p className="text-slate-500 mt-1">Theo dõi và quản lý thu nhập từ dạy học</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Tổng thu nhập", value: "13.5M", change: "+12%", positive: true, icon: DollarSign },
            { label: "Thu nhập tháng này", value: "5.2M", change: "+8%", positive: true, icon: TrendingUp },
            { label: "Chờ thanh toán", value: "1.5M", icon: Wallet },
            { label: "Đã rút tiền", value: "11.0M", icon: ArrowDownRight },
          ].map((stat) => (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.positive ? "bg-emerald-100 text-emerald-600" : "bg-indigo-100 text-indigo-600"}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  {stat.change && (
                    <Badge variant={stat.positive ? "default" : "secondary"} className={stat.positive ? "bg-emerald-100 text-emerald-700 text-xs": ""}>
                      {stat.change}
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lịch sử giao dịch</CardTitle>
              <CardDescription>Các khoản thanh toán gần đây</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { student: "Nguyễn Văn A", subject: "Toán học", amount: 300000, date: "25/03/2026", status: "completed" },
                { student: "Trần Thị B", subject: "Toán học", amount: 240000, date: "24/03/2026", status: "completed" },
                { student: "Lê Văn C", subject: "Vật lý", amount: 260000, date: "23/03/2026", status: "pending" },
                { student: "Phạm Thị D", subject: "Tiếng Anh", amount: 240000, date: "22/03/2026", status: "completed" },
              ].map((tx, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-semibold">
                      {tx.student.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{tx.student}</p>
                    <p className="text-xs text-slate-500">{tx.subject} - {tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">+{tx.amount.toLocaleString()}đ</p>
                    <Badge variant={tx.status === "completed" ? "default" : "secondary"} className="text-xs mt-0.5">
                      {tx.status === "completed" ? "Đã nhận" : "Chờ"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rút tiền</CardTitle>
              <CardDescription>Yêu cầu rút tiền về tài khoản ngân hàng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">Số dư khả dụng</p>
                  <Badge variant="default" className="bg-indigo-600">VNPay</Badge>
                </div>
                <p className="text-3xl font-bold text-slate-900">1.500.000đ</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Chọn phương thức rút tiền</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="justify-start h-12 border-indigo-200 bg-indigo-50">
                    Ngân hàng
                  </Button>
                  <Button variant="outline" className="justify-start h-12">
                    Ví điện tử
                  </Button>
                </div>
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Rút tiền ngay</Button>
              <p className="text-xs text-center text-slate-500">Yêu cầu rút tiền sẽ được xử lý trong 1-3 ngày làm việc</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
