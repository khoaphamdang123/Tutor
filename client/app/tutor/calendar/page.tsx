import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import DashboardLayout from "@/components/shared/dashboard-layout";

export default function TutorCalendarPage() {
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lịch dạy</h1>
          <p className="text-slate-500 mt-1">Quản lý lịch trống và lịch dạy của bạn</p>
        </div>

        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm">◀ Tuần trước</Button>
          <Button variant="outline" size="sm">Tuần này</Button>
          <Button variant="outline" size="sm">Tuần sau ▶</Button>
          <Button size="sm" className="ml-auto bg-indigo-600 hover:bg-indigo-700">
            <Calendar className="w-4 h-4 mr-2" /> Cập nhật lịch trống
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-8 border-b">
              <div className="p-3 text-center font-medium text-slate-500 text-sm border-r" />
              {days.map((day) => (
                <div key={day} className="p-3 text-center font-medium text-slate-700 border-r last:border-r-0">{day}</div>
              ))}
            </div>
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b last:border-b-0">
                <div className="p-3 text-center text-sm text-slate-500 border-r">{hour}:00</div>
                {days.map((day, dayIndex) => (
                  <div key={`${hour}-${day}`} className="p-1 border-r last:border-r-0 min-h-[50px] hover:bg-slate-50 transition-colors" />
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
