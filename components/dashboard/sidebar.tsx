"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ArrowRightLeft, Wallet, LogOut, Calculator, DollarSign } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Transactions",
    icon: ArrowRightLeft,
    href: "/transactions",
    color: "text-violet-500",
  },
  {
    label: "My Accounts",
    icon: Wallet,
    href: "/accounts",
    color: "text-pink-700",
  },
  {
    label: "Daily Status",
    icon: Calculator,
    href: "/closings",
    color: "text-emerald-500",
  },
  {
    label: "Exchange Rates",
    icon: DollarSign,
    href: "/exchange-rates",
    color: "text-yellow-500",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">SDL Trusted BKK</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href
                  ? "text-white bg-white/10"
                  : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* LOGOUT SECTION */}
      <div className="px-3 py-2">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full text-sm group flex p-3 justify-start font-medium cursor-pointer text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <LogOut className="h-5 w-5 mr-3 text-red-500" />
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}
