"use client";

import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 w-80">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search clients, invoices..."
          className="bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none w-full"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        <Avatar className="h-9 w-9 cursor-pointer">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
