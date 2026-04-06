"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useRef } from "react";

// Deadline badge helpers
function getDeadlineDays(taxYear: number, extensionFiled: boolean): number {
  const deadline = extensionFiled
    ? new Date(taxYear + 1, 3, 30) // April 30 of following year
    : new Date(taxYear + 1, 2, 31); // March 31 of following year
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function deadlineBadgeClass(days: number): string {
  if (days <= 7) return "bg-red-600 text-white";
  if (days <= 14) return "bg-amber-500 text-white";
  return "bg-blue-600 text-white";
}

function getInitials(fullName: string | null | undefined, email: string | null | undefined): string {
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName[0].toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

function getDisplayName(fullName: string | null | undefined, email: string | null | undefined): string {
  if (fullName) return fullName;
  if (email) return email;
  return "";
}

const YEAR_ROUND_NAV_ITEMS = [
  { href: "/payroll", label: "Pay Period" },
  { href: "/payroll/offers", label: "Offer Letters" },
];

interface NavigationProps {
  userEmail?: string | null;
  userFullName?: string | null;
  isAdmin?: boolean;
  taxYear?: number;
  extensionFiled?: boolean;
}

export default function Navigation({
  userEmail,
  userFullName,
  isAdmin,
  taxYear = new Date().getFullYear(),
  extensionFiled = false,
}: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deadlineDays, setDeadlineDays] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filingNavItems = [
    { href: "/filing", label: `${taxYear} Filing`, showDeadline: true },
    { href: "/filing/access", label: "Access Plan" },
    { href: "/checklist", label: "Audit Checklist" },
    { href: "/wizard", label: "Code Wizard" },
    { href: "/tracker", label: "Employee Tracker" },
    { href: "/guide", label: "WinTeam Guide" },
  ];

  useEffect(() => {
    const days = getDeadlineDays(taxYear, extensionFiled);
    if (days >= 0) setDeadlineDays(days);
  }, [taxYear, extensionFiled]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function isActive(href: string): boolean {
    if (href === "/payroll") {
      return pathname === "/payroll" || pathname.startsWith("/payroll/employees");
    }
    if (href === "/filing") {
      return (
        pathname === "/filing" ||
        (pathname.startsWith("/filing/") && !pathname.startsWith("/filing/access"))
      );
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

  const initials = getInitials(userFullName, userEmail);
  const displayName = getDisplayName(userFullName, userEmail);

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
                  <div className="text-navy-200 text-xs">RBM Services Inc.</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {filingNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${linkClass(item.href)} flex items-center gap-1.5`}
              >
                {item.label}
                {"showDeadline" in item &&
                  item.showDeadline &&
                  deadlineDays !== null && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-semibold leading-none ${deadlineBadgeClass(deadlineDays)}`}
                    >
                      {deadlineDays}d
                    </span>
                  )}
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

          {/* User dropdown */}
          <div className="hidden md:flex items-center">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-navy-600 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#1a3a5c] border-2 border-navy-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {initials}
                </div>
                {displayName && (
                  <span className="text-navy-100 text-sm max-w-[140px] truncate">
                    {displayName}
                  </span>
                )}
                <svg
                  className="w-3.5 h-3.5 text-navy-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Profile
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-navy-100 hover:text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
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
            {filingNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${mobileLinkClass(item.href)} flex items-center justify-between`}
                onClick={() => setMobileOpen(false)}
              >
                <span>{item.label}</span>
                {"showDeadline" in item &&
                  item.showDeadline &&
                  deadlineDays !== null && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-semibold leading-none ${deadlineBadgeClass(deadlineDays)}`}
                    >
                      {deadlineDays}d
                    </span>
                  )}
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
              <Link
                href="/profile"
                className={mobileLinkClass("/profile")}
                onClick={() => setMobileOpen(false)}
              >
                My Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-3 py-2 text-sm text-navy-100 hover:bg-navy-600 rounded-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
