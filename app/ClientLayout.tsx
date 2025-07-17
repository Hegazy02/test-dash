"use client";

import { useEffect } from "react";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/main/sidebar";
import { SiteHeader } from "@/components/main/site-header";
import { WebsiteSelector } from "@/components/main/website-selector";
import { ThemeProvider } from "@/components/main/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";
import useAuthStore from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const UserIslogged = useAuthStore((state) => state.UserIslogged);
  const fetchUserData = useAuthStore((state) => state.fetchUserData);
  const pathname = usePathname() ?? "/";
  const isLoading = useAuthStore((state) => state.isLoading);
  const { role, userData } = useAuthStore();

  const publicPaths = ["/login", "/signup", "/register", "/forgot-password"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (!UserIslogged) {
      fetchUserData();
    }
  }, [UserIslogged, fetchUserData]);

  useEffect(() => {
    if (!isLoading) {
      // حالة 1: المستخدم غير مسجل دخول ويحاول الوصول لصفحة محمية
      if (!UserIslogged && !isPublicPath) {
        router.push("/login");
        return;
      }

      // حالة 2: المستخدم مسجل دخول ويحاول الوصول لصفحة عامة
      if (UserIslogged && isPublicPath) {
        // إذا كان role !== 'User' فقط، قم بتوجيهه للصفحة الرئيسية
        if (role !== "User") {
          router.push("/");
        }
        // إذا كان role === 'User'، اتركه في الصفحة العامة
        return;
      }

      // حالة 3: المستخدم مسجل دخول بـ role === 'User' ويحاول الوصول لصفحة محمية
      if (UserIslogged && role === "User" && !isPublicPath) {
        router.push("/login");
        return;
      }
    }
  }, [isLoading, UserIslogged, isPublicPath, router, role]);

  // أثناء التحميل، لا تعرض شيء
  if (isLoading) {
    return null;
  }

  // إذا كان المستخدم لديه role === 'User' وليس في صفحة عامة، لا تعرض شيء
  if (UserIslogged && role === "User" && !isPublicPath) {
    return null;
  }

  // إذا كان المستخدم غير مسجل دخول وليس في صفحة عامة، لا تعرض شيء
  if (!UserIslogged && !isPublicPath) {
    return null;
  }

  // عرض المحتوى فقط في الحالات التالية:
  // 1. الصفحة عامة (login, register, etc.)
  // 2. المستخدم مسجل دخول و role !== 'User'
  if (isPublicPath || (UserIslogged && role !== "User")) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="relative min-h-screen">
          {!isPublicPath && <SiteHeader />}
          <div className={`flex min-h-screen ${!isPublicPath ? "pt-16" : ""}`}>
            {!isPublicPath && <Sidebar />}
            <main className={`flex-1 ${!isPublicPath ? "pl-0 md:pl-64" : ""}`}>
              <div className={`container mx-auto p-4 md:p-8 max-w-full`}>
                {!isPublicPath && <WebsiteSelector />}
                {children}
              </div>
            </main>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // في أي حالة أخرى، لا تعرض شيء
  return null;
}
