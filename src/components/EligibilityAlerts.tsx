"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type { EligibilityDashboardRow } from "@/lib/types";

interface Alert {
  id: string;
  message: string;
  severity: "critical" | "high" | "medium";
  href: string;
}

function buildAlerts(
  rows: EligibilityDashboardRow[],
  t: ReturnType<typeof useTranslations>
): Alert[] {
  const alerts: Alert[] = [];

  const crossedThreshold = rows.filter((r) => r.warning_crossed_threshold);
  if (crossedThreshold.length > 0) {
    alerts.push({
      id: "crossed_threshold",
      message: `${crossedThreshold.length} employee${crossedThreshold.length > 1 ? "s" : ""} ${t("crossedThreshold")}`,
      severity: "critical",
      href: "/payroll",
    });
  }

  const expiredOffers = rows.filter((r) => r.warning_offer_expired);
  if (expiredOffers.length > 0) {
    alerts.push({
      id: "offer_expired",
      message: `${expiredOffers.length} offer letter${expiredOffers.length > 1 ? "s" : ""} — ${t("offerExpired")}`,
      severity: "critical",
      href: "/payroll/offers",
    });
  }

  const offersNotSent = rows.filter((r) => r.warning_offer_not_sent);
  if (offersNotSent.length > 0) {
    alerts.push({
      id: "offer_not_sent",
      message: `${offersNotSent.length} employee${offersNotSent.length > 1 ? "s" : ""} — ${t("offerNotSent")}`,
      severity: "critical",
      href: "/payroll/offers",
    });
  }

  const inAdminPeriod = rows.filter((r) => r.in_admin_period);
  if (inAdminPeriod.length > 0) {
    const minDays = Math.min(...inAdminPeriod.map((r) => r.days_until_coverage_must_start ?? 999));
    alerts.push({
      id: "admin_period",
      message: `${t("inAdminPeriod")} — ${inAdminPeriod.length} employee${inAdminPeriod.length > 1 ? "s" : ""} need offers processed. Coverage must start in ${minDays} day${minDays !== 1 ? "s" : ""}.`,
      severity: "high",
      href: "/payroll/offers",
    });
  }

  const deadlineRows = rows.filter(
    (r) =>
      r.offer_deadline &&
      r.offer_status === "pending" &&
      !r.warning_offer_expired
  );
  const soonDeadlines = deadlineRows.filter((r) => {
    const daysUntil =
      (new Date(r.offer_deadline!).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntil <= 14 && daysUntil >= 0;
  });
  if (soonDeadlines.length > 0) {
    alerts.push({
      id: "offer_deadline",
      message: `${soonDeadlines.length} offer letter${soonDeadlines.length > 1 ? "s" : ""} deadline approaching within 14 days`,
      severity: "high",
      href: "/payroll/offers",
    });
  }

  const approachingThreshold = rows.filter((r) => r.warning_approaching_threshold);
  if (approachingThreshold.length > 0) {
    alerts.push({
      id: "approaching_threshold",
      message: `${approachingThreshold.length} employee${approachingThreshold.length > 1 ? "s" : ""} — ${t("approachingThreshold")}`,
      severity: "medium",
      href: "/payroll",
    });
  }

  return alerts;
}

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  critical: {
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-800",
    icon: "⚠",
  },
  high: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-800",
    icon: "⚡",
  },
  medium: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
    icon: "ℹ",
  },
};

interface EligibilityAlertsProps {
  rows: EligibilityDashboardRow[];
}

export default function EligibilityAlerts({ rows }: EligibilityAlertsProps) {
  const t = useTranslations("payroll");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const alerts = buildAlerts(rows, t).filter((a) => !dismissed.has(a.id));

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-1 print:hidden">
      {alerts.map((alert) => {
        const style = SEVERITY_STYLES[alert.severity];
        return (
          <div
            key={alert.id}
            className={`flex items-center justify-between gap-2 px-4 py-2 border-b ${style.bg} ${style.border} ${style.text}`}
          >
            <Link href={alert.href} className="flex items-center gap-2 flex-1 min-w-0 hover:underline">
              <span className="flex-shrink-0 font-bold">{style.icon}</span>
              <span className="text-sm truncate">{alert.message}</span>
            </Link>
            <button
              onClick={() => setDismissed((prev) => new Set(Array.from(prev).concat(alert.id)))}
              className={`flex-shrink-0 text-xs opacity-60 hover:opacity-100 ml-2 ${style.text}`}
              aria-label="Dismiss alert"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
