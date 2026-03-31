import type { Line16Code } from "@/lib/types";

export const line16Codes: Line16Code[] = [
  {
    code: "2A",
    name: "Not Employed",
    description: "Employee not employed during the month.",
    tip: "Use 2A for months where the employee was not employed at all — before hire date or after termination date. Do not use for employees on leave.",
  },
  {
    code: "2B",
    name: "Not Full-Time Employee",
    description:
      "Employee not a full-time employee for the month and not enrolled in minimum essential coverage.",
    tip: "Use 2B when the employee was employed but not full-time (averaged less than 30 hours/week for the month) AND was not enrolled in coverage. Common for part-time and variable-hour employees.",
  },
  {
    code: "2C",
    name: "Employee Enrolled in Offered Coverage",
    description: "Employee enrolled in the coverage that was offered.",
    tip: "Use 2C when the employee was actually enrolled in health coverage offered by the employer. 2C generally takes priority over other safe harbor codes for the same month.",
  },
  {
    code: "2D",
    name: "Limited Non-Assessment Period",
    description:
      "Employee in a Limited Non-Assessment Period (initial measurement period, waiting period, or first year as a new variable-hour employee).",
    tip: "Use 2D during the waiting/measurement period for new hires. Also applies to the first year an ALE uses the look-back measurement method for variable-hour employees.",
  },
  {
    code: "2E",
    name: "Multiemployer Interim Rule Relief",
    description:
      "Multiemployer interim guidance applies for the month.",
    tip: "Use 2E if the employer is required by a collective bargaining agreement to contribute to a multiemployer plan for the employee. This code indicates the employer is relying on the multiemployer interim rule relief.",
  },
  {
    code: "2F",
    name: "W-2 Safe Harbor",
    description:
      "Employer used the W-2 safe harbor to determine affordability for the employee.",
    tip: "Affordability is met if the employee's required contribution for self-only coverage is ≤ 9.5% (adjusted) of their W-2 Box 1 wages. Most common affordability safe harbor for fixed-salary employees.",
  },
  {
    code: "2G",
    name: "Federal Poverty Line Safe Harbor",
    description:
      "Employer used the Federal Poverty Line safe harbor to determine affordability for the employee.",
    tip: "Coverage is affordable if the employee contribution for self-only coverage is ≤ 9.5% (adjusted) of the annual mainland single FPL divided by 12. Easiest to calculate but usually results in a lower premium threshold.",
  },
  {
    code: "2H",
    name: "Rate of Pay Safe Harbor",
    description:
      "Employer used the Rate of Pay safe harbor to determine affordability for the employee.",
    tip: "For hourly employees: multiply 130 hrs × hourly rate × 9.5% (adjusted). For salaried: monthly salary × 9.5% (adjusted). Cannot use for employees whose hourly rate decreased during the year.",
  },
  {
    code: "2I",
    name: "Non-Calendar Year Transition Relief (Retired)",
    description:
      "Reserved — was used for Non-Calendar Year Transition Relief. No longer applicable for current tax years.",
    tip: "This code is no longer in active use. Applicable only for employers with non-calendar year plans during the 2014–2015 transition period.",
  },
];
