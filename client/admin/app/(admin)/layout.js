import Sidebar from "../../components/layout/sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}