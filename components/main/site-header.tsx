import Link from "next/link";
import { Menu } from "lucide-react";
import { ModeToggle } from "@/components/main/mode-toggle";
import { UserNav } from "@/components/main/user-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileSidebar } from "@/components/main/mobile-sidebar";

export function SiteHeader() {
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-4 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 pt-16">
            <MobileSidebar />
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold">SEO Dashboard</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ModeToggle />
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  );
}
