import Link from "next/link";
import { GraduationCap, Mail, Phone, MapPin, Facebook, Youtube, Instagram } from "lucide-react";

const footerLinks = {
  platform: [
    { label: "Tìm gia sư", href: "/student/search" },
    { label: "Khóa học nhóm", href: "/classes" },
    { label: "Trở thành gia sư", href: "/auth?role=tutor" },
    { label: "Bảng giá", href: "/pricing" },
  ],
  subjects: [
    { label: "Toán học", href: "/student/search?subject=math" },
    { label: "Tiếng Anh", href: "/student/search?subject=english" },
    { label: "Vật lý", href: "/student/search?subject=physics" },
    { label: "Hóa học", href: "/student/search?subject=chemistry" },
    { label: "Ngữ văn", href: "/student/search?subject=vietnamese" },
  ],
  support: [
    { label: "Trung tâm trợ giúp", href: "/help" },
    { label: "Hướng dẫn sử dụng", href: "/guide" },
    { label: "Chính sách bảo mật", href: "/privacy" },
    { label: "Điều khoản sử dụng", href: "/terms" },
    { label: "Chính sách hoàn tiền", href: "/refund" },
  ],
  company: [
    { label: "Giới thiệu", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Tuyển dụng", href: "/careers" },
    { label: "Liên hệ", href: "/contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
      {/* Main footer */}
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-7 w-7 text-blue-500" />
              <span className="text-xl font-bold text-white">GiaSu Plus</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Nền tảng kết nối gia sư chất lượng cao với học sinh Việt Nam. Học tập mọi lúc, mọi nơi.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { Icon: Facebook, label: "Facebook", href: "#" },
                { Icon: Youtube, label: "Youtube", href: "#" },
                { Icon: Instagram, label: "Instagram", href: "#" },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">Nền tảng</h4>
            <ul className="space-y-2.5">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Subjects links */}
          {/* <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">Môn học</h4>
            <ul className="space-y-2.5">
              {footerLinks.subjects.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Support links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">Hỗ trợ</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">Công ty</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact bar */}
        <div className="mt-10 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-gray-400">
              <a href="mailto:contact@giasuplus.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-blue-500" />
                contact@giasuplus.com
              </a>
              <a href="tel:02812345678" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-blue-500" />
                028 1234 5678
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                TP. Hồ Chí Minh, Việt Nam
              </span>
            </div>
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} GiaSu Plus. Mọi quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
