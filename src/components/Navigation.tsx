"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { changeLanguage } from "@/providers/IntlProvider";
import { saveLanguagePreference } from "@/app/actions/language";
import type { Language } from "@/providers/IntlProvider";

// Deadline badge helpers
function getDeadlineDays(taxYear: number, extensionFiled: boolean): number {
  const deadline = extensionFiled
    ? new Date(taxYear + 1, 3, 30) // April 30 of following year
    : new Date(taxYear + 1, 2, 31); // March 31 of following year
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function DeadlineBadge({ days }: { days: number }) {
  const overdue = days <= 0;
  const bg = overdue
    ? "#7f1d1d"
    : days <= 7
    ? "#dc2626"
    : days <= 14
    ? "#f59e0b"
    : "#2563eb";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
        color: "white",
        fontSize: 10,
        fontWeight: 700,
        height: 18,
        maxWidth: 36,
        padding: "0 5px",
        borderRadius: 9,
        whiteSpace: "nowrap",
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {overdue ? "OVERDUE" : `${days}d`}
    </span>
  );
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

function getFirstName(fullName: string | null | undefined, email: string | null | undefined): string {
  if (fullName) {
    return fullName.trim().split(/\s+/)[0];
  }
  if (email) {
    return email.split("@")[0];
  }
  return "";
}

interface NavTabProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

function NavTab({ href, active, children }: NavTabProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 hover:bg-gray-100 transition-colors whitespace-nowrap"
      style={{
        fontSize: 13,
        padding: "0 14px",
        height: 44,
        color: active ? "#1a3a5c" : "#374151",
        borderBottom: active ? "3px solid #1a3a5c" : "3px solid transparent",
        fontWeight: active ? 600 : 400,
      }}
    >
      {children}
    </Link>
  );
}

interface NavigationProps {
  userEmail?: string | null;
  userFullName?: string | null;
  isAdmin?: boolean;
  taxYear?: number;
  extensionFiled?: boolean;
  initialLanguage?: Language;
}

