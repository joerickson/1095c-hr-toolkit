// ACA Look-Back Measurement Method calculations
// Semi-monthly pay periods: 24 per year (1st and 15th of each month)

export const ACA_CONFIG = {
  hoursPerWeekThreshold: 30,
  hoursPerMonthThreshold: 130,
  hoursPerSemiMonthlyPeriod: 65,   // 30 × 52 ÷ 24
  payPeriodsPerYear: 24,
  warningThresholdHrsPerWeek: 25,  // start alerting at 25 hrs/week avg
  standardMeasurementMonths: 12,
  adminPeriodDays: 60,
  maxWaitingPeriodDays: 90,
  maxInitialMeasurementMonths: 12,
};

// Static checklist items for every pay period
export const PAY_PERIOD_CHECKLIST = [
  {
    key: "pp_hours_entered",
    label: "Enter or import hours for all variable-hour and part-time employees for this pay period",
    detail:
      "All hours count for ACA: regular, overtime, PTO, sick, holiday, and FMLA. Use the Hours Entry screen or import a CSV.",
    category: "hours",
  },
  {
    key: "pp_new_hires_added",
    label: "Add any new hires to the Employee Tracker and start their initial measurement period",
    detail:
      "Variable-hour and part-time new hires must have a measurement period started from day 1. Full-time new hires go straight to the 90-day waiting period.",
    category: "new_hires",
  },
  {
    key: "pp_threshold_review",
    label: "Review the hours threshold alerts — any employee averaging 25+ hrs/week needs attention",
    detail:
      "Employees approaching 30 hrs/week need to be watched. Employees who have crossed it need an offer letter prepared.",
    category: "monitoring",
  },
  {
    key: "pp_admin_period_check",
    label: "Check the Admin Period tracker — any employees in the Nov–Dec admin window need offer letters sent",
    detail:
      "Employees completing their measurement period must receive a benefit offer during the admin period. Coverage must start January 1.",
    category: "offers",
  },
  {
    key: "pp_offer_responses",
    label: "Follow up on any pending offer letters — record acceptances, declines, and waivers",
    detail:
      "Employees who declined must sign a waiver. No-response employees should be treated as declined for tracking purposes.",
    category: "offers",
  },
  {
    key: "pp_terminations",
    label: "Update employment status for any terminations this pay period",
    detail:
      "Terminated employees stop accumulating hours. Update their record so the measurement calculation is correct.",
    category: "terminations",
  },
  {
    key: "pp_winteam_sync",
    label: "Confirm any benefit elections from this period are entered in WinTeam INS: Benefits by Employee",
    detail:
      "WinTeam is the system of record. Every acceptance or change must be reflected there for the 1095-C to generate correctly.",
    category: "winteam",
  },
  {
    key: "pp_dependent_updates",
    label: "Collect and enter SSNs and DOBs for any newly enrolled dependents on self-insured plans (Plan 1 and Plan 2)",
    detail:
      "Spouse SSN is required. Minor dependent DOB is acceptable. Adult dependent SSN is required. This data populates Part III of the 1095-C.",
    category: "dependents",
  },
] as const;

export type PayPeriodChecklistKey = (typeof PAY_PERIOD_CHECKLIST)[number]["key"];

/**
 * Calculate average weekly hours from semi-monthly pay period records.
 * Converts total hours over N semi-monthly periods to a weekly average.
 */
export function calcAvgWeeklyHours(
  hoursRecords: { hours_worked: number }[],
  periodsCount: number
): number {
  if (periodsCount === 0) return 0;
  const total = hoursRecords.reduce((sum, r) => sum + r.hours_worked, 0);
  // (total / periodsCount) = avg hours per semi-monthly period
  // × (24 / 52) converts to weekly average
  return (total / periodsCount) * (24 / 52);
}

/**
 * Calculate average monthly hours from semi-monthly pay period records.
 */
export function calcAvgMonthlyHours(
  hoursRecords: { hours_worked: number }[],
  periodsCount: number
): number {
  if (periodsCount === 0) return 0;
  const total = hoursRecords.reduce((sum, r) => sum + r.hours_worked, 0);
  // 2 semi-monthly periods per month
  return (total / periodsCount) * 2;
}

/**
 * Determine if an employee is full-time based on measurement period averages.
 */
