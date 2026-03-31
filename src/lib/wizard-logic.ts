import { AppSettings, WizardAnswers, WizardResult } from "./types";

export function calculateCodes(
  answers: WizardAnswers,
  settings: AppSettings
): WizardResult {
  const warnings: string[] = [];

  // Not employed or no offer
  if (!answers.fullTime && answers.offered === "no") {
    return {
      line14: "1H",
      line14Description: "No offer of coverage made",
      line15: settings.mec_monthly_premium,
      line16: "2A",
      line16Description: "Employee not employed / not full-time this month",
      part3Required: false,
      warnings: [],
    };
  }

  // Waiting period
  if (answers.offered === "waiting_period") {
    return {
      line14: "1H",
      line14Description:
        "No offer — employee in waiting/Limited Non-Assessment Period",
      line15: settings.mec_monthly_premium,
      line16: "2D",
      line16Description:
        "Employee in Limited Non-Assessment Period (waiting period)",
      part3Required: false,
      warnings: [],
    };
  }

  // Active offer — determine Line 14 based on who coverage is offered to
  // NOTE: For RBM Services Inc., all three plans are offered to EVERY eligible employee,
  // so "who" should always be "all" → 1E. Other options exist for completeness.
  const who = answers.who;
  let line14 = "1E";
  let line14Description = "MEC + Minimum Value offered to ";

  if (who === "employee_only") {
    line14 = "1B";
    line14Description += "employee only";
  } else if (who === "employee_dependents") {
    line14 = "1C";
    line14Description += "employee + dependents";
  } else if (who === "employee_spouse") {
    line14 = "1D";
    line14Description += "employee + spouse";
  } else {
    line14 = "1E";
    line14Description += "employee, spouse & dependents";
  }

  // Line 16
  let line16 = "";
  let line16Description = "";

  if (answers.enrolled === "yes") {
    line16 = "2C";
    line16Description = "Employee enrolled in coverage offered";
  } else {
    const sh = settings.safe_harbor_method;
    if (sh === "w2") {
      line16 = "2F";
      line16Description = "W-2 Safe Harbor — coverage was affordable";
    } else if (sh === "fpl") {
      line16 = "2G";
      line16Description = "Federal Poverty Line Safe Harbor";
    } else {
      line16 = "2H";
      line16Description = "Rate of Pay Safe Harbor";
    }
    warnings.push(
      "Employee declined coverage. Verify Line 15 amount passes the affordability test " +
        "under your selected safe harbor. If any employee received a marketplace subsidy, " +
        "you may face a Section 4980H(b) penalty for that employee."
    );
  }

  return {
    line14,
    line14Description,
    line15: settings.mec_monthly_premium,
    line16,
    line16Description,
    part3Required: false, // Part III is determined by plan enrollment, shown separately
    warnings,
  };
}

export function testAffordability(
  monthlyPremium: number,
  method: "rate_of_pay" | "w2" | "fpl",
  hourlyRate?: number,
  annualW2?: number,
  fplThreshold?: number
): { affordable: boolean; maxAffordable: number; detail: string } {
  const threshold = 0.0902; // 2025

  if (method === "fpl") {
    const max = fplThreshold ?? 105.29;
    return {
      affordable: monthlyPremium <= max,
      maxAffordable: max,
      detail: `FPL threshold for 2025: $${max.toFixed(2)}/month`,
    };
  }

  if (method === "rate_of_pay" && hourlyRate) {
    const max = hourlyRate * 130 * threshold;
    return {
      affordable: monthlyPremium <= max,
      maxAffordable: max,
      detail: `$${hourlyRate}/hr × 130 hrs × 9.02% = $${max.toFixed(2)}/month maximum`,
    };
  }

  if (method === "w2" && annualW2) {
    const max = (annualW2 / 12) * threshold;
    return {
      affordable: monthlyPremium <= max,
      maxAffordable: max,
      detail: `($${annualW2.toFixed(0)} ÷ 12) × 9.02% = $${max.toFixed(2)}/month maximum`,
    };
  }

  return { affordable: false, maxAffordable: 0, detail: "Insufficient data" };
}

export const LINE14_CODES: Record<string, string> = {
  "1A": "Qualifying Offer — MEC providing minimum value offered to full-time employee + spouse + dependents, employee share ≤ FPL",
  "1B": "MEC providing minimum value offered to employee only",
  "1C": "MEC providing minimum value offered to employee + dependents (not spouse)",
  "1D": "MEC providing minimum value offered to employee + spouse (not dependents)",
  "1E": "MEC providing minimum value offered to employee + spouse + dependents",
  "1F": "MEC NOT providing minimum value offered to employee (and any combination)",
  "1G": "Offer to employee who was not full-time for any month — self-insured coverage",
  "1H": "No offer of coverage (or not employed that month / waiting period)",
  "1I": "Reserved — do not use",
};

export const LINE16_CODES: Record<string, string> = {
  "2A": "Employee not employed this month",
  "2B": "Employee not full-time this month",
  "2C": "Employee enrolled in the coverage offered",
  "2D": "Employee in a Limited Non-Assessment Period (waiting period)",
  "2E": "Multiemployer interim rule relief",
  "2F": "W-2 Safe Harbor — coverage affordable under W-2 wages",
  "2G": "Federal Poverty Line Safe Harbor — coverage affordable under FPL",
  "2H": "Rate of Pay Safe Harbor — coverage affordable under rate of pay",
  "2I": "Non-calendar year transition relief",
};
