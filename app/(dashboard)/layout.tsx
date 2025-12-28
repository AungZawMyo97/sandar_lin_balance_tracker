import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNavbar } from "@/components/dashboard/mobile-navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Sidebar />
      </div>

      <main className="md:pl-72 h-full bg-gray-100 min-h-screen">
        <MobileNavbar />
        <div className="p-8">
          {children}{" "}
        </div>
      </main>
    </div>
  );
}
