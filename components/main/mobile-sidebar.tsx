"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart,
  FileText,
  Link2,
  Link as LinkIcon,
  ListFilter,
  FileCode,
  BookOpen,
  MapIcon as SitemapIcon,
  Globe,
  User, // ✅ ضروري لأيقونة صفحة المستخدمين
} from "lucide-react";

import { cn } from "@/lib/utils";
import useAuthStore from "@/lib/store/authStore"; // ✅ استيراد متجر المصادقة

export function MobileSidebar() {
  const pathname = usePathname();
  const { role } = useAuthStore(); // ✅ استخراج الدور

  const routes = [
    {
      title: "Dashboard",
      href: "/",
      icon: BarChart,
    },
    {
      title: "Websites",
      href: "/websites",
      icon: Globe,
    },
    {
      title: "Pages",
      href: "/pages",
      icon: FileCode,
    },
    {
      title: "Meta Title",
      href: "/meta-title",
      icon: FileText,
    },
    {
      title: "Meta Description",
      href: "/meta-description",
      icon: FileText,
    },
    {
      title: "Slug Control",
      href: "/slug-control",
      icon: Link2,
    },
    {
      title: "Blog Management",
      href: "/blog",
      icon: BookOpen,
    },
    {
      title: "Dynamic Sitemap",
      href: "/sitemap",
      icon: SitemapIcon,
    },
    {
      title: "Redirects (404 to 301)",
      href: "/redirects",
      icon: ListFilter,
    },
    {
      title: "Links Shortcut",
      href: "/link",
      icon: LinkIcon,
    },
  ];

  // ✅ إضافة صفحة "Users" فقط إذا كان الدور Admin
  if (role === "Admin") {
    routes.push({
      title: "Users",
      href: "/users",
      icon: User,
    });
  }

  return (
    <div className="grid items-start gap-2 px-2 py-2 text-sm font-medium">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
            pathname === route.href && "bg-accent text-accent-foreground",
          )}
        >
          <route.icon className="h-4 w-4" />
          {route.title}
        </Link>
      ))}
    </div>
  );
}
