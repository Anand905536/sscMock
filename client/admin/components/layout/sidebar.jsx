"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  FileText,
  CircleHelp,
  LogOut,
} from "lucide-react";

import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Tests",
    href: "/tests",
    icon: FileText,
  },
  {
    name: "Questions",
    href: "/questions",
    icon: CircleHelp,
  },
  {
    name: "Full-length-exams",
    href: "/full-length-exams",
    icon: CircleHelp,
  },
  {
    name: "Upload PDFs",
    href: "/upload",
    icon: CircleHelp,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminUser");

    window.location.href = "/login";
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900 text-zinc-100">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Section Wise
        </h1>

        <span className="ml-2 rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white shadow-sm">
          Admin
        </span>
      </div>

      <Separator className="bg-zinc-800" />

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${active
                  ? "bg-emerald-500/15 text-emerald-400 font-semibold shadow-xs"
                  : "text-zinc-400 hover:bg-zinc-800/80 hover:text-white"
                }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-emerald-400" : "text-zinc-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-xl cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 text-rose-400" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}