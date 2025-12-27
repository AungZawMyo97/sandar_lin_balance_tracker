import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNavbar } from "@/components/dashboard/mobile-navbar"; // <--- Import it here

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full relative">
      {/* 1. SIDEBAR CONTAINER */}
      {/* This div fixes the sidebar to the left side of the screen */}
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Sidebar /> {/* <--- The component sits here */}
      </div>

      {/* 2. MAIN CONTENT CONTAINER */}
      {/* md:pl-72 pushes the content over so it doesn't hide behind the sidebar */}
      <main className="md:pl-72 h-full bg-gray-100 min-h-screen">
        <MobileNavbar />
        <div className="p-8">
          {children}{" "}
          {/* <--- Your page content (Dashboard, Accounts, etc.) renders here */}
        </div>
      </main>
    </div>
  );
}
