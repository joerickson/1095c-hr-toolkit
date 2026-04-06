"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import { getFilingChecklist, PHASE_METADATA } from "@/lib/filing-checklist-items";

interface FilingPhaseRow {
  id: string;
  tax_year: number;
  phase_number: number;
  phase_name: string;
  status: "locked" | "in_progress" | "complete" | "blocked";
  started_at: string | null;
  completed_at: string | null;
}

interface FilingProgressRow {
  tax_year: number;
  item_key: string;
  is_complete: boolean;
}

interface Props {
  userId: string;
  initialPhases: FilingPhaseRow[] | null;
  initialProgress: FilingProgressRow[] | null;
  tablesReady: boolean;
  blockingIssues: number;
  warningIssues: number;
  infoIssues: number;
  defaultTaxYear: number;
  extensionFiled: boolean;
}

function getFilingDeadline(taxYear: number, extensionFiled: boolean): Date {
  if (extensionFiled) {
    return new Date(taxYear + 1, 3, 30); // April 30 of following year (month is 0-indexed)
  }
  return new Date(taxYear + 1, 2, 31); // March 31 of following year
}

function getDaysRemaining(deadline: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = deadline.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function deadlineBannerClass(days: number): string {
  if (days < 0) return "bg-red-900 text-white";
  if (days <= 7) return "bg-red-600 text-white";
  if (days <= 14) return "bg-amber-500 text-white";
  return "bg-blue-600 text-white";
}

function deadlineBadgeClass(days: number): string {
  if (days < 0) return "bg-red-800 text-red-100";
  if (days <= 7) return "bg-red-700 text-red-100";
  if (days <= 14) return "bg-amber-600 text-amber-100";
  return "bg-blue-700 text-blue-100";
}

const STATUS_BADGE: Record<string, string> = {
  locked: "bg-gray-100 text-gray-500",
  in_progress: "bg-blue-100 text-blue-800",
  complete: "bg-green-100 text-green-800",
  blocked: "bg-red-100 text-red-800",
};

const STATUS_LABEL: Record<string, string> = {
  locked: "Locked",
  in_progress: "In Progress",
  complete: "Complete",
  blocked: "Blocked",
};

const PHASE_NAMES_TEMPLATE = (taxYear: number) => [
  `Audit ${taxYear - 1} WinTeam Setup`,
  `Fix Issues and Roll Forward to ${taxYear}`,
  `${taxYear} Data Catch-Up`,
  "Generate, Verify, and File",
];

export default function FilingClient({
  userId,
  initialPhases,
  initialProgress,
  tablesReady,
  blockingIssues,
  warningIssues,
  infoIssues,
  defaultTaxYear,
  extensionFiled,
}: Props) {
  const tFiling = useTranslations("filing");
  const tCommon = useTranslations("common");
  const locale = useLocale() as 'en' | 'es';
  const [taxYear, setTaxYear] = useState(defaultTaxYear);
  const [phases, setPhases] = useState<FilingPhaseRow[]>(initialPhases ?? []);
  const [progress, setProgress] = useState<FilingProgressRow[]>(initialProgress ?? []);
  const [loadingYear, setLoadingYear] = useState(false);
  const { showToast } = useToast();
  const supabase = createClient();

  const deadline = getFilingDeadline(taxYear, extensionFiled);
  const daysRemaining = getDaysRemaining(deadline);

  const deadlineLabel = deadline.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const seedPhases = useCallback(async (year: number) => {
    const phaseNames = PHASE_NAMES_TEMPLATE(year);
    const rows = [
      { tax_year: year, phase_number: 1, phase_name: phaseNames[0], status: "in_progress" },
      { tax_year: year, phase_number: 2, phase_name: phaseNames[1], status: "locked" },
      { tax_year: year, phase_number: 3, phase_name: phaseNames[2], status: "locked" },
      { tax_year: year, phase_number: 4, phase_name: phaseNames[3], status: "locked" },
    ];
    await supabase
      .from("filing_phases")
      .upsert(rows, { onConflict: "tax_year,phase_number", ignoreDuplicates: true });
  }, [supabase]);

  const loadYear = useCallback(async (year: number) => {
    setLoadingYear(true);
    try {
      // Load phases for this year
      const { data: phasesData } = await supabase
        .from("filing_phases")
        .select("*")
        .eq("tax_year", year)
        .order("phase_number");

      if (!phasesData || phasesData.length === 0) {
        // Auto-seed phases for this year
        await seedPhases(year);
        const { data: seeded } = await supabase
          .from("filing_phases")
          .select("*")
          .eq("tax_year", year)
          .order("phase_number");
        setPhases(seeded ?? []);
      } else {
        setPhases(phasesData);
      }

      // Load progress for this year
      const { data: progressData } = await supabase
        .from("filing_checklist_progress")
        .select("*")
        .eq("tax_year", year);
      setProgress(progressData ?? []);
    } catch {
      showToast("Failed to load data for selected year.", "error");
    } finally {
      setLoadingYear(false);
    }
  }, [supabase, seedPhases, showToast]);

  // Auto-seed phases for default year if missing
  useEffect(() => {
    if (tablesReady && initialPhases?.length === 0) {
      seedPhases(defaultTaxYear).then(() => loadYear(defaultTaxYear));
    }
  }, [tablesReady, initialPhases, defaultTaxYear, seedPhases, loadYear]);

  async function handleYearChange(year: number) {
    setTaxYear(year);
    await loadYear(year);
  }

  const checklist = getFilingChecklist(taxYear, locale);

  // Calculate per-phase stats
  const completedKeys = new Set(
    progress.filter((p) => p.is_complete && p.tax_year === taxYear).map((p) => p.item_key)
  );

  const phaseStats = ([1, 2, 3, 4] as const).map((phaseNum) => {
    const items = checklist.filter((i) => i.phase === phaseNum);
    const gateItems = items.filter((i) => i.isGate);
    const doneCount = items.filter((i) => completedKeys.has(i.key)).length;
    const gateDone = gateItems.filter((i) => completedKeys.has(i.key)).length;
    const gateRemaining = gateItems.length - gateDone;
    return { total: items.length, done: doneCount, gateRemaining };
  });

  // Suggested schedule: based on today's date and the filing deadline
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalDays = getDaysRemaining(deadline);
  const suggestedSchedule = [
    { phase: 1, targetDays: 2 },
    { phase: 2, targetDays: 4 },
    { phase: 3, targetDays: 18 },
    { phase: 4, targetDays: 21 },
  ].map(({ phase, targetDays }) => {
    const d = new Date(today);
    d.setDate(d.getDate() + Math.min(targetDays, Math.max(0, totalDays - (4 - phase) * 3)));
    return {
      phase,
      date: d.toLocaleDateString("en-US", { month: "long", day: "numeric" }),
    };
  });

  if (!tablesReady) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{tFiling("title")}</h1>
        <div className="card border-blue-200 bg-blue-50">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-blue-800">Database setup required</p>
              <p className="text-blue-700 text-sm mt-1">
                The Filing Assistant tables have not been created yet. Please run{" "}
                <code className="bg-blue-100 px-1 rounded font-mono text-xs">supabase/filing_assistant.sql</code>{" "}
                in the Supabase SQL editor, then refresh this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with year selector */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tFiling("title")}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {tFiling("subtitle", { taxYear })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="tax-year-select" className="text-gray-600 font-medium whitespace-nowrap">
            {tCommon("taxYear")}:
          </label>
          <select
            id="tax-year-select"
            value={taxYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            disabled={loadingYear}
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 disabled:opacity-50"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Deadline Banner */}
      <div className={`rounded-lg px-5 py-3 flex items-center justify-between ${deadlineBannerClass(daysRemaining)}`}>
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-semibold">
            {daysRemaining < 0
              ? tFiling("deadlinePassed")
              : tFiling("deadlineBanner", { taxYear, days: daysRemaining })}
          </span>
        </div>
        {daysRemaining >= 0 && (
          <span className={`font-bold text-sm px-3 py-1 rounded-full ${deadlineBadgeClass(daysRemaining)}`}>
            {daysRemaining === 0 ? "Due today!" : tCommon("daysRemaining", { days: daysRemaining })}
          </span>
        )}
      </div>

      {/* Blocking issues alert */}
      {blockingIssues > 0 && (
        <div className="card border-red-300 bg-red-50 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-red-800 font-semibold">
                {tFiling("blockingIssuesAlert", { count: blockingIssues })}
              </span>
            </div>
            <Link href="/filing/issues" className="text-red-700 hover:text-red-900 font-medium text-sm underline">
              {tFiling("viewIssues")}
            </Link>
          </div>
        </div>
      )}

      {/* Phase Progress Cards */}
      {loadingYear ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {([1, 2, 3, 4] as const).map((phaseNum) => {
            const phase = phases.find((p) => p.phase_number === phaseNum);
            const stats = phaseStats[phaseNum - 1];
            const status = phase?.status ?? "locked";
            const phaseName = phase?.phase_name ?? PHASE_NAMES_TEMPLATE(taxYear)[phaseNum - 1];
            const isLocked = status === "locked";
            const isComplete = status === "complete";
            const isActive = status === "in_progress";
            const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

            return (
              <div
                key={phaseNum}
                className={`card relative overflow-hidden transition-all ${
                  isLocked ? "opacity-60" : "hover:shadow-md"
                }`}
              >
                {/* Phase number badge */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                      isComplete
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-blue-600 text-white"
                        : isLocked
                        ? "bg-gray-200 text-gray-400"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isComplete ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      phaseNum
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[status]}`}>
                    {status === "locked" ? tFiling("phaseLocked") : status === "in_progress" ? tFiling("phaseInProgress") : status === "complete" ? tFiling("phaseComplete") : tFiling("phaseBlocked")}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                  {phaseName}
                </h3>

                <p className="text-xs text-gray-500 mb-3">
                  {tFiling("estimatedTime", { time: PHASE_METADATA[phaseNum].estimatedTime })}
                </p>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{tFiling("itemsComplete", { complete: stats.done, total: stats.total })}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        isComplete ? "bg-green-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {isActive && stats.gateRemaining > 0 && (
                  <p className="text-xs text-amber-700 mb-3">
                    🔒 {tFiling("gateItemsRemaining", { count: stats.gateRemaining })}
                  </p>
                )}

                {/* CTA */}
                {isActive && (
                  <Link
                    href={`/filing/phase/${phaseNum}`}
                    className="block w-full text-center btn-primary text-sm py-1.5"
                  >
                    {tFiling("continuePhase")}
                  </Link>
                )}
                {isComplete && (
                  <Link
                    href={`/filing/phase/${phaseNum}`}
                    className="block w-full text-center btn-secondary text-sm py-1.5"
                  >
                    {tFiling("phaseComplete")} ✓
                  </Link>
                )}
                {isLocked && (
                  <div className="w-full text-center text-xs text-gray-400 py-1.5">
                    {tFiling("gateLocked")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Suggested Schedule */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">{tFiling("suggestedSchedule")}</h2>
          <p className="text-xs text-gray-500 mb-3">
            Based on today&apos;s date and the {deadlineLabel} deadline.
          </p>
          <div className="space-y-2">
            {suggestedSchedule.map(({ phase, date }) => {
              const status = phases.find((p) => p.phase_number === phase)?.status ?? "locked";
              return (
                <div key={phase} className="flex items-center justify-between text-sm">
                  <span className={status === "complete" ? "text-gray-400 line-through" : "text-gray-700"}>
                    Phase {phase} — complete by
                  </span>
                  <span className={`font-medium ${status === "complete" ? "text-green-600" : "text-gray-900"}`}>
                    {status === "complete" ? `✓ ${tFiling("phaseComplete")}` : date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Open Issues Summary */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">{tFiling("openIssues")}</h2>
            <Link href="/filing/issues" className="text-navy-600 hover:text-navy-800 text-sm font-medium">
              View all →
            </Link>
          </div>
          {blockingIssues === 0 && warningIssues === 0 && infoIssues === 0 ? (
            <p className="text-sm text-green-700 bg-green-50 rounded-md px-3 py-2">
              No open issues — looking good!
            </p>
          ) : (
            <div className="space-y-2">
              {blockingIssues > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    {tFiling("blocking")}
                  </span>
                  <span className="font-semibold text-red-700">{blockingIssues}</span>
                </div>
              )}
              {warningIssues > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full" />
                    {tFiling("warnings")}
                  </span>
                  <span className="font-semibold text-amber-700">{warningIssues}</span>
                </div>
              )}
              {infoIssues > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    {tFiling("informational")}
                  </span>
                  <span className="font-semibold text-blue-700">{infoIssues}</span>
                </div>
              )}
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <Link href="/filing/issues" className="btn-secondary text-sm w-full text-center block">
              {tCommon("logAnIssue")}
            </Link>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/filing/employees" className="btn-secondary text-sm">
            Employee Readiness →
          </Link>
          <Link href="/filing/issues" className="btn-secondary text-sm">
            Issues Log →
          </Link>
          <Link href="/tracker" className="btn-secondary text-sm">
            Employee Tracker →
          </Link>
          <Link href="/checklist" className="btn-secondary text-sm">
            Audit Checklist →
          </Link>
        </div>
      </div>
    </div>
  );
}
