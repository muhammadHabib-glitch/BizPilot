"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { name: "Scheduling", href: "/dashboard/scheduling", icon: Calendar },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "AI Copilot", href: "/dashboard/ai", icon: Sparkles },
];

const bottomNav = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-gray-200 bg-white transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm shrink-0">
          B
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-gray-900">BizPilot</span>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 p-3 space-y-1">
        {bottomNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