export function determineFullTimeStatus(
  avgHoursPerWeek: number,
  avgHoursPerMonth: number
): { isFullTime: boolean; basis: string } {
  if (avgHoursPerWeek >= ACA_CONFIG.hoursPerWeekThreshold) {
    return {
      isFullTime: true,
      basis: `${avgHoursPerWeek.toFixed(1)} avg hrs/week ≥ 30`,
    };
  }
  if (avgHoursPerMonth >= ACA_CONFIG.hoursPerMonthThreshold) {
    return {
      isFullTime: true,
      basis: `${avgHoursPerMonth.toFixed(1)} avg hrs/month ≥ 130`,
    };
  }
  return {
    isFullTime: false,
    basis: `${avgHoursPerWeek.toFixed(1)} avg hrs/week < 30`,
  };
}

/**
 * Calculate coverage start date for a newly eligible employee.
 * - Standard measurement: always next January 1
 * - Initial measurement: 13 months + 1 day from hire date
 */
export function calcCoverageStartDate(
  periodType: "standard" | "initial",
  measurementEndDate: Date,
  hireDate?: Date
): Date {
  if (periodType === "standard") {
    const year = measurementEndDate.getFullYear();
    return new Date(year + 1, 0, 1); // January 1 of next year
  }
  if (!hireDate) throw new Error("Hire date required for initial measurement");
  const thirteenMonths = new Date(hireDate);
  thirteenMonths.setMonth(thirteenMonths.getMonth() + 13);
  thirteenMonths.setDate(thirteenMonths.getDate() + 1);
  return thirteenMonths;
}

/**
 * Calculate the 90-day waiting period completion date.
 */
export function calcWaitingPeriodEnd(eligibilityDate: Date): Date {
  const end = new Date(eligibilityDate);
  end.setDate(end.getDate() + ACA_CONFIG.maxWaitingPeriodDays);
  return end;
}

/**
 * Get the semi-monthly pay period dates for a given date.
 * Periods: 1st–14th and 15th–last day of month.
 */
export function getPayPeriodDates(date: Date): { start: Date; end: Date } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  if (day <= 14) {
    return {
      start: new Date(year, month, 1),
      end: new Date(year, month, 14),
    };
  } else {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return {
      start: new Date(year, month, 15),
      end: new Date(year, month, lastDay),
    };
  }
}

/**
 * Generate all 24 pay period start dates for a given year.
 */
export function getPayPeriodsByYear(year: number): Date[] {
  const periods: Date[] = [];
  for (let month = 0; month < 12; month++) {
    periods.push(new Date(year, month, 1));
    periods.push(new Date(year, month, 15));
  }
  return periods;
}

/**
 * Format pay period dates for display (e.g. "March 1–14, 2026").
 */
export function formatPayPeriod(start: Date, end: Date): string {
  const monthName = start.toLocaleString("en-US", { month: "long" });
  const year = start.getFullYear();
  return `${monthName} ${start.getDate()}–${end.getDate()}, ${year}`;
}

/**
 * Get the pay period number within the year (1–24).
 */
export function getPayPeriodNumber(date: Date): number {
  const month = date.getMonth(); // 0-indexed
  const day = date.getDate();
  return month * 2 + (day <= 14 ? 1 : 2);
}

/**
 * Determine the hours status color for avg hrs/week.
 */
export function getHoursStatusColor(avgHrsPerWeek: number | null): "green" | "amber" | "red" | "gray" {
  if (avgHrsPerWeek === null) return "gray";
  if (avgHrsPerWeek >= ACA_CONFIG.hoursPerWeekThreshold) return "red";
  if (avgHrsPerWeek >= ACA_CONFIG.warningThresholdHrsPerWeek) return "amber";
  return "green";
}

/**
 * Project whether employee will cross full-time threshold.
 * Returns true if already crossed or currently at threshold.
 */
export function projectFullTimeDate(
  currentAvgHrsPerWeek: number,
  measurementEndDate: Date
): { willCross: boolean; projectedDate: Date | null } {
  if (currentAvgHrsPerWeek >= ACA_CONFIG.hoursPerWeekThreshold) {
    return { willCross: true, projectedDate: new Date() };
  }
  return { willCross: false, projectedDate: null };
}

/**
 * Calculate the standard measurement period dates for a given year.
 * Standard: November 1 → October 31 of next year
 * Admin: November 1 → December 31
 * Stability: January 1 → December 31
 */
