import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MapPin, CheckCircle2 } from "lucide-react";
import type { Tutor } from "@/types";

interface TutorCardProps {
  tutor: Tutor;
}

export default function TutorCard({ tutor }: TutorCardProps) {
  const initials = tutor.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const avgRate = tutor.hourlyRate > 0
    ? tutor.hourlyRate.toLocaleString("vi-VN")
    : "Liên hệ";

  return (
    <Link href={`/student/search/${tutor.id}`} className="group block">
      <Card className="h-full hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group-hover:-translate-y-1">
        <CardContent className="p-5 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="w-14 h-14 border-2 border-gray-100 dark:border-gray-700">
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
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                {tutor.subjects?.map((s) => s.subjectName).join(", ") || "Nhiều môn học"}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {tutor.rating > 0 ? tutor.rating.toFixed(1) : "—"}
                </span>
                {tutor.reviewCount > 0 && (
                  <span className="text-xs text-gray-400">
                    ({tutor.reviewCount} đánh giá)
                  </span>
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
              {tutor.subjects.slice(0, 3).map((s) => (
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
                {avgRate}₫
              </span>
              <span className="text-xs text-gray-400 ml-1">/giờ</span>
            </div>
            <Badge
              variant={tutor.isVerified ? "default" : "secondary"}
              className={
                tutor.isVerified
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                  : ""
              }
            >
              {tutor.isVerified ? "✓ Đã xác minh" : "Chưa xác minh"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