export default function Navigation({
  userEmail,
  userFullName,
  isAdmin,
  taxYear = new Date().getFullYear(),
  extensionFiled = false,
  initialLanguage = 'en',
}: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('navigation');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deadlineDays, setDeadlineDays] = useState<number | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(initialLanguage);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filingNavItems = [
    { href: "/filing", label: t('filing', { year: taxYear }), showDeadline: true },
    { href: "/filing/access", label: t('accessPlan') },
    { href: "/checklist", label: t('auditChecklist') },
    { href: "/wizard", label: t('codeWizard') },
    { href: "/tracker", label: t('employeeTracker') },
    { href: "/guide", label: t('winteamGuide') },
  ];

  const yearRoundNavItems = [
    { href: "/payroll", label: t('payPeriod') },
    { href: "/payroll/offers", label: t('offerLetters') },
  ];

  useEffect(() => {
    setDeadlineDays(getDeadlineDays(taxYear, extensionFiled));
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

  // Sync language state when IntlProvider fires languageChange events
  useEffect(() => {
    const handler = (e: CustomEvent<Language>) => {
      setCurrentLanguage(e.detail);
    };
    window.addEventListener('languageChange', handler as EventListener);
    return () => window.removeEventListener('languageChange', handler as EventListener);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function handleLanguageToggle(lang: Language) {
    setCurrentLanguage(lang);
    changeLanguage(lang);
    // Fire-and-forget — don't await so UI updates instantly
    saveLanguagePreference(lang);
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

  const initials = getInitials(userFullName, userEmail);
  const firstName = getFirstName(userFullName, userEmail);

  return (
    <nav className="print:hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.10)" }}>
      {/* ROW 1 — App bar: 52px, navy background */}
      <div style={{ background: "#1a3a5c", height: 52 }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center justify-between h-full">
          {/* Left: Logo + brand */}
          <Link href="/checklist" className="flex items-center gap-2 flex-shrink-0">
            <div
              className="flex items-center justify-center rounded-md bg-white flex-shrink-0"
              style={{ width: 32, height: 32 }}
            >
              <span className="font-bold text-sm" style={{ color: "#1a3a5c" }}>1095</span>
            </div>
            <div>
              <div className="font-semibold text-sm leading-tight text-white">
                {t('appName')}
              </div>
              <div className="text-xs leading-tight" style={{ color: "#9db9d9" }}>
                {t('companyName')}
              </div>
            </div>
          </Link>

          {/* Right: language toggle + settings gear + user menu (desktop) + hamburger (mobile) */}
          <div className="flex items-center gap-3">
            {/* Language toggle — desktop ≥ 1024px */}
            <div className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => handleLanguageToggle('en')}
                className="transition-colors"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 4,
                  padding: "3px 8px",
                  background: currentLanguage === 'en' ? '#1a3a5c' : 'transparent',
                  color: currentLanguage === 'en' ? 'white' : '#9db9d9',
                  border: currentLanguage === 'en' ? '1px solid #1a3a5c' : '1px solid #4a6a8a',
                }}
              >
                EN
              </button>
              <button
                onClick={() => handleLanguageToggle('es')}
                className="transition-colors"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 4,
                  padding: "3px 8px",
                  background: currentLanguage === 'es' ? '#1a3a5c' : 'transparent',
                  color: currentLanguage === 'es' ? 'white' : '#9db9d9',
                  border: currentLanguage === 'es' ? '1px solid #1a3a5c' : '1px solid #4a6a8a',
                }}
              >
                ES
              </button>
            </div>

            {/* Admin button — admin only, desktop ≥ 1024px */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden lg:flex items-center justify-center transition-opacity hover:opacity-80"
                style={{
                  background: pathname.startsWith("/admin") ? "#142d47" : "rgba(255,255,255,0.15)",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 6,
                  padding: "4px 10px",
                  lineHeight: 1.4,
                }}
              >
                {t('admin')}
              </Link>
            )}

            {/* Settings gear — admin only, desktop ≥ 1024px */}
            {isAdmin && (
              <Link
                href="/settings"
                className="hidden lg:flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ color: "#9db9d9", fontSize: 20, lineHeight: 1 }}
                title={t('settings')}
                aria-label={t('settings')}
              >
                ⚙
              </Link>
            )}

            {/* User dropdown — desktop ≥ 1024px */}
            <div className="hidden lg:block relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors"
                style={{ background: "transparent" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.10)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "transparent")
                }
              >
                {/* Initials circle */}
                <div
                  className="flex items-center justify-center rounded-full flex-shrink-0 font-bold text-white text-xs"
                  style={{ width: 32, height: 32, background: "#142d47" }}
                >
                  {initials}
                </div>
                {firstName && (
                  <span className="text-sm text-white max-w-[120px] truncate">{firstName}</span>
                )}
                <svg
                  className="w-3 h-3 flex-shrink-0"
                  style={{ color: "#9db9d9" }}
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
                <div
                  className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg z-50 py-1"
                  style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
                >
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    {t('myProfile')}
                  </Link>
                  <div className="my-1" style={{ borderTop: "1px solid #f3f4f6" }} />
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {t('signOut')}
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger button — mobile/tablet < 1024px */}
            <button
              className="lg:hidden text-white p-1.5 rounded transition-colors hover:bg-white/10"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
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
      </div>

      {/* ROW 2 — Nav tabs: 44px, white background, visible ≥ 1024px */}
      <div
        className="hidden lg:block bg-white"
        style={{ height: 44, borderBottom: "1px solid #e5e7eb" }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center h-full">
          {/* Filing tools group */}
          {filingNavItems.map((item) => (
            <NavTab key={item.href} href={item.href} active={isActive(item.href)}>
              {item.label}
              {item.showDeadline && deadlineDays !== null && (
                <DeadlineBadge days={deadlineDays} />
              )}
            </NavTab>
          ))}

          {/* Group separator */}
          <span
            className="select-none mx-2 flex-shrink-0"
            style={{ color: "#d1d5db", fontSize: 18 }}
            aria-hidden="true"
          >
            ·
          </span>

          {/* Year-round tools group */}
          {yearRoundNavItems.map((item) => (
            <NavTab key={item.href} href={item.href} active={isActive(item.href)}>
              {item.label}
            </NavTab>
          ))}
        </div>
      </div>

      {/* Mobile/tablet dropdown panel — full-width, below ROW 1, < 1024px */}
      {mobileOpen && (
        <div
          className="lg:hidden bg-white border-t border-gray-200"
          style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
        >
          <div className="px-4 py-3 space-y-0.5">
            {/* Language toggle — mobile */}
            <div className="flex items-center gap-2 pb-3" style={{ borderBottom: "1px solid #f3f4f6" }}>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mr-1">Lang:</span>
              <button
                onClick={() => handleLanguageToggle('en')}
                className="transition-colors"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 4,
                  padding: "3px 8px",
                  background: currentLanguage === 'en' ? '#1a3a5c' : 'transparent',
                  color: currentLanguage === 'en' ? 'white' : '#6b7280',
                  border: currentLanguage === 'en' ? '1px solid #1a3a5c' : '1px solid #d1d5db',
                }}
              >
                EN
              </button>
              <button
                onClick={() => handleLanguageToggle('es')}
                className="transition-colors"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 4,
                  padding: "3px 8px",
                  background: currentLanguage === 'es' ? '#1a3a5c' : 'transparent',
                  color: currentLanguage === 'es' ? 'white' : '#6b7280',
                  border: currentLanguage === 'es' ? '1px solid #1a3a5c' : '1px solid #d1d5db',
                }}
              >
                ES
              </button>
            </div>

            {/* Filing tools section */}
            <div className="pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {t('filingGroup')}
            </div>
            {filingNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors"
                style={{
                  color: isActive(item.href) ? "#1a3a5c" : "#374151",
                  background: isActive(item.href) ? "#e8eef5" : "transparent",
                  fontWeight: isActive(item.href) ? 600 : 400,
                }}
                onClick={() => setMobileOpen(false)}
              >
                <span>{item.label}</span>
                {item.showDeadline && deadlineDays !== null && (
                  <DeadlineBadge days={deadlineDays} />
                )}
              </Link>
            ))}

            {/* Year-round section */}
            <div
              className="pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400"
              style={{ borderTop: "1px solid #f3f4f6", marginTop: 8 }}
            >
              {t('yearRoundGroup')}
            </div>
            {yearRoundNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-3 py-2.5 rounded-md text-sm transition-colors"
                style={{
                  color: isActive(item.href) ? "#1a3a5c" : "#374151",
                  background: isActive(item.href) ? "#e8eef5" : "transparent",
                  fontWeight: isActive(item.href) ? 600 : 400,
                }}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Admin + Settings — admin only */}
            {isAdmin && (
              <>
                <div style={{ borderTop: "1px solid #f3f4f6", marginTop: 8 }} />
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors"
                  style={{
                    color: isActive("/admin") ? "#1a3a5c" : "#374151",
                    background: isActive("/admin") ? "#e8eef5" : "transparent",
                    fontWeight: isActive("/admin") ? 600 : 400,
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  <span>🛡</span>
                  <span>{t('admin')}</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors"
                  style={{
                    color: isActive("/settings") ? "#1a3a5c" : "#374151",
                    background: isActive("/settings") ? "#e8eef5" : "transparent",
                    fontWeight: isActive("/settings") ? 600 : 400,
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  <span>⚙</span>
                  <span>{t('settings')}</span>
                </Link>
              </>
            )}

            {/* User actions */}
            <div style={{ borderTop: "1px solid #f3f4f6", marginTop: 8, paddingTop: 8 }}>
              <Link
                href="/profile"
                className="flex items-center px-3 py-2.5 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {t('myProfile')}
              </Link>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center px-3 py-2.5 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('signOut')}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
