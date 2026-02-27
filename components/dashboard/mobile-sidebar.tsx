"use client";

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function MobileSidebar() {
  const [isMounted, setIsMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!isMounted) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="md:hidden pr-4 hover:opacity-75 transition">
          <Menu />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="p-0 bg-gray-900 border-r-gray-800 text-white w-72"
      >
        <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}
