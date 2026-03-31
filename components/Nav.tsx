"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/audit-checklist", label: "Audit Checklist" },
  { href: "/code-lookup", label: "Code Lookup" },
  { href: "/employee-tracker", label: "Employees" },
  { href: "/winteam-guide", label: "WinTeam Guide" },
];

export default function Nav({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <nav className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg shrink-0">
              <span className="bg-white text-blue-900 rounded px-1.5 py-0.5 text-sm font-black">
                1095
              </span>
              <span className="hidden sm:inline">HR Toolkit</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-blue-700 text-white"
                      : "text-blue-200 hover:text-white hover:bg-blue-800"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="hidden sm:block text-blue-300 text-sm truncate max-w-[200px]">
                {userEmail}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="text-sm text-blue-200 hover:text-white border border-blue-700 hover:border-blue-500 px-3 py-1.5 rounded-md transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden pb-3 flex gap-1 flex-wrap">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                pathname === item.href
                  ? "bg-blue-700 text-white"
                  : "text-blue-200 hover:text-white hover:bg-blue-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
