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
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminUser");

    window.location.href = "/login";
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold tracking-tight">
          sscMock
        </h1>

        <span className="ml-2 rounded-md bg-black px-2 py-1 text-xs font-medium text-white">
          Admin
        </span>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-gray-100 text-black"
                  : "text-gray-600 hover:bg-gray-50 hover:text-black"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600 hover:text-black"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}