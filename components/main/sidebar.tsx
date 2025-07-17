"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart,
  FileText,
  FileCode,
  Link2,
  ListFilter,
  Link as LinkIcon,
  BookOpen,
  MapIcon as SitemapIcon,
  User,
  Globe,
} from "lucide-react";
import useAuthStore from "@/lib/store/authStore";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { role, userData } = useAuthStore();

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

  // ✅ أضف صفحة "Users" إذا كان المستخدم Admin
  if (role === "Admin") {
    routes.push({
      title: "Users",
      href: "/users",
      icon: User,
    });
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-background pb-10 pt-16 md:flex">
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
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
        </nav>
      </div>
      <div className="mt-auto border-t">
        <div className="flex items-center p-4">
          <User className="mr-2 h-5 w-5" />
          <div className="text-sm">
            <p className="font-medium">{userData?.username}</p>
            <p className="text-xs text-muted-foreground">{userData?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
