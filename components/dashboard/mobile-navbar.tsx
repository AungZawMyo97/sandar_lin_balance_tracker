"use client";

import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";

export function MobileNavbar() {
    return (
        <div className="flex items-center p-4 md:hidden bg-slate-50 border-b">
            <MobileSidebar />
            <div className="font-bold text-lg">Exchange App</div>
        </div>
    );
}
