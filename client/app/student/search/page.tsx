import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, MapPin, Filter, Video, Bookmark } from "lucide-react";
import DashboardLayout from "@/components/shared/dashboard-layout";

const tutors = [
  { id: "1", name: "Th.S Lê Minh Tuấn", subjects: ["Toán học", "Vật lý"], location: "TP. Hồ Chí Minh", rating: 4.9, reviews: 156, hourlyRate: 150000, isVerified: true, bio: "Thạc sĩ Toán từ ĐH Quốc gia với 8 năm kinh nghiệm giảng dạy. Chuyên luyện thi ĐH, violympic." },
  { id: "2", name: "CN. Phạm Thị Hương", subjects: ["Tiếng Anh"], location: "Hà Nội", rating: 4.8, reviews: 203, hourlyRate: 120000, isVerified: true, bio: "Chứng chỉ IELTS 8.0, 5 năm kinh nghiệm dạy tiếng Anh giao tiếp và luyện thi." },
  { id: "3", name: "Th.S Hoàng Văn An", subjects: ["Vật lý", "Hóa học"], location: "TP. Hồ Chí Minh", rating: 4.7, reviews: 89, hourlyRate: 130000, isVerified: true, bio: "Giảng viên đại học Bách Khoa, chuyên gia luyện thi THPTQG môn Lý, Hóa." },
  { id: "4", name: "GV. Nguyễn Thị Mai", subjects: ["Ngữ văn", "Lịch sử"], location: "Hà Nội", rating: 4.6, reviews: 67, hourlyRate: 110000, isVerified: false, bio: "Giáo viên THPT với 12 năm kinh nghiệm, chuyên dạy Ngữ văn và Lịch sử." },
  { id: "5", name: "Th.S Trần Đức Mạnh", subjects: ["Toán học", "Sinh học"], location: "Đà Nẵng", rating: 4.9, reviews: 112, hourlyRate: 140000, isVerified: true, bio: "Thạc sĩ Sinh học, chuyên luyện thi chuyên sinh và thi THPTQG." },
  { id: "6", name: "CN. Lê Thị Thu", subjects: ["Tiếng Anh", "Tiếng Pháp"], location: "TP. Hồ Chí Minh", rating: 4.5, reviews: 45, hourlyRate: 100000, isVerified: false, bio: "Cử nhân Sư phạm Anh, chuyên dạy tiếng Anh trẻ em và người lớn." },
];

export default function SearchPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tìm gia sư</h1>
          <p className="text-slate-500 mt-1">Tìm kiếm gia sư phù hợp với nhu cầu học tập của bạn</p>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Tìm theo tên hoặc môn học..." className="pl-9 h-11" />
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-40 h-11">
                  <SelectValue placeholder="Môn học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">Toán học</SelectItem>
                  <SelectItem value="english">Tiếng Anh</SelectItem>
                  <SelectItem value="physics">Vật lý</SelectItem>
                  <SelectItem value="chemistry">Hóa học</SelectItem>
                  <SelectItem value="vietnamese">Ngữ văn</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-36 h-11">
                  <SelectValue placeholder="Mức giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-100">Dưới 100K</SelectItem>
                  <SelectItem value="100-150">100K - 150K</SelectItem>
                  <SelectItem value="150+">Trên 150K</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-32 h-11">
                  <SelectValue placeholder="Đánh giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4.5">Từ 4.5 sao</SelectItem>
                  <SelectItem value="4.0">Từ 4.0 sao</SelectItem>
                </SelectContent>
              </Select>
              <Button className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700">
                <Filter className="w-4 h-4 mr-2" /> Lọc
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tutors.map((tutor) => (
            <Card key={tutor.id} className="hover:shadow-lg transition-all hover:border-indigo-200 group">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-lg font-bold">
                      {tutor.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 truncate">{tutor.name}</h3>
                      {tutor.isVerified && <Badge variant="default" className="bg-emerald-100 text-emerald-700 text-xs h-5">✓ Đã xác minh</Badge>}
                    </div>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" /> {tutor.location}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-semibold text-slate-900">{tutor.rating}</span>
                      <span className="text-xs text-slate-500">({tutor.reviews} đánh giá)</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {tutor.subjects.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 mb-3">{tutor.bio}</p>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <span className="text-lg font-bold text-indigo-600">{tutor.hourlyRate.toLocaleString()}đ</span>
                    <span className="text-xs text-slate-500">/giờ</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Bookmark className="w-4 h-4" />
                    </Button>
                    <Link href={`/(student)/search/${tutor.id}`}>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        <Video className="w-4 h-4 mr-1" /> Đặt lịch
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled>← Trước</Button>
          <Button variant="outline" size="sm" className="bg-indigo-50 border-indigo-200">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm">Sau →</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
