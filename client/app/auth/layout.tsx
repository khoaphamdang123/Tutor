import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <a href="/" className="flex items-center gap-2">
            <GraduationCap className="w-10 h-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">GiaSu Plus</span>
          </a>
        </div>
        {children}
      </div>
    </div>
  );
}
