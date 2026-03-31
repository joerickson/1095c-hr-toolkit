import type { Line14Code } from "@/lib/types";

export const line14Codes: Line14Code[] = [
  {
    code: "1A",
    name: "Qualifying Offer",
    description:
      "Qualifying Offer: Minimum essential coverage providing minimum value offered to full-time employee with employee contribution for self-only coverage equal to or less than 9.5% (as adjusted) of the mainland single federal poverty line divided by 12.",
    tip: "Use 1A only if you made a qualifying offer for ALL 12 months to a full-time employee. The employee contribution must be ≤ 9.5% of the FPL for single coverage.",
  },
  {
    code: "1B",
    name: "Employee Only — MEC + Minimum Value",
    description:
      "Minimum essential coverage providing minimum value offered to employee only.",
    tip: "Employee was offered MEC with minimum value but no dependent or spouse coverage was offered. Most common for single-only plans.",
  },
  {
    code: "1C",
    name: "Employee + Dependents (not spouse)",
    description:
      "Minimum essential coverage providing minimum value offered to employee and at least minimum essential coverage offered to dependent(s) (not spouse).",
    tip: "Dependents offered MEC but spouse was NOT offered any coverage. Unusual — verify your plan documents before using.",
  },
  {
    code: "1D",
    name: "Employee + Spouse (not dependents)",
    description:
      "Minimum essential coverage providing minimum value offered to employee and at least minimum essential coverage offered to spouse (not dependent(s)).",
    tip: "Spouse offered MEC but dependents were NOT offered any coverage. Verify plan documents.",
  },
  {
    code: "1E",
    name: "Employee + Dependents + Spouse",
    description:
      "Minimum essential coverage providing minimum value offered to employee and at least minimum essential coverage offered to dependent(s) and spouse.",
    tip: "Most common code for employers offering family coverage. Employee, spouse, AND dependents all offered MEC+MV.",
  },
  {
    code: "1F",
    name: "MEC Offered — NOT Minimum Value",
    description:
      "Minimum essential coverage NOT providing minimum value offered to employee, or employee and spouse or dependents or both.",
    tip: "Coverage was offered but does NOT meet minimum value (plan must pay at least 60% of covered costs). Use for skinny/limited benefit plans.",
  },
  {
    code: "1G",
    name: "Non-FT Employee / Self-Insured Enrollment",
    description:
      "Offer of coverage for at least one month of the year to an employee who was not a full-time employee for any month of the calendar year and who enrolled in self-insured coverage for one or more months.",
    tip: "Only use on Form 1095-C when the employee was NOT full-time for any month AND was enrolled in self-insured coverage. Typically used for part-time or variable-hour employees enrolled in a self-insured plan.",
  },
  {
    code: "1H",
    name: "No Offer of Coverage",
    description:
      "No offer of coverage (employee not offered any health coverage or offered coverage that is not minimum essential coverage).",
    tip: "Employee was either not offered any health coverage, or what was offered doesn't qualify as MEC. Very common for part-time, variable-hour, or terminated employees.",
  },
  {
    code: "1I",
    name: "Qualifying Offer Transition Relief (Retired)",
    description:
      "Reserved — was used for Qualifying Offer Transition Relief in 2015. No longer applicable for current tax years.",
    tip: "This code is no longer in use. If you see it in historical records, it was a 2015 transition relief code.",
    retired: true,
  },
];
