"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  BookOpen,
  Star,
  Users,
  CalendarCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  MapPin,
  CheckCircle,
} from "lucide-react";
import api from "@/lib/api-client";
import Footer from "@/components/shared/footer";
import { useAuthStore } from "@/lib/auth-store";
import type { ApiResponse, TutorSearchResult, Tutor } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [featuredTutors, setFeaturedTutors] = useState<Tutor[]>([]);
  const [loadingTutors, setLoadingTutors] = useState(false);
  const [stats, setStats] = useState({ tutors: 0, students: 2847, classes: 0 });

  const handleFindTutor = () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (user?.role !== "Student") {
      router.push("/auth");
      return;
    }
    router.push("/student/search");
  };

  useEffect(() => {
    const fetchFeaturedTutors = async () => {
      setLoadingTutors(true);
      try {
        const res = await api.get<ApiResponse<TutorSearchResult>>("/tutors/search?page=1&pageSize=6");
        if (res.data.success && res.data.data) {
          setFeaturedTutors(res.data.data.tutors);
          setStats((s) => ({ ...s, tutors: res.data.data.totalCount }));
        }
      } catch {
        // fail silently — featured section stays empty
      } finally {
        setLoadingTutors(false);
      }
    };
    fetchFeaturedTutors();
  }, []);

  const subjects = [
    "Toán học", "Tiếng Anh", "Vật lý", "Hóa học",
    "Ngữ văn", "Sinh học", "Lịch sử", "Địa lý",
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-gray-800 bg-white/80 backdrop-blur dark:bg-gray-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">GiaSu Plus</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#tutors" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Gia sư nổi bật</Link>
            <Button onClick={handleFindTutor} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" variant="ghost">Tìm gia sư</Button>
            <Link href="/classes" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Khóa học nhóm</Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Bảng giá</Link>
            <Link href="/auth" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Trở thành gia sư</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth">
              <Button variant="ghost">Đăng nhập</Button>
            </Link>
            <Link href="/auth">
              <Button>Đăng ký ngay</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Hơn {stats.tutors > 0 ? `${stats.tutors}+` : "10,000+"} gia sư chất lượng cao
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Kết nối gia sư <span className="text-blue-600">chất lượng</span><br />
            cho học sinh Việt Nam
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Nền tảng học tập trực tuyến hàng đầu, kết nối học sinh với gia sư giỏi, lịch học linh hoạt, và chất lượng giảng dạy được đảm bảo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleFindTutor} size="lg" className="text-base px-8 bg-blue-600 hover:bg-blue-700">
              Tìm gia sư ngay <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="text-base px-8">
                Trở thành gia sư
              </Button>
            </Link>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Miễn phí đăng ký
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Gia sư được xác minh
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Hoàn tiền nếu không hài lòng
            
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-blue-600 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center text-white">
            {[
              { value: `${stats.tutors > 0 ? stats.tutors.toLocaleString() : "—"}+`, label: "Gia sư", icon: Users },
              { value: `${stats.students.toLocaleString()}+`, label: "Học sinh", icon: GraduationCap },
              { value: `${stats.classes > 0 ? stats.classes.toLocaleString() : "—"}+`, label: "Khóa học", icon: BookOpen },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon className="w-5 h-5 opacity-80" />
                <span className="text-2xl font-bold">{value}</span>
                <span className="text-xs text-blue-200">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Tại sao chọn GiaSu Plus?</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Chúng tôi cung cấp trải nghiệm học tập tốt nhất với các tính năng vượt trội</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Gia sư chất lượng cao",
                desc: "Đội ngũ gia sư được tuyển chọn kỹ lưỡng, có bằng cấp và kinh nghiệm giảng dạy.",
              },
              {
                icon: CalendarCheck,
                title: "Lịch học linh hoạt",
                desc: "Đặt lịch học dễ dàng, phù hợp với thời gian biểu của bạn.",
              },
              {
                icon: Star,
                title: "Đánh giá minh bạch",
                desc: "Xem đánh giá thực tế từ học sinh trước khi chọn gia sư.",
              },
            ].map((f, i) => (
              <Card key={i} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                    <f.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 dark:text-gray-400">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tutors */}
      <section id="tutors" className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Gia sư nổi bật</h2>
            <p className="text-gray-500 dark:text-gray-400">Những gia sư được đánh giá cao nhất trên nền tảng</p>
          </div>

          {loadingTutors ? (
            /* Skeleton cards */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700" />
                      <div className="flex-1 space-y-2 pt-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredTutors.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTutors.map((tutor) => {
                const initials = tutor.fullName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <Link key={tutor.id} href={`/student/search/${tutor.id}`} className="group block">
                    <Card className="h-full hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group-hover:-translate-y-1">
                      <CardContent className="p-5 flex flex-col h-full">
                        {/* Avatar + info */}
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="w-14 h-14 border-2 border-gray-100 dark:border-gray-700 flex-shrink-0">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-bold dark:bg-blue-900 dark:text-blue-300">
                              {initials}
                            </AvatarFallback>
                            {tutor.avatarUrl && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={tutor.avatarUrl}
                                alt={tutor.fullName}
                                className="w-full h-full object-cover rounded-full"
                              />
                            )}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {tutor.fullName}
                              </h3>
                              {tutor.isVerified && (
                                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                              {tutor.subjects?.map((s: { subjectName: string }) => s.subjectName).join(", ") || "Nhiều môn học"}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {tutor.rating > 0 ? tutor.rating.toFixed(1) : "—"}
                              </span>
                              {tutor.reviewCount > 0 && (
                                <span className="text-xs text-gray-400">({tutor.reviewCount} đánh giá)</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        {tutor.bio && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 flex-1">
                            {tutor.bio}
                          </p>
                        )}

                        {/* Subject tags */}
                        {tutor.subjects && tutor.subjects.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {tutor.subjects.slice(0, 3).map((s: { subjectId: string; subjectName: string }) => (
                              <Badge key={s.subjectId} variant="secondary" className="text-xs font-normal">
                                {s.subjectName}
                              </Badge>
                            ))}
                            {tutor.subjects.length > 3 && (
                              <Badge variant="secondary" className="text-xs font-normal">
                                +{tutor.subjects.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {tutor.hourlyRate > 0 ? `${tutor.hourlyRate.toLocaleString("vi-VN")}₫` : "Liên hệ"}
                            </span>
                            <span className="text-xs text-gray-400 ml-1">/giờ</span>
                          </div>
                          <Badge
                            variant={tutor.isVerified ? "default" : "secondary"}
                            className={
                              tutor.isVerified
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs"
                                : "text-xs"
                            }
                          >
                            {tutor.isVerified ? "✓ Đã xác minh" : "Chưa xác minh"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* No data yet — show friendly empty state */
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>Chưa có gia sư nào được hiển thị.</p>
              <p className="text-sm">Hãy là người đầu tiên đăng ký trở thành gia sư!</p>
            </div>
          )}

          {featuredTutors.length > 0 && (
            <div className="text-center mt-8">
              <Link href="/student/search">
                <Button variant="outline" size="lg" className="px-8">
                  Xem tất cả gia sư <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Popular Subjects */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Môn học phổ biến</h2>
            <p className="text-gray-500 dark:text-gray-400">Chọn môn học phù hợp với nhu cầu của bạn</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {subjects.map((subject) => (
              <Link key={subject} href={`/student/search?subject=${encodeURIComponent(subject)}`}>
                <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer text-center">
                  <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <p className="font-medium text-gray-900 dark:text-white">{subject}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-blue-600 rounded-2xl p-10 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu học tập?</h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">Đăng ký ngay hôm nay và nhận ưu đãi học phí 20% cho khóa học đầu tiên</p>
            <Link href="/auth">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Đăng ký miễn phí <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