export function getStandardMeasurementPeriod(measurementYear: number): {
  measurementStart: Date;
  measurementEnd: Date;
  adminStart: Date;
  adminEnd: Date;
  stabilityStart: Date;
  stabilityEnd: Date;
} {
  return {
    measurementStart: new Date(measurementYear, 10, 1),         // Nov 1
    measurementEnd: new Date(measurementYear + 1, 9, 31),       // Oct 31 next year
    adminStart: new Date(measurementYear + 1, 10, 1),           // Nov 1 next year
    adminEnd: new Date(measurementYear + 1, 11, 31),            // Dec 31 next year
    stabilityStart: new Date(measurementYear + 2, 0, 1),        // Jan 1 following year
    stabilityEnd: new Date(measurementYear + 2, 11, 31),        // Dec 31 following year
  };
}

/**
 * Calculate the initial measurement period dates for a new hire.
 * Starts on the first of the month following hire date, runs 12 months.
 */
export function getInitialMeasurementPeriod(hireDate: Date): {
  measurementStart: Date;
  measurementEnd: Date;
  coverageDeadline: Date;
} {
  // First day of month following hire
  const start = new Date(hireDate.getFullYear(), hireDate.getMonth() + 1, 1);
  // 12 months later
  const end = new Date(start.getFullYear(), start.getMonth() + 12, 0); // last day of 12th month
  // Coverage must start no later than 13 months + 1 day from hire date
  const deadline = new Date(hireDate);
  deadline.setMonth(deadline.getMonth() + 13);
  deadline.setDate(deadline.getDate() + 1);
  return { measurementStart: start, measurementEnd: end, coverageDeadline: deadline };
}

/**
 * Parse CSV content for hours import.
 * Expected columns: employee_last_name, employee_first_name, pay_period_start,
 *                   hours_regular, hours_pto, hours_other
 */
export function parseHoursCSV(csvText: string): {
  rows: Array<{
    last_name: string;
    first_name: string;
    pay_period_start: string;
    hours_regular: number;
    hours_pto: number;
    hours_other: number;
    total_hours: number;
  }>;
  errors: string[];
} {
  const lines = csvText.trim().split("\n").map((l) => l.trim());
  const errors: string[] = [];
  const rows: ReturnType<typeof parseHoursCSV>["rows"] = [];

  if (lines.length < 2) {
    return { rows: [], errors: ["CSV must have a header row and at least one data row."] };
  }

  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const required = ["employee_last_name", "employee_first_name", "pay_period_start"];
  for (const col of required) {
    if (!header.includes(col)) {
      errors.push(`Missing required column: ${col}`);
    }
  }
  if (errors.length > 0) return { rows: [], errors };

  const idx = {
    last_name: header.indexOf("employee_last_name"),
    first_name: header.indexOf("employee_first_name"),
    pay_period_start: header.indexOf("pay_period_start"),
    hours_regular: header.indexOf("hours_regular"),
    hours_pto: header.indexOf("hours_pto"),
    hours_other: header.indexOf("hours_other"),
  };

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const cols = lines[i].split(",").map((c) => c.trim());

    const last_name = cols[idx.last_name] ?? "";
    const first_name = cols[idx.first_name] ?? "";
    const pay_period_start = cols[idx.pay_period_start] ?? "";

    if (!last_name || !first_name || !pay_period_start) {
      errors.push(`Row ${i + 1}: missing required fields`);
      continue;
    }

    // Validate pay_period_start is 1st or 15th
    const dateMatch = pay_period_start.match(/^\d{4}-(\d{2})-(\d{2})$/);
    if (!dateMatch) {
      errors.push(`Row ${i + 1}: invalid date format "${pay_period_start}" (expected YYYY-MM-DD)`);
      continue;
    }
    const day = parseInt(dateMatch[2], 10);
    if (day !== 1 && day !== 15) {
      errors.push(`Row ${i + 1}: pay_period_start must be the 1st or 15th of the month`);
      continue;
    }

    const hours_regular = idx.hours_regular >= 0 ? parseFloat(cols[idx.hours_regular] ?? "0") || 0 : 0;
    const hours_pto = idx.hours_pto >= 0 ? parseFloat(cols[idx.hours_pto] ?? "0") || 0 : 0;
    const hours_other = idx.hours_other >= 0 ? parseFloat(cols[idx.hours_other] ?? "0") || 0 : 0;

    rows.push({
      last_name,
      first_name,
      pay_period_start,
      hours_regular,
      hours_pto,
      hours_other,
      total_hours: hours_regular + hours_pto + hours_other,
    });
  }

  return { rows, errors };
}
