
import Sidebar from "../../components/layout/sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-zinc-950">
      <div className="h-dvh w-64 shrink-0">
        <Sidebar />
      </div>

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {children}
      </main>
    </div>
  );
}
