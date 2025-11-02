import { Sidebar } from "./vendor/_components/sidebar/page";

export default function VendorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 z-30 hidden h-[calc(100vh-3.5rem)] w-64 border-r bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 md:block">
        <Sidebar />
      </aside>
      <main className="flex-1 md:pl-64">
        <div className="container p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
