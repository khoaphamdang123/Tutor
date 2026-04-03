"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export default function AdminIndexPage() {
  
  const router = useRouter();
  
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    
    if (isAuthenticated && user?.role === "Admin") 
    {
      router.replace("/admin/dashboard");
    } 
    else 
    {
      router.replace("/admin/auth");
    }

  }, [isAuthenticated, user, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-950">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500"/>
    </div>
  );
}
