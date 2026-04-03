"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api-client";
import type { ApiResponse, PublicPricingCard } from "@/types";

const THEME_STYLES: Record<string, { header: string; headerDark: string; badge: string; badgeDark: string; border: string }> = {
  primary: {
    header: "bg-blue-600",
    headerDark: "dark:bg-blue-700",
    badge: "bg-blue-100 text-blue-700",
    badgeDark: "dark:bg-blue-900 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
  },
  green: {
    header: "bg-emerald-600",
    headerDark: "dark:bg-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
    badgeDark: "dark:bg-emerald-900 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  orange: {
    header: "bg-orange-500",
    headerDark: "dark:bg-orange-600",
    badge: "bg-orange-100 text-orange-700",
    badgeDark: "dark:bg-orange-900 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800",
  },
  purple: {
    header: "bg-purple-600",
    headerDark: "dark:bg-purple-700",
    badge: "bg-purple-100 text-purple-700",
    badgeDark: "dark:bg-purple-900 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
  },
};

export default function PricingPage() {
  const [cards, setCards] = useState<PublicPricingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<ApiResponse<PublicPricingCard[]>>("/pricing-cards");
        if (res.data.success && res.data.data) {
          setCards(res.data.data);
        }
      } catch {
        setError("Không thể tải bảng giá. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  const getTheme = (key: string) =>
    THEME_STYLES[key] ?? THEME_STYLES.primary;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-gray-800 bg-white/80 backdrop-blur dark:bg-gray-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">GiaSu Plus</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#tutors" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Gia sư nổi bật</Link>
            <Link href="/student/search" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Tìm gia sư</Link>
            <Link href="/classes" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Khóa học nhóm</Link>
            <Link href="/pricing" className="text-sm font-medium text-blue-600 dark:text-blue-400">Bảng giá</Link>
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

      {/* Page Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Học Phí Theo Cấp Lớp
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Chúng tôi cung cấp mức học phí hợp lý cho mọi cấp lớp, đội ngũ gia sư chất lượng cao, và cam kết chất lượng giảng dạy.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-200 dark:border-gray-700 animate-pulse"
                >
                  <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-t-2xl" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                    <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <p>Chưa có thông tin bảng giá.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((card) => {
                const theme = getTheme(card.themeKey);
                return (
                  <div
                    key={card.id}
                    className={`relative rounded-2xl border ${theme.border} bg-white dark:bg-gray-900 flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-200 ${
                      card.isPopular ? "ring-2 ring-blue-500 dark:ring-blue-400 scale-[1.02]" : ""
                    }`}
                  >
                    {/* Popular badge */}
                    {card.isPopular && (
                      <div className="absolute top-4 right-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${theme.badge} ${theme.badgeDark}`}>
                          Phổ biến
                        </span>
                      </div>
                    )}

                    {/* Card Header */}
                    <div className={`${theme.header} ${theme.headerDark} p-6 text-white`}>
                      <h3 className="text-xl font-bold leading-tight">{card.title}</h3>
                      {card.subtitle && (
                        <p className="text-sm opacity-80 mt-1">{card.subtitle}</p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                          {card.priceLabel}
                        </span>
                        {card.priceUnit && (
                          <span className="text-sm text-gray-400 dark:text-gray-500">{card.priceUnit}</span>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="p-6 flex-1">
                      <ul className="space-y-3">
                        {card.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA */}
                    <div className="p-6 pt-0">
                      <Link href="/auth" className="block">
                        <Button
                          className={`w-full ${
                            card.isPopular
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
                          }`}
                        >
                          Đăng ký ngay
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 max-w-3xl mx-auto text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Học phí chưa bao gồm phí môi giới. Giá có thể thay đổi tùy theo chương trình học và yêu cầu riêng của học sinh.
              Liên hệ trực tiếp với gia sư để biết thêm chi tiết.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Bạn muốn trở thành gia sư?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Đăng ký ngay để bắt đầu nhận học sinh và kiếm thu nhập.
          </p>
          <Link href="/auth">
            <Button size="lg">
              Trở thành gia sư <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
