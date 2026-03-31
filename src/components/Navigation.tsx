"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

const FILING_NAV_ITEMS = [
  { href: "/checklist", label: "Audit Checklist" },
  { href: "/wizard", label: "Code Wizard" },
  { href: "/tracker", label: "Employee Tracker" },
  { href: "/guide", label: "WinTeam Guide" },
];

const YEAR_ROUND_NAV_ITEMS = [
  { href: "/payroll", label: "Pay Period" },
  { href: "/payroll/offers", label: "Offer Letters" },
];

interface NavigationProps {
  userEmail?: string | null;
  isAdmin?: boolean;
}

export default function Navigation({ userEmail, isAdmin }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function isActive(href: string): boolean {
    if (href === "/payroll") {
      // Active for /payroll and /payroll/employees/... but NOT /payroll/offers
      return pathname === "/payroll" || pathname.startsWith("/payroll/employees");
    }
    return pathname.startsWith(href);
  }

  const linkClass = (href: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(href)
        ? "bg-navy-800 text-white"
        : "text-navy-100 hover:bg-navy-600 hover:text-white"
    }`;

  const mobileLinkClass = (href: string) =>
    `block px-3 py-2 rounded-md text-sm font-medium ${
      isActive(href) ? "bg-navy-800 text-white" : "text-navy-100 hover:bg-navy-600"
    }`;

  return (
    <nav className="bg-navy-700 text-white shadow-md print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Link href="/checklist" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                  <span className="text-navy-700 font-bold text-sm">1095</span>
                </div>
                <div className="hidden sm:block">
                  <div className="font-semibold text-sm leading-tight">1095-C HR Toolkit</div>
                  <div className="text-navy-200 text-xs">ABC Janitorial Services</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {FILING_NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ))}
            <span className="text-navy-500 mx-1 select-none">|</span>
            {YEAR_ROUND_NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/settings" className={linkClass("/settings")}>
                Settings
              </Link>
            )}
          </div>

          {/* User menu */}
          <div className="hidden md:flex items-center gap-3">
            {userEmail && (
              <span className="text-navy-200 text-xs truncate max-w-[150px]">
                {userEmail}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="text-navy-100 hover:text-white text-sm font-medium px-3 py-1.5 rounded border border-navy-500 hover:border-navy-300 transition-colors"
            >
              Sign out
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-navy-100 hover:text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-navy-600">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="px-3 py-1 text-navy-400 text-xs font-semibold uppercase tracking-wider">
              Filing Tools
            </div>
            {FILING_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={mobileLinkClass(item.href)}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="px-3 pt-2 pb-1 text-navy-400 text-xs font-semibold uppercase tracking-wider border-t border-navy-600 mt-1">
              Year-Round
            </div>
            {YEAR_ROUND_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={mobileLinkClass(item.href)}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/settings"
                className={mobileLinkClass("/settings")}
                onClick={() => setMobileOpen(false)}
              >
                Settings
              </Link>
            )}
            <div className="pt-2 border-t border-navy-600">
              {userEmail && (
                <div className="px-3 py-2 text-navy-300 text-xs">{userEmail}</div>
              )}
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-3 py-2 text-sm text-navy-100 hover:bg-navy-600 rounded-md"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
