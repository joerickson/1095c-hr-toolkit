import type { Walkthrough } from './filing-checklist-items'

export const WALKTHROUGHS: Record<string, Walkthrough> = {

  // ============================================================
  // PHASE 1 — Audit Prior Year WinTeam Setup
  // ============================================================

  audit_sys_aca_enabled: {
    overview: 'The first thing we need to check is whether WinTeam knows you are an ACA-reporting employer. There is a single checkbox in the Company Setup screen that turns on all ACA features. If it was off, WinTeam would have been ignoring your ACA obligations entirely.',
    why_it_matters: 'If this checkbox is not checked, WinTeam will not generate any 1095-C forms at all, regardless of any other settings.',
    steps: [
      { step: 1, instruction: 'Open WinTeam and log in as an administrator.' },
      { step: 2, instruction: 'Click SYS in the top navigation menu.', detail: 'SYS stands for System — it contains company-wide settings.' },
      { step: 3, instruction: 'Click Company Setup from the dropdown menu that appears.' },
      { step: 4, instruction: 'Look for a section called Insurance Benefits or ACA.', detail: 'The exact label depends on your WinTeam version.' },
      { step: 5, instruction: 'Find the checkbox labeled Affordable Care Act Configuration or Enable ACA Reporting.' },
      { step: 6, instruction: 'Confirm the checkbox is checked (has a checkmark in it). If it is not checked, click it to check it now.' },
      { step: 7, instruction: 'Click Save at the bottom of the screen.' },
      { step: 8, instruction: 'Come back here and mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If you cannot find a Company Setup option under SYS, you may not have administrator access. Ask your WinTeam administrator to complete this step.',
      'If you see the option but cannot check the box, your WinTeam license may not include the ACA module. Contact TEAM Software support.',
      'If the checkbox was already checked, that is great — just confirm and move on.',
    ],
    estimated_minutes: 5,
  },

  audit_sys_ein: {
    overview: 'Your Employer Identification Number (EIN) is a 9-digit number assigned to your company by the IRS — similar to a Social Security Number but for a business. It prints on every 1095-C form and on the 1094-C transmittal you send to the IRS. It must match your IRS records exactly or your filing will be flagged.',
    why_it_matters: 'A wrong EIN will cause your entire filing to be rejected by the IRS, and you may not discover this until after the deadline.',
    steps: [
      { step: 1, instruction: 'Stay in SYS > Company Setup (the same screen from the previous step).' },
      { step: 2, instruction: 'Find the field labeled EIN or Employer Identification Number.' },
      { step: 3, instruction: 'Write down the number shown. It should be formatted as XX-XXXXXXX (two digits, a dash, then seven digits).' },
      { step: 4, instruction: 'Compare it to the EIN on your most recent Form 941 (your quarterly payroll tax return) or your W-2s.', detail: 'Form 941 and W-2s are guaranteed to match your IRS records.' },
      { step: 5, instruction: 'If the EIN in WinTeam matches — great. Mark this item complete.' },
      { step: 6, instruction: 'If the EIN does not match, correct it in WinTeam and click Save before moving on. Note what you changed in the Finding field below.' },
    ],
    if_something_looks_wrong: [
      'Not sure where to find your EIN? Check any letter from the IRS, your most recent Form 941, or ask your accountant or payroll provider.',
      'If the EIN field is grayed out and you cannot edit it, you need administrator access in WinTeam. Contact your WinTeam admin.',
    ],
    estimated_minutes: 5,
  },

  audit_sys_phone: {
    overview: 'The IRS requires a valid contact phone number on your ACA filing. This is the number the IRS will use if they need to contact you about your 1094-C or 1095-C submission. It should be a direct number for someone in HR or payroll who can answer questions about your filing.',
    why_it_matters: 'If the phone number is wrong or disconnected, the IRS cannot reach you if there is a problem with your filing, which can delay resolution and lead to penalties.',
    steps: [
      { step: 1, instruction: 'Stay in SYS > Company Setup > ACA Configuration (the same screen from the previous step).' },
      { step: 2, instruction: 'Find the field labeled Contact Phone or ACA Contact Phone.' },
      { step: 3, instruction: 'Confirm the number is a current, working phone number for your HR department.' },
      { step: 4, instruction: 'If the number is outdated or incorrect, type the correct number in the field.' },
      { step: 5, instruction: 'Click Save.' },
      { step: 6, instruction: 'Mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'Use a direct line or extension for HR, not a general company switchboard, so the IRS can reach the right person.',
      'If the field is blank, enter the best HR contact number before proceeding.',
    ],
    estimated_minutes: 5,
  },

  audit_ins_aca_compliant: {
    overview: 'WinTeam has a setting on each eligibility rule called ACA Compliant Eligibility. This checkbox tells WinTeam to use ACA rules when determining whether an employee qualifies for benefits — specifically, tracking hours and applying the 30-hour-per-week full-time threshold. Without this checkbox checked on every eligibility rule your company uses, WinTeam will not correctly identify who needs to be offered coverage.',
    why_it_matters: 'If ACA Compliant Eligibility is not checked on your eligibility rules, WinTeam will not calculate who qualifies for benefits under ACA law, and your 1095-C forms will be incorrect.',
    steps: [
      { step: 1, instruction: 'In WinTeam, click INS in the top navigation menu.', detail: 'INS stands for Insurance Benefits.' },
      { step: 2, instruction: 'Click Eligibility Setup from the dropdown.' },
      { step: 3, instruction: 'You will see a list of eligibility rules. Your company may have one or several. Open the first one.' },
      { step: 4, instruction: 'Look for a checkbox labeled ACA Compliant Eligibility.' },
      { step: 5, instruction: 'Confirm the checkbox is checked. If it is not, check it now.' },
      { step: 6, instruction: 'Click Save.' },
      { step: 7, instruction: 'Go back to the list and repeat steps 3 through 6 for each eligibility rule in the list.' },
      { step: 8, instruction: 'Once all rules have been checked, mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If you are not sure which eligibility rules your company uses, check with your WinTeam administrator.',
      'If you cannot see or edit the ACA Compliant Eligibility checkbox, you may need administrator access to INS: Eligibility Setup.',
      'If you only see one eligibility rule, that is fine — just make sure it is checked and save.',
    ],
    estimated_minutes: 10,
  },

  audit_ins_plan_start_month: {
    overview: 'The Plan Start Month tells WinTeam what month your benefit plan year begins. For most employers, the plan year runs January through December, so this should be set to 01 (January). This setting affects how WinTeam calculates ACA codes for each of the 12 months on the 1095-C form. If it is set to the wrong month, all of your monthly calculations will be off.',
    why_it_matters: 'If the Plan Start Month is set to the wrong month, WinTeam will apply the wrong coverage codes to every month of the year for every employee.',
    steps: [
      { step: 1, instruction: 'Stay in INS > Eligibility Setup (the same screen from the previous step).' },
      { step: 2, instruction: 'Look for a field labeled Plan Start Month or Plan Year Start Month.' },
      { step: 3, instruction: 'Confirm the value is 01 (meaning January).' },
      { step: 4, instruction: 'If it shows a different number, correct it to 01 and click Save.', warning: 'Changing the Plan Start Month after data has been entered can affect calculations. If you are unsure whether to change it, note the current value in the Finding field below and check with your WinTeam consultant first.' },
      { step: 5, instruction: 'Mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If the field shows a number other than 01, your plan year may not be January–December. Confirm with your benefits broker what month your plan year starts before changing this.',
      'If the field does not exist in your version of WinTeam, note that in the Finding field and continue.',
    ],
    estimated_minutes: 5,
  },

  audit_plan1_aca: {
    overview: 'Each benefit plan in WinTeam has an ACA checkbox on its Pricing Tab. This checkbox designates the plan as one that should be reported on the 1095-C form. Plan 1 is your Minimum Essential Coverage plan (MEC), and it must have this box checked so WinTeam knows to include it when generating ACA forms.',
    why_it_matters: 'If the ACA checkbox is not checked for Plan 1, WinTeam will not include this plan in any 1095-C calculations or forms.',
    steps: [
      { step: 1, instruction: 'In WinTeam, click INS in the top navigation menu.' },
      { step: 2, instruction: 'Click Benefit Setup from the dropdown.' },
      { step: 3, instruction: 'Find your Plan 1 MEC plan in the list and click on it to open it.', detail: 'Your MEC plan may be listed by a name your company chose, not the word MEC. Look for the plan you offer as your lowest-cost option.' },
      { step: 4, instruction: 'Click the Pricing tab at the top of the benefit setup screen.' },
      { step: 5, instruction: 'Look for a checkbox labeled ACA.' },
      { step: 6, instruction: 'Confirm the box is checked. If it is not, click it to check it now.' },
      { step: 7, instruction: 'Click Save.' },
      { step: 8, instruction: 'Mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If you cannot find a Pricing tab, you may be looking at the wrong screen. Make sure you clicked on the plan name to open its detail record.',
      'If you cannot check the box, you may need administrator access to INS: Benefit Setup.',
    ],
    estimated_minutes: 5,
  },

  audit_plan1_self_insured: {
    overview: 'Your Plan 1 (MEC plan) is self-insured, meaning your company pays claims directly rather than paying premiums to an insurance company. Because of this, the IRS requires you to list every covered person on the 1095-C form in a section called Part III. WinTeam will only generate Part III if this checkbox is checked. Without it, your MEC plan enrollees will be missing required coverage information on their forms.',
    why_it_matters: 'If Self Insured is not checked for Plan 1, WinTeam will not generate Part III for MEC enrollees, which is a filing error the IRS can penalize.',
    steps: [
      { step: 1, instruction: 'In WinTeam, click INS in the top navigation menu.', detail: 'INS stands for Insurance Benefits.' },
      { step: 2, instruction: 'Click Benefit Setup from the dropdown.' },
      { step: 3, instruction: 'Find your Plan 1 MEC plan in the list and click on it to open it.', detail: 'Your MEC plan may be listed by a name your company chose, not the word MEC. Look for the plan you offer as your lowest-cost option.' },
      { step: 4, instruction: 'Click the Pricing tab at the top of the benefit setup screen.' },
      { step: 5, instruction: 'Look for a checkbox labeled Self Insured.' },
      { step: 6, instruction: 'Confirm the box is checked. If it is not checked, click it now to check it.', warning: 'Do not check the Self Insured box on Plan 3 (Select Health). Select Health is a fully insured plan — checking Self Insured there would be wrong.' },
      { step: 7, instruction: 'Click Save.' },
      { step: 8, instruction: 'Return here and mark this item complete. In the Finding field, note whether the box was already checked or whether you had to check it.' },
    ],
    if_something_looks_wrong: [
      'If you are not sure which plan is your MEC plan, look for the plan with the lowest employee cost. MEC plans are typically your cheapest offering.',
      'If you do not see a Self Insured checkbox on the Pricing tab, you may be on the wrong tab or looking at the wrong plan. Make sure you clicked the Pricing tab, not the General tab.',
      'If you cannot save changes, you may need administrator access to INS: Benefit Setup.',
    ],
    estimated_minutes: 10,
  },

  audit_plan1_min_value: {
    overview: 'This step sounds confusing but is very important. Your Plan 1 is called a Minimum Essential Coverage plan (MEC), but MEC and Minimum Value are two completely different things. Minimum Value means the plan pays at least 60% of covered healthcare costs. Your MEC plan was designed as a low-cost plan that meets the basic coverage requirement but intentionally does not meet the Minimum Value threshold. The Minimum Value checkbox in WinTeam must be UNCHECKED for Plan 1 so that WinTeam generates the correct IRS code on Line 14 of the 1095-C.',
    why_it_matters: 'If Minimum Value is incorrectly checked on Plan 1, WinTeam will generate the wrong code on Line 14 for MEC enrollees, which could cause confusion in future years or if your plan offering changes.',
    steps: [
      { step: 1, instruction: 'Stay in INS > Benefit Setup with Plan 1 open on the Pricing tab.' },
      { step: 2, instruction: 'Look for a checkbox labeled Minimum Value.' },
      { step: 3, instruction: 'Confirm this box is NOT checked (empty, no checkmark).', warning: 'This is one of the few steps where the correct answer is that the box should be EMPTY. Do not check it.' },
      { step: 4, instruction: 'If the box is checked, uncheck it by clicking it.' },
      { step: 5, instruction: 'Click Save.' },
      { step: 6, instruction: 'Note your finding below — was it already unchecked, or did you have to fix it?' },
    ],
    if_something_looks_wrong: [
      'If you are unsure whether your MEC plan truly does not meet Minimum Value, ask your benefits broker or insurance consultant. They designed the plan and will know.',
      'This setting only applies to Plan 1. Plans 2 and 3 SHOULD have Minimum Value checked — you will verify those in the next sections.',
    ],
    estimated_minutes: 5,
  },

  audit_plan1_premium: {
    overview: 'Line 15 on the 1095-C form shows the lowest-cost employee-only premium for the minimum value plan you offer. For your company, this is the Plan 1 MEC monthly premium that an employee pays. This number must be entered correctly in WinTeam on Plan 1\'s Pricing Tab so that it populates Line 15 accurately on every employee\'s form.',
    why_it_matters: 'If Line 15 shows the wrong amount or is blank, the IRS cannot verify that your plan was affordable for employees, which can trigger penalties.',
    steps: [
      { step: 1, instruction: 'Stay in INS > Benefit Setup with Plan 1 open on the Pricing tab.' },
      { step: 2, instruction: 'Find the field for the employee-only monthly premium.', detail: 'It may be labeled Employee Premium, Employee-Only Cost, or similar.' },
      { step: 3, instruction: 'Write down the dollar amount shown.' },
      { step: 4, instruction: 'Compare it to your actual Plan 1 premium for the year you are auditing. This amount should be on your summary plan documents or your benefits broker\'s records.' },
      { step: 5, instruction: 'If the amount matches — great. Mark this item complete.' },
      { step: 6, instruction: 'If the amount is wrong or blank, enter the correct amount and click Save. Note the change in the Finding field below.' },
    ],
    if_something_looks_wrong: [
      'Not sure what the Plan 1 premium should be? Check with your benefits broker or pull up the summary plan description for the year you are auditing.',
      'If the premium changed mid-year, enter the premium that was in effect for most of the year, or ask your WinTeam consultant how to handle mid-year rate changes.',
    ],
    estimated_minutes: 5,
  },

  audit_plan1_options: {
    overview: 'Plan Options are the different coverage tiers your plan offers — for example, Employee-only, Employee plus Spouse, Employee plus Dependents, and Employee plus Family. WinTeam uses the Plan Options to determine whether all three coverage tiers (Employee, Spouse, Dependents) were available under your plan. This affects the IRS code on Line 14. For code 1E (the correct code), all three tiers must be present.',
    why_it_matters: 'If any of the three coverage tiers are missing from Plan 1\'s Plan Options, WinTeam may generate a different Line 14 code instead of 1E, which misrepresents the coverage you offered.',
    steps: [
      { step: 1, instruction: 'Stay in INS > Benefit Setup with Plan 1 open.' },
      { step: 2, instruction: 'Click the Plan Options tab at the top of the screen.' },
      { step: 3, instruction: 'Look at the list of coverage tiers.', screenshot_hint: 'You should see at least three rows: one for Employee-only coverage, one for Employee + Spouse, and one for Employee + Dependents (or Employee + Family).' },
      { step: 4, instruction: 'Confirm all three tiers are present: Employee-only, Employee + Spouse, and Employee + Dependents.' },
      { step: 5, instruction: 'If any tier is missing, click Add (or the plus icon) to add the missing tier.' },
      { step: 6, instruction: 'Click Save and mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If you only see one or two tiers, contact your WinTeam consultant before adding tiers — adding them retroactively requires care.',
      'The exact names of the tiers may vary (e.g., "EE + SP" instead of "Employee + Spouse") — that is fine as long as the tiers exist.',
    ],
    estimated_minutes: 10,
  },

  audit_plan2_aca: {
    overview: 'Plan 2 is your self-insured major medical plan. Like Plan 1, it must have the ACA checkbox checked on its Pricing Tab so WinTeam knows to include it in ACA reporting. Both Plan 1 and Plan 2 are self-insured, so both must be flagged as ACA plans.',
    why_it_matters: 'If the ACA checkbox is not checked for Plan 2, WinTeam will not include Plan 2 enrollment in 1095-C calculations.',
    steps: [
      { step: 1, instruction: 'In INS > Benefit Setup, find your Plan 2 (Self-Insured major medical plan) in the list and click on it.' },
      { step: 2, instruction: 'Click the Pricing tab.' },
      { step: 3, instruction: 'Find the ACA checkbox and confirm it is checked.' },
      { step: 4, instruction: 'If it is not checked, check it and click Save.' },
      { step: 5, instruction: 'Mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If you are not sure which plan is Plan 2, look for the self-insured major medical plan — it is typically the mid-tier plan in your offering.',
      'If you cannot find a Plan 2 at all, check with your HR team — you may have fewer benefit plans than expected.',
    ],
    estimated_minutes: 5,
  },

  audit_plan2_self_insured: {
    overview: 'Plan 2 is a self-insured major medical plan, meaning your company directly pays for claims rather than using an outside insurance carrier. Just like Plan 1, WinTeam must know Plan 2 is self-insured so it generates Part III (the Covered Individuals section) on the 1095-C for Plan 2 enrollees. Part III must list every person covered under the plan, including dependents.',
    why_it_matters: 'If Self Insured is not checked for Plan 2, WinTeam will not generate Part III for Plan 2 enrollees, which is required for self-insured plans and will cause IRS errors.',
    steps: [
      { step: 1, instruction: 'Stay in INS > Benefit Setup with Plan 2 open on the Pricing tab.' },
      { step: 2, instruction: 'Find the checkbox labeled Self Insured.' },
      { step: 3, instruction: 'Confirm the box is checked. If it is not, check it now.' },
      { step: 4, instruction: 'Click Save.' },
      { step: 5, instruction: 'Mark this item complete and note your finding.' },
    ],
    if_something_looks_wrong: [
      'If you are not sure whether Plan 2 is truly self-insured, ask your benefits broker. Self-insured means your company pays claims directly — you do not pay premiums to an outside insurance company for this plan.',
      'Unlike Plan 1 and Plan 2, Plan 3 (Select Health) is fully insured — Self Insured should NOT be checked on Plan 3.',
    ],
    estimated_minutes: 5,
  },

  audit_plan2_min_value: {
    overview: 'Plan 2 is your full major medical plan, which pays at least 60% of covered healthcare costs. This means Plan 2 meets the IRS definition of Minimum Value. The Minimum Value checkbox on Plan 2 must be checked so WinTeam generates the correct Line 14 code for employees enrolled in Plan 2. This is the opposite of Plan 1, where Minimum Value must be unchecked.',
    why_it_matters: 'If Minimum Value is not checked for Plan 2, WinTeam will generate an incorrect Line 14 code for Plan 2 enrollees, misrepresenting the level of coverage you provided.',
    steps: [
      { step: 1, instruction: 'Stay in INS > Benefit Setup with Plan 2 open on the Pricing tab.' },
      { step: 2, instruction: 'Find the checkbox labeled Minimum Value.' },
      { step: 3, instruction: 'Confirm this box IS checked (has a checkmark).', warning: 'Unlike Plan 1, where Minimum Value must be UNCHECKED, Plan 2 requires Minimum Value to be CHECKED.' },
      { step: 4, instruction: 'If the box is not checked, click it to check it.' },
      { step: 5, instruction: 'Click Save and mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If you are unsure whether Plan 2 meets Minimum Value, ask your benefits broker. Any comprehensive major medical plan almost certainly does.',
      'Minimum Value must be checked on Plan 2 AND Plan 3, but NOT on Plan 1.',
    ],
    estimated_minutes: 5,
  },

  audit_plan2_options: {
    overview: 'Just like Plan 1, Plan 2 needs all three coverage tiers in its Plan Options — Employee-only, Employee plus Spouse, and Employee plus Dependents. WinTeam uses this to determine the correct Line 14 code. If all three tiers are present across all three plans in the benefit package, WinTeam can generate code 1E, which shows the employee was offered minimum value coverage for themselves, their spouse, and their dependents.',
    why_it_matters: 'If any coverage tier is missing from Plan 2, WinTeam may generate the wrong Line 14 code for Plan 2 enrollees.',
    steps: [
      { step: 1, instruction: 'Stay in INS > Benefit Setup with Plan 2 open.' },
      { step: 2, instruction: 'Click the Plan Options tab.' },
      { step: 3, instruction: 'Confirm that Employee-only, Employee + Spouse, and Employee + Dependents (or Family) tiers all appear in the list.' },
      { step: 4, instruction: 'If any tier is missing, add it or contact your WinTeam consultant.' },
      { step: 5, instruction: 'Click Save and mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If you are unsure what tiers should be listed, compare to what you see on Plan 1 — they should have the same tier structure.',
    ],
    estimated_minutes: 10,
  },

  audit_plan3_aca: {
    overview: 'Plan 3 is your Select Health fully insured plan. Even though Plan 3 is a fully insured plan (meaning an outside insurance carrier pays claims), it still needs the ACA checkbox checked in WinTeam so that Plan 3 enrollment is included in ACA Line 14 and Line 16 calculations.',
    why_it_matters: 'If ACA is not checked for Plan 3, WinTeam will not track Plan 3 enrollment for 1095-C purposes, leading to incorrect codes for Plan 3 employees.',
    steps: [
      { step: 1, instruction: 'In INS > Benefit Setup, find your Plan 3 (Select Health) in the list and click on it.' },
      { step: 2, instruction: 'Click the Pricing tab.' },
      { step: 3, instruction: 'Find the ACA checkbox and confirm it is checked.' },
      { step: 4, instruction: 'If it is not checked, check it and click Save.' },
      { step: 5, instruction: 'Mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'Select Health is the name of the insurance carrier for Plan 3. If you do not see a plan with that name, look for your third plan option — the fully insured major medical plan.',
    ],
    estimated_minutes: 5,
  },

  audit_plan3_self_insured: {
    overview: 'Unlike Plan 1 and Plan 2, Plan 3 (Select Health) is a fully insured plan — meaning an insurance carrier covers the claims, not your company. Because of this, the IRS does NOT require you to list covered dependents in Part III for Plan 3 enrollees. The Self Insured checkbox in WinTeam must be UNCHECKED for Plan 3. If it were checked by mistake, WinTeam would try to generate Part III for Plan 3 employees, which is both incorrect and unnecessary.',
    why_it_matters: 'If Self Insured is incorrectly checked on Plan 3, WinTeam will generate Part III for Plan 3 enrollees when it should not, creating errors in your filing.',
    steps: [
      { step: 1, instruction: 'Stay in INS > Benefit Setup with Plan 3 (Select Health) open on the Pricing tab.' },
      { step: 2, instruction: 'Find the checkbox labeled Self Insured.' },
      { step: 3, instruction: 'Confirm this box is NOT checked (empty, no checkmark).', warning: 'Plan 3 is fully insured. Self Insured must be empty for Plan 3.' },
      { step: 4, instruction: 'If the box is checked, uncheck it by clicking it.' },
      { step: 5, instruction: 'Click Save and mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If you are not sure whether Select Health is fully insured or self-insured, ask your benefits broker. If your company pays premiums to Select Health and they pay the claims, it is fully insured.',
    ],
    estimated_minutes: 5,
  },

  audit_plan3_min_value: {
    overview: 'Plan 3 (Select Health) is a comprehensive major medical plan that pays at least 60% of covered healthcare costs. This means it meets the IRS Minimum Value threshold. The Minimum Value checkbox in WinTeam must be checked for Plan 3 so that the correct Line 14 code is generated for Plan 3 enrollees.',
    why_it_matters: 'If Minimum Value is not checked for Plan 3, WinTeam will generate the wrong Line 14 code for Plan 3 enrollees, misrepresenting the coverage level you provided.',
    steps: [
      { step: 1, instruction: 'Stay in INS > Benefit Setup with Plan 3 open on the Pricing tab.' },
      { step: 2, instruction: 'Find the checkbox labeled Minimum Value.' },
      { step: 3, instruction: 'Confirm this box IS checked.', warning: 'Both Plan 2 and Plan 3 must have Minimum Value checked. Only Plan 1 (MEC) should have it unchecked.' },
      { step: 4, instruction: 'If the box is not checked, click it to check it.' },
      { step: 5, instruction: 'Click Save and mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If you are unsure whether Plan 3 meets Minimum Value, ask your benefits broker or check the Summary of Benefits and Coverage document for the plan.',
    ],
    estimated_minutes: 5,
  },

  audit_plan3_options: {
    overview: 'Plan 3 also needs all three coverage tiers in its Plan Options — Employee-only, Employee plus Spouse, and Employee plus Dependents. Even though Part III will be blank for Plan 3 enrollees (because it is fully insured), the tiers still need to be present for WinTeam to generate the correct Line 14 code showing coverage was offered to the employee, their spouse, and their dependents.',
    why_it_matters: 'If coverage tiers are missing from Plan 3, WinTeam may generate the wrong Line 14 code for Plan 3 enrollees.',
    steps: [
      { step: 1, instruction: 'Stay in INS > Benefit Setup with Plan 3 open.' },
      { step: 2, instruction: 'Click the Plan Options tab.' },
      { step: 3, instruction: 'Confirm that Employee-only, Employee + Spouse, and Employee + Dependents (or Family) tiers all appear in the list.' },
      { step: 4, instruction: 'If any tier is missing, add it or contact your WinTeam consultant.' },
      { step: 5, instruction: 'Click Save and mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'The tiers should look the same as Plan 1 and Plan 2. If they do not, compare the three plans side by side.',
    ],
    estimated_minutes: 10,
  },

  audit_packages_all_three: {
    overview: 'This is the most important step in Phase 1 and the most common setup error for employers with multiple plans. In WinTeam, each employee is assigned a benefit package. The package is what tells WinTeam what coverage was OFFERED to that employee. Because your company offers all three plans to every eligible employee, every package must contain all three plans — even if the employee only enrolled in one. If a package only contains Plan 1 (MEC), WinTeam thinks you only offered that employee the MEC plan and generates the wrong code on Line 14.',
    why_it_matters: 'If packages only contain the plan the employee enrolled in rather than all three offered plans, every employee on Plan 1 will get the wrong Line 14 code on their 1095-C, which is a filing error that could trigger IRS penalties.',
    steps: [
      { step: 1, instruction: 'In WinTeam, click INS > Benefits by Employee.' },
      { step: 2, instruction: 'Pick any employee who is enrolled in Plan 1 (MEC) and open their record.' },
      { step: 3, instruction: 'Click the Package tab.' },
      { step: 4, instruction: 'Look at the benefit package assigned to this employee and click on the package name to open it.', detail: 'The package is a container that holds all the plans that were OFFERED to this employee, not just the one they chose.' },
      { step: 5, instruction: 'Inside the package, look for a list of plans included. You should see all three plans: Plan 1 (MEC), Plan 2 (Self-Insured), and Plan 3 (Select Health).', screenshot_hint: 'You should see three separate benefit lines in the package, one for each plan.' },
      { step: 6, instruction: 'If all three plans are listed — great. Check two or three more employees to confirm this is consistent.' },
      { step: 7, instruction: 'If only one or two plans are listed, the package needs to be updated to include all three. Add the missing plans to the package and save.', warning: 'If you need to add plans to existing packages, this change will affect all employees assigned to that package. Make sure you are editing the right package and consider logging this as an issue.' },
      { step: 8, instruction: 'Once you have confirmed at least 3–4 employee packages all contain all three plans, return here and mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If you are not sure how to add a plan to an existing package, contact TEAM Software support or your WinTeam consultant. This is a change that needs to be done carefully.',
      'If you find that packages vary — some have all three plans, some do not — log this as a Blocking issue and note which employee groups seem to be affected.',
      'If every employee has their own individual package rather than a shared package, you will need to check each one. This takes longer but the process is the same.',
    ],
    estimated_minutes: 20,
  },

  audit_preview_line14: {
    overview: 'Now that you have verified all the benefit setup, it is time to check what WinTeam actually produces. This step focuses on Line 14 of the 1095-C form. Line 14 is the most important line — it shows the IRS what type of coverage was offered to each employee. The correct code for all enrolled employees should be 1E, which means minimum value coverage was offered to the employee, their spouse, and their dependents.',
    why_it_matters: 'If Line 14 shows the wrong code — especially 1F instead of 1E — it means WinTeam thinks you only offered a MEC plan (not full minimum value coverage), which misrepresents what you actually offered employees.',
    steps: [
      { step: 1, instruction: 'In WinTeam, click INS > Employee 1095-C Report.' },
      { step: 2, instruction: 'In the Tax Year field, enter the prior year.', warning: 'Make sure you enter the prior year, not the current year. We are checking last year\'s setup first.' },
      { step: 3, instruction: 'In the Output Type field, select 1095-C Forms or Preview. Do NOT select Electronic File.' },
      { step: 4, instruction: 'Leave all employee filters set to All.' },
      { step: 5, instruction: 'Click Print or Preview to generate the forms.' },
      { step: 6, instruction: 'Find one employee from each group: enrolled in Plan 1, enrolled in Plan 2, enrolled in Plan 3, and one who declined coverage.' },
      { step: 7, instruction: 'On each form, look at Line 14. All four employees should show 1E.', screenshot_hint: 'Line 14 is near the top of Part II of the 1095-C form. Code 1E means minimum value coverage was offered to the employee, spouse, and dependents.' },
      { step: 8, instruction: 'If all four show 1E — great. Mark this item complete.' },
      { step: 9, instruction: 'If any show 1F or another code, note it in the Finding field and log a Blocking issue. The most common cause is that the benefit package is missing Plan 2 or Plan 3.' },
    ],
    if_something_looks_wrong: [
      'If Line 14 shows 1F, go back to the package verification step. The employee\'s package likely only contains Plan 1 and not all three plans.',
      'If Line 14 is blank, the employee may not have a benefit package assigned in WinTeam at all.',
      'If no forms are generated, go back and verify ACA Configuration is enabled in SYS: Company Setup.',
    ],
    estimated_minutes: 20,
  },

  audit_part3_populated: {
    overview: 'Part III of the 1095-C form is the "Covered Individuals" section. It lists the employee and every family member who was covered under a self-insured plan. Your company has two self-insured plans: Plan 1 (MEC) and Plan 2 (Self-Insured major medical). Part III should be filled in for all Plan 1 and Plan 2 enrollees. For Plan 3 (Select Health, which is fully insured), Part III should be completely blank.',
    why_it_matters: 'If Part III is blank for Plan 1 or Plan 2 enrollees, the IRS will not have the required covered individual information, and you may receive a penalty for incomplete forms.',
    steps: [
      { step: 1, instruction: 'Using the preview report from the previous step, find a form for an employee enrolled in Plan 1 (MEC).' },
      { step: 2, instruction: 'Scroll down to Part III on their form.', screenshot_hint: 'Part III is at the bottom of the 1095-C form. It has rows for the employee and up to 5 dependents, with columns for name, SSN or DOB, and checkboxes for each month covered.' },
      { step: 3, instruction: 'Confirm Part III is populated with the employee\'s information and any covered dependents.' },
      { step: 4, instruction: 'Find a form for an employee enrolled in Plan 2. Confirm Part III is also populated for them.' },
      { step: 5, instruction: 'Find a form for an employee enrolled in Plan 3 (Select Health). Confirm Part III is completely blank for them.' },
      { step: 6, instruction: 'If all checks pass, mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If Part III is blank for Plan 1 or Plan 2 employees, go back and verify the Self Insured checkbox is checked for those plans.',
      'If Part III has data for Plan 3 employees, go back and verify the Self Insured checkbox is NOT checked for Plan 3.',
      'If Part III is populated but the dependent names or months look wrong, that will be addressed in Phase 3 when you enter enrollment data.',
    ],
    estimated_minutes: 15,
  },

  audit_line15_consistent: {
    overview: 'Line 15 on the 1095-C form shows the employee-only monthly premium for the lowest-cost minimum value plan — which for your company is Plan 1 (MEC). This number is used by the IRS to check whether the coverage you offered was affordable. Every enrolled employee should show the exact same dollar amount on Line 15, because the Plan 1 premium is the same for everyone.',
    why_it_matters: 'If Line 15 shows different amounts on different employees\' forms, or is blank, the IRS cannot verify affordability and may challenge your filing.',
    steps: [
      { step: 1, instruction: 'Using the preview report, look at Line 15 on several different employee forms.' },
      { step: 2, instruction: 'Write down the Line 15 amounts you see. They should all be identical.' },
      { step: 3, instruction: 'Compare the amount to the Plan 1 employee-only monthly premium you verified in the Plan 1 setup steps.' },
      { step: 4, instruction: 'If every form shows the same correct amount — mark this item complete.' },
      { step: 5, instruction: 'If any forms show a different amount or a blank Line 15, note which employees are affected and log a Blocking issue.', warning: 'If Line 15 amounts vary, the most common cause is that different premium amounts were entered on different Plan 1 records. Return to INS > Benefit Setup > Plan 1 > Pricing Tab and verify the premium is set to one consistent amount.' },
    ],
    if_something_looks_wrong: [
      'If Line 15 is blank on some forms, the employee may not have a Plan 1 enrollment record in WinTeam.',
      'If Line 15 shows the wrong dollar amount, return to INS > Benefit Setup > Plan 1 > Pricing Tab and correct the employee-only premium.',
    ],
    estimated_minutes: 15,
  },

  // ============================================================
  // PHASE 2 — Fix Issues and Roll Forward
  // ============================================================

  rollforward_blocking_resolved: {
    overview: 'Before making any changes for the new year, you need to make sure every serious problem found in Phase 1 has been fully resolved. When you logged issues during Phase 1, any issue marked as "Blocking" means something is fundamentally wrong with your WinTeam setup that will cause incorrect 1095-C forms. This step asks you to go through each blocking issue one by one and confirm it is fixed.',
    why_it_matters: 'If any blocking issue from Phase 1 is not resolved, the problems will carry forward into the new year\'s forms and your filing will have errors.',
    steps: [
      { step: 1, instruction: 'Click the Filing Issues link at the top of the Filing Assistant page, or navigate to Filing > Issues.' },
      { step: 2, instruction: 'Filter the list to show only Blocking severity issues.' },
      { step: 3, instruction: 'For each blocking issue, read the title and description to understand what was wrong.' },
      { step: 4, instruction: 'Verify that the fix described in the issue\'s resolution notes has actually been applied in WinTeam.' },
      { step: 5, instruction: 'If the fix is confirmed, mark the issue as Resolved in the Filing Issues page and add a brief resolution note.' },
      { step: 6, instruction: 'Repeat for every blocking issue until all show a Resolved status.' },
      { step: 7, instruction: 'Return here and mark this item complete only after all blocking issues are resolved.' },
    ],
    if_something_looks_wrong: [
      'If you are not sure how to fix a blocking issue, look at the Fix Instructions on the issue record. If those are not enough, contact TEAM Software support or your WinTeam consultant.',
      'If there are no blocking issues logged from Phase 1, that is great — you can mark this item complete immediately.',
    ],
    estimated_minutes: 30,
  },

  rollforward_tax_year: {
    overview: 'Rolling forward means updating WinTeam from last year\'s settings to this year\'s settings so it generates forms for the correct tax year. The first thing to update is the tax year itself in WinTeam\'s ACA Configuration screen. This tells WinTeam that when you run reports and generate forms, you want data for the new year.',
    why_it_matters: 'If the tax year is not updated in WinTeam, you will generate forms for the wrong year, which means none of them will be correct for filing.',
    steps: [
      { step: 1, instruction: 'In WinTeam, click SYS in the top navigation menu.' },
      { step: 2, instruction: 'Click Company Setup from the dropdown.' },
      { step: 3, instruction: 'Find the ACA Configuration section.' },
      { step: 4, instruction: 'Find the field labeled Tax Year or ACA Tax Year.' },
      { step: 5, instruction: 'Update the year to the current filing year.', warning: 'Double-check this number before saving. Entering the wrong year affects everything downstream.' },
      { step: 6, instruction: 'Click Save.' },
      { step: 7, instruction: 'Mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If the Tax Year field is already showing the correct year, someone may have already updated it. Confirm it is correct and mark complete.',
      'If you cannot find the Tax Year field, check under ACA Configuration or contact your WinTeam administrator.',
    ],
    estimated_minutes: 5,
  },

  rollforward_affordability: {
    overview: 'Each year, the IRS updates the affordability percentage threshold used to determine whether the coverage you offered was affordable under ACA rules. For the current year, this threshold is 9.02% of an employee\'s wages. This app uses this percentage to calculate whether each employee\'s Plan 1 premium meets the affordability test. You need to update this number in the app\'s Settings page each year.',
    why_it_matters: 'If the affordability threshold is set to last year\'s percentage, all affordability calculations in this app will use the wrong number, which could misidentify which employees receive an unaffordable offer.',
    steps: [
      { step: 1, instruction: 'In this application, click Settings in the navigation menu.' },
      { step: 2, instruction: 'Find the field labeled Affordability Threshold or ACA Affordability Percentage.' },
      { step: 3, instruction: 'Update the value to 9.02 (representing 9.02%).' },
      { step: 4, instruction: 'Click Save.' },
      { step: 5, instruction: 'Mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'The affordability percentage changes slightly each year. The value listed in this checklist item is the correct percentage for the current filing year.',
      'If you are unsure what percentage to use, consult IRS guidance or ask your benefits broker for the current year\'s threshold.',
    ],
    estimated_minutes: 5,
  },

  rollforward_fpl: {
    overview: 'The Federal Poverty Level (FPL) is a number set by the government each year based on household income. One of the IRS-approved methods for testing whether your health coverage is affordable is the FPL safe harbor — this says coverage is affordable if the employee-only premium is less than a set percentage of the federal poverty line for a single person. The monthly FPL threshold for the current year is $105.29. You need to update this in the app\'s Settings page.',
    why_it_matters: 'If the FPL threshold is not updated, the app will use last year\'s figure for affordability calculations, which may produce incorrect results for employees being tested under the FPL safe harbor method.',
    steps: [
      { step: 1, instruction: 'In this application, click Settings in the navigation menu.' },
      { step: 2, instruction: 'Find the field labeled FPL Monthly Threshold or Federal Poverty Line Threshold.' },
      { step: 3, instruction: 'Update the value to 105.29 (representing $105.29 per month).' },
      { step: 4, instruction: 'Click Save.' },
      { step: 5, instruction: 'Mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'The FPL threshold changes each year based on the updated federal poverty guidelines. The value listed in this checklist item is the correct number for the current filing year.',
      'If your company does not use the FPL safe harbor method, this number is less critical — but it is still best practice to keep it current.',
    ],
    estimated_minutes: 5,
  },

  rollforward_plan1_premium: {
    overview: 'If your Plan 1 MEC premium changed from last year to this year, you need to update it in two places: in WinTeam\'s benefit setup, and in this application\'s Settings page. Both must show the correct employee-only monthly premium for the new plan year. This number will appear on Line 15 of every employee\'s 1095-C form, so it must be accurate.',
    why_it_matters: 'If the Plan 1 premium is not updated for the new year, every 1095-C form will show the wrong Line 15 amount, which the IRS uses to verify affordability.',
    steps: [
      { step: 1, instruction: 'Find out the correct Plan 1 employee-only monthly premium for the new filing year.', detail: 'Check with your benefits broker or your summary plan documents for the new year.' },
      { step: 2, instruction: 'In WinTeam, go to INS > Benefit Setup > Plan 1 > Pricing Tab.' },
      { step: 3, instruction: 'Update the employee-only premium field to the correct new year amount.' },
      { step: 4, instruction: 'Click Save in WinTeam.' },
      { step: 5, instruction: 'In this application, click Settings.' },
      { step: 6, instruction: 'Find the MEC Monthly Premium field and update it to match the same amount.' },
      { step: 7, instruction: 'Click Save in the app.' },
      { step: 8, instruction: 'Confirm both values match, then mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If the premium did not change from last year, you still need to verify both fields are correct and consistent.',
      'If the premium changed mid-year, use the premium that was in effect at the beginning of the plan year for Line 15 purposes. Ask your benefits broker if unsure.',
    ],
    estimated_minutes: 10,
  },

  rollforward_eligibility_wizard: {
    overview: 'WinTeam has a built-in tool called the Eligibility Testing Wizard that reviews every employee in your system and determines whether they qualify for benefits under your ACA rules. Think of it as WinTeam re-reading your eligibility rules and applying them to your current employee list for the new year. It looks at hours worked, employment dates, and your eligibility settings to determine who must be offered coverage. Running this wizard is a required step at the start of each plan year.',
    why_it_matters: 'If you do not run the Eligibility Testing Wizard, WinTeam will not have current eligibility data for the new year, and employees who should be offered coverage may be missed.',
    steps: [
      { step: 1, instruction: 'In WinTeam, click INS in the top navigation menu.' },
      { step: 2, instruction: 'Click Eligibility Testing Wizard from the dropdown.' },
      { step: 3, instruction: 'In the Tax Year field, enter the current filing year.' },
      { step: 4, instruction: 'Leave all other filters set to their defaults to run the wizard for all employees.' },
      { step: 5, instruction: 'Click Run or Process to start the wizard.', detail: 'This may take several minutes if you have many employees. Let it complete fully before clicking anything else.' },
      { step: 6, instruction: 'When the wizard finishes, review the results summary.', screenshot_hint: 'You should see a summary showing how many employees were processed, how many are eligible, and any warnings or exceptions.' },
      { step: 7, instruction: 'If there are unexpected results — such as employees being flagged as ineligible when you expect them to be eligible — review those records and investigate before proceeding.' },
      { step: 8, instruction: 'Mark this item complete once the wizard has run successfully.' },
    ],
    if_something_looks_wrong: [
      'If the wizard shows many employees as ineligible that you expect to be eligible, check that the ACA Compliant Eligibility checkbox is still checked in INS > Eligibility Setup.',
      'If the wizard produces errors or fails to run, contact TEAM Software support.',
      'If you are unsure whether the results look right, print the wizard output and review it with your HR team before advancing.',
    ],
    estimated_minutes: 30,
  },

  rollforward_benefit_packages: {
    overview: 'After running the Eligibility Wizard, you now know which employees are eligible for benefits in the new year. The next step is to make sure each eligible employee has a benefit package assigned in WinTeam for the new year. The benefit package is what tells WinTeam what plans were offered to that employee. Remember, the package must include all three plans — Plan 1, Plan 2, and Plan 3.',
    why_it_matters: 'If eligible employees do not have a benefit package assigned for the new year, WinTeam cannot generate Line 14 codes for them, which means their 1095-C forms will be incomplete or wrong.',
    steps: [
      { step: 1, instruction: 'Using the Eligibility Wizard results from the previous step, identify all employees who are eligible for benefits in the new year.' },
      { step: 2, instruction: 'For each eligible employee, go to INS > Benefits by Employee and open their record.' },
      { step: 3, instruction: 'Click the Package tab.' },
      { step: 4, instruction: 'Check whether a benefit package is assigned for the new year dates.', detail: 'The package should have an effective date at or before January 1 of the new year.' },
      { step: 5, instruction: 'If no package is assigned for the new year, assign the correct package that contains all three plans.' },
      { step: 6, instruction: 'Repeat for all eligible employees.', screenshot_hint: 'You should see the package listed with start and end dates that cover the full new plan year.' },
      { step: 7, instruction: 'Once all eligible employees have packages assigned, mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If you have many employees to update, you may be able to use a WinTeam mass assignment tool instead of updating one by one. Ask your WinTeam consultant about bulk package assignment.',
      'If any package only contains one or two plans (instead of all three), go back and update that package before assigning it to employees.',
    ],
    estimated_minutes: 60,
  },

  rollforward_stability_dates: {
    overview: 'For employees who work full-time year-round, their Stability Start Date should be set to January 1 of the new filing year. The Stability Period is the 12-month window during which an employee is treated as full-time based on their prior-year hours. If stability dates are wrong, WinTeam will not generate the correct offer-of-coverage codes for these employees.',
    why_it_matters: 'If Stability Start Dates are not updated, WinTeam may not correctly track which employees are in a stability period, leading to incorrect Line 16 codes on their 1095-C forms.',
    steps: [
      { step: 1, instruction: 'In WinTeam, go to INS > Benefits by Employee.' },
      { step: 2, instruction: 'Open a record for an employee who has been full-time for the entire prior year and is continuing into the new year.' },
      { step: 3, instruction: 'Click the Package tab and look for the Stability Start Date field.' },
      { step: 4, instruction: 'Confirm the Stability Start Date is set to January 1 of the new filing year.', detail: 'For year-round full-time employees, the stability period runs January 1 through December 31 of the filing year.' },
      { step: 5, instruction: 'If the date is wrong, update it to January 1 of the new year and click Save.' },
      { step: 6, instruction: 'Spot-check 3–5 other year-round full-time employees to confirm their dates are also correct.' },
      { step: 7, instruction: 'Mark this item complete once stability dates look correct across your year-round full-time employees.' },
    ],
    if_something_looks_wrong: [
      'Variable-hour employees who are newly eligible for the new year may have different stability dates — their stability period starts based on when they completed their measurement period, not necessarily January 1.',
      'If you are unsure what stability dates should be for certain employees, ask your WinTeam consultant or benefits broker.',
    ],
    estimated_minutes: 20,
  },

  // ============================================================
  // PHASE 3 — Data Catch-Up
  // ============================================================

  data_all_ft_employees: {
    overview: 'Before you can generate accurate 1095-C forms, every full-time employee who worked at any point during the filing year must be in WinTeam — including people who left the company during the year. The IRS requires a 1095-C for every employee who was full-time for at least one month. This step asks you to reconcile your WinTeam employee list against your payroll records to make sure no one is missing.',
    why_it_matters: 'If a full-time employee is missing from WinTeam, they will not receive a 1095-C form, which is an IRS reporting violation.',
    steps: [
      { step: 1, instruction: 'Pull a list of all employees from your payroll system who were paid as full-time employees at any point during the filing year. Include terminations.' },
      { step: 2, instruction: 'In this application, go to the Employee Tracker page and export or review the employee list.' },
      { step: 3, instruction: 'Compare the two lists. Look for names on the payroll list that are not in WinTeam.' },
      { step: 4, instruction: 'For any employee missing from WinTeam, add them now.', detail: 'Enter their basic information: name, SSN, date of birth, hire date, termination date (if applicable), and employment type.' },
      { step: 5, instruction: 'Once the lists match, mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If you find many missing employees, this could mean your payroll and WinTeam have not been synced. Work through the list methodically before advancing.',
      'Seasonal or part-time employees who never worked 30+ hours per week for a measurement period do NOT need a 1095-C form.',
    ],
    estimated_minutes: 60,
  },

  data_valid_ssn: {
    overview: 'Every employee who will receive a 1095-C form must have a valid Social Security Number (SSN) on file. The SSN is a 9-digit number used to identify the employee on the form — the IRS cannot match the form to the employee\'s tax return without it. Missing or incorrect SSNs are one of the most common causes of IRS filing errors.',
    why_it_matters: 'A missing or incorrect SSN will trigger an error on that employee\'s 1095-C form, and the IRS may treat it as an incomplete filing.',
    steps: [
      { step: 1, instruction: 'In this application, open the Employee Tracker.' },
      { step: 2, instruction: 'Look for the column or flag labeled Missing SSN or SSN on file.' },
      { step: 3, instruction: 'Make a list of every employee flagged for a missing SSN.' },
      { step: 4, instruction: 'For each employee, contact them directly to collect their SSN. You can use a secure HR intake form or have them fill out a W-9 or equivalent.', warning: 'Never ask for SSNs via email or text. Use a secure, private method such as a paper form or a secure HR portal.' },
      { step: 5, instruction: 'Enter the SSN for each employee in WinTeam under their employee record.' },
      { step: 6, instruction: 'Re-check the Employee Tracker to confirm the Missing SSN flag has cleared for all employees.' },
      { step: 7, instruction: 'Mark this item complete when all employees have SSNs on file.' },
    ],
    if_something_looks_wrong: [
      'If an employee refuses to provide their SSN, note the refusal in their record and continue — you must still file the form. The IRS allows filing with a note that the SSN was requested but not provided.',
      'If an SSN you received looks wrong (incorrect format, all zeros, etc.) do not enter it. Contact the employee again to confirm.',
    ],
    estimated_minutes: 60,
  },

  data_dob: {
    overview: 'Date of birth is required for all employees on self-insured plans (Plan 1 and Plan 2) because it is used in Part III of the 1095-C form. The IRS requires date of birth as a backup identifier when an SSN is not available for dependents, and as a primary check to confirm the employee matches the SSN on file. Missing dates of birth will generate warnings on the filed forms.',
    why_it_matters: 'Missing dates of birth on self-insured plan enrollees can trigger IRS error notices and may require you to file corrected 1095-C forms.',
    steps: [
      { step: 1, instruction: 'In this application, open the Employee Tracker.' },
      { step: 2, instruction: 'Look for employees flagged for a missing date of birth (DOB).' },
      { step: 3, instruction: 'Make a list of every employee on Plan 1 or Plan 2 who is missing their DOB.' },
      { step: 4, instruction: 'Collect missing dates of birth from HR records, employee files, or by asking the employees directly.' },
      { step: 5, instruction: 'Enter each DOB in WinTeam under the employee\'s personal information screen.' },
      { step: 6, instruction: 'Re-check the Employee Tracker to confirm all Plan 1 and Plan 2 enrollees now have a DOB on file.' },
      { step: 7, instruction: 'Mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'DOB is only strictly required for employees on self-insured plans (Plan 1 and Plan 2). Plan 3 employees and declined employees do not need a DOB for filing purposes, though it is good practice to have it.',
      'If you cannot locate a DOB, check the employee\'s original new-hire paperwork, I-9 form, or HR intake forms.',
    ],
    estimated_minutes: 30,
  },

  data_plan1_enrollments: {
    overview: 'For the 1095-C to be accurate, WinTeam needs to know which employees were actually enrolled in Plan 1 (MEC) during the filing year, and for which months they were covered. This step asks you to verify that every Plan 1 enrollment is entered in WinTeam with the correct start and end dates. If an employee enrolled in Plan 1 mid-year, their coverage start date must reflect that.',
    why_it_matters: 'If Plan 1 enrollment records are missing or have wrong dates, the monthly coverage codes on the 1095-C will be incorrect.',
    steps: [
      { step: 1, instruction: 'Pull your Plan 1 enrollment records from your HR or benefits system — a list of everyone who was enrolled in Plan 1 at any point during the filing year, with their start and end dates.' },
      { step: 2, instruction: 'For each employee on that list, go to INS > Benefits by Employee in WinTeam and open their record.' },
      { step: 3, instruction: 'Look at the Benefits tab and find their Plan 1 enrollment entry.' },
      { step: 4, instruction: 'Confirm the coverage start date and end date (or that it shows as active if still enrolled) match your records.' },
      { step: 5, instruction: 'If an employee is missing a Plan 1 enrollment entry, add it now with the correct dates.' },
      { step: 6, instruction: 'If the dates are wrong, correct them and click Save.' },
      { step: 7, instruction: 'Once all Plan 1 enrollees are verified, mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If an employee enrolled and then dropped Plan 1 during the year, they need a start date and an end date on their enrollment record.',
      'If someone enrolled mid-year, their 1095-C will show months covered only for the months after they enrolled — that is correct.',
    ],
    estimated_minutes: 60,
  },

  data_plan2_enrollments: {
    overview: 'Plan 2 is your self-insured major medical plan. In addition to entering enrollment dates, you must also complete the Covered Individuals tab for every Plan 2 enrollee. The Covered Individuals tab is where you list the employee and each family member who was covered under the plan. This information populates Part III of the 1095-C form. Without it, Part III will be blank, which is an error for self-insured plans.',
    why_it_matters: 'If the Covered Individuals tab is incomplete for Plan 2 enrollees, Part III of their 1095-C will be missing required information, which is a reportable error.',
    steps: [
      { step: 1, instruction: 'Pull your Plan 2 enrollment records — a list of everyone enrolled in Plan 2 during the filing year with their coverage dates and covered dependents.' },
      { step: 2, instruction: 'For each Plan 2 enrollee, go to INS > Benefits by Employee in WinTeam and open their record.' },
      { step: 3, instruction: 'Verify their Plan 2 enrollment entry shows the correct start and end dates.' },
      { step: 4, instruction: 'Click the Covered Individuals tab (sometimes called Covered Dependents).' },
      { step: 5, instruction: 'Confirm the employee themselves is listed with correct coverage months.', screenshot_hint: 'You should see the employee in the first row, with checkmarks or month indicators showing which months they were covered.' },
      { step: 6, instruction: 'Confirm each covered dependent (spouse, children) is also listed with their name, SSN or DOB, and covered months.' },
      { step: 7, instruction: 'Add any missing dependents or correct any wrong coverage months.' },
      { step: 8, instruction: 'Click Save after each employee record.' },
      { step: 9, instruction: 'Repeat for all Plan 2 enrollees, then mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If a dependent was added mid-year (e.g., new baby), their coverage months should start from the month they were added to the plan, not January.',
      'If you are not sure which months a dependent was covered, check your carrier records or the employee\'s benefit election form.',
    ],
    estimated_minutes: 120,
  },

  data_plan3_enrollments: {
    overview: 'Plan 3 (Select Health) is your fully insured major medical plan. Unlike Plan 1 and Plan 2, you do not need to enter dependent information for Plan 3 — the carrier handles that. However, you still need the Plan 3 enrollment entry in WinTeam with correct start and end dates so that WinTeam knows the employee was enrolled for Line 16 coding purposes.',
    why_it_matters: 'If Plan 3 enrollment records are missing or have wrong dates, WinTeam will not correctly code Line 16 for Plan 3 employees, which affects the safe harbor codes on their forms.',
    steps: [
      { step: 1, instruction: 'Pull your Plan 3 enrollment records from your HR or benefits system.' },
      { step: 2, instruction: 'For each Plan 3 enrollee, go to INS > Benefits by Employee in WinTeam.' },
      { step: 3, instruction: 'Verify their Plan 3 enrollment shows correct start and end dates.' },
      { step: 4, instruction: 'If an enrollment is missing, add it now.' },
      { step: 5, instruction: 'If dates are wrong, correct them and click Save.' },
      { step: 6, instruction: 'Mark this item complete once all Plan 3 enrollments are verified.' },
    ],
    if_something_looks_wrong: [
      'You do not need to enter dependent information for Plan 3 — that is only required for self-insured plans (Plan 1 and Plan 2).',
      'If an employee switched from Plan 3 to Plan 2 (or vice versa) mid-year, they will need enrollment entries for both plans with the correct overlapping dates.',
    ],
    estimated_minutes: 45,
  },

  data_declined_packages: {
    overview: 'Even employees who were offered coverage but chose not to enroll need a benefit package assigned in WinTeam. This is because the package is what tells WinTeam that you OFFERED coverage to the employee — the ACA requires you to report the offer, not just the enrollment. Without a package showing the offer was made, WinTeam cannot generate a Line 14 code for these employees at all.',
    why_it_matters: 'If employees who declined coverage do not have benefit packages in WinTeam, WinTeam cannot generate any Line 14 code for them, resulting in blank or incorrect 1095-C forms.',
    steps: [
      { step: 1, instruction: 'Pull a list of all employees who were offered coverage during the filing year but declined.' },
      { step: 2, instruction: 'For each employee, go to INS > Benefits by Employee in WinTeam.' },
      { step: 3, instruction: 'Click the Package tab.' },
      { step: 4, instruction: 'Check whether a benefit package is assigned that covers the period when coverage was offered.', detail: 'The package needs to be in place even if the employee declined. The package shows the offer — it does not mean they enrolled.' },
      { step: 5, instruction: 'If no package is assigned, assign the correct package (the one containing all three plans) with the correct effective dates.' },
      { step: 6, instruction: 'Click Save.' },
      { step: 7, instruction: 'Repeat for all employees who declined, then mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'A package being assigned does not mean the employee is enrolled. Enrollment records and package assignments are different things in WinTeam.',
      'If an employee was only offered coverage for part of the year (for example, they became eligible in April), the package should reflect the months when the offer was in effect.',
    ],
    estimated_minutes: 30,
  },

  data_spouse_ssn: {
    overview: 'For employees enrolled in Plan 1 or Plan 2 whose spouse was covered under the plan, the spouse\'s Social Security Number must be entered in WinTeam. This information goes into Part III of the 1095-C form. The IRS requires SSNs for all covered individuals on self-insured plans — if a spouse\'s SSN is missing, the IRS will flag the form for an error.',
    why_it_matters: 'A missing spouse SSN on a self-insured plan form will cause an IRS error notice and may require a corrected filing.',
    steps: [
      { step: 1, instruction: 'In the Employee Tracker or the Filing Employees page in this app, look for Plan 1 and Plan 2 enrollees whose spouse was covered but whose spouse SSN is missing.' },
      { step: 2, instruction: 'Make a list of those employees.' },
      { step: 3, instruction: 'Contact each employee and request their spouse\'s SSN.', warning: 'You may need to have the spouse complete a W-9 or equivalent form to authorize providing their SSN. Store these forms securely.' },
      { step: 4, instruction: 'Enter the spouse\'s SSN in WinTeam under INS > Benefits by Employee > Covered Individuals tab for each employee.' },
      { step: 5, instruction: 'Re-check the tracker to confirm spouse SSN flags have cleared.' },
      { step: 6, instruction: 'Mark this item complete when all covered spouses have SSNs on file.' },
    ],
    if_something_looks_wrong: [
      'If a spouse refuses to provide their SSN, document the refusal and continue. You must still include them in Part III — include their name and date of birth instead, and note that SSN was requested.',
      'Only spouses covered under Plan 1 or Plan 2 need SSNs entered. Spouses covered under Plan 3 (fully insured) do not need to be listed in WinTeam.',
    ],
    estimated_minutes: 60,
  },

  data_dependent_dob: {
    overview: 'For minor dependent children (under age 19) covered under Plan 1 or Plan 2, you need to enter their date of birth in WinTeam. The IRS accepts date of birth in lieu of SSN for minor dependents, but the DOB must be entered for the 1095-C Part III to be complete. The date of birth is what tells the IRS the dependent is a child, not an adult.',
    why_it_matters: 'Missing dates of birth for minor dependents on self-insured plans will cause Part III of the 1095-C to be incomplete, which can trigger IRS error notices.',
    steps: [
      { step: 1, instruction: 'Go to INS > Benefits by Employee in WinTeam and open the record for each Plan 1 or Plan 2 enrollee who has covered dependent children.' },
      { step: 2, instruction: 'Click the Covered Individuals tab.' },
      { step: 3, instruction: 'For each dependent child listed, look for the Date of Birth column.' },
      { step: 4, instruction: 'If a child\'s DOB is missing, enter it now.', detail: 'DOBs for minor children can typically be found in your HR onboarding records, the employee\'s benefits election form, or the carrier\'s enrollment records.' },
      { step: 5, instruction: 'Click Save.' },
      { step: 6, instruction: 'Repeat for all Plan 1 and Plan 2 enrollees with dependent children.' },
      { step: 7, instruction: 'Mark this item complete when all minor dependent DOBs are entered.' },
    ],
    if_something_looks_wrong: [
      'For children under age 19, you need EITHER an SSN OR a date of birth — but having both is preferred.',
      'Adult dependents (age 19 and older) need an SSN, not just a DOB. Those are handled in a separate checklist item.',
    ],
    estimated_minutes: 45,
  },

  data_adult_ssn: {
    overview: 'Adult dependents — meaning dependent children age 19 and older — who are covered under Plan 1 or Plan 2 must have their Social Security Number entered in WinTeam. Unlike minor children, adult dependents cannot use date of birth as a substitute for SSN. The IRS requires SSNs for all adult covered individuals on self-insured plans.',
    why_it_matters: 'Missing SSNs for adult dependents on self-insured plans will cause IRS errors on Part III of the 1095-C and may require a corrected filing.',
    steps: [
      { step: 1, instruction: 'Go to INS > Benefits by Employee for each Plan 1 or Plan 2 enrollee who has covered adult dependents (age 19+).' },
      { step: 2, instruction: 'Click the Covered Individuals tab.' },
      { step: 3, instruction: 'For each adult dependent, check whether their SSN is entered.' },
      { step: 4, instruction: 'If an adult dependent is missing their SSN, contact the employee and request the dependent\'s SSN.', warning: 'Handle dependent SSN collection carefully — have the dependent sign an authorization or W-9. Store all SSN documentation securely.' },
      { step: 5, instruction: 'Enter the SSN in WinTeam and click Save.' },
      { step: 6, instruction: 'Repeat for all Plan 1 and Plan 2 enrollees with adult dependents.' },
      { step: 7, instruction: 'Mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If an adult dependent is a full-time student under age 26, they still need an SSN entered.',
      'If you cannot obtain an SSN from a dependent, document the attempts and include the dependent\'s name and DOB on Part III with a note that SSN was requested but not provided.',
    ],
    estimated_minutes: 45,
  },

  data_coverage_months: {
    overview: 'The 1095-C reports coverage on a month-by-month basis. If an employee or dependent was added to or removed from coverage mid-year, the covered months in WinTeam must reflect exactly which months they were covered. For example, if an employee\'s spouse gave birth in June and was added to the plan in July, their coverage months should start at July — not January. This step asks you to review and correct these mid-year changes.',
    why_it_matters: 'Incorrect coverage months will cause wrong codes on the 1095-C for those months, which misrepresents the actual coverage provided and can trigger IRS audits.',
    steps: [
      { step: 1, instruction: 'Pull a list of any benefit changes that happened during the filing year: new enrollments, terminations, life events (new baby, marriage, divorce, etc.).' },
      { step: 2, instruction: 'For each change, go to INS > Benefits by Employee > Covered Individuals tab for the affected employee.' },
      { step: 3, instruction: 'Review the covered months shown for the employee and their dependents.' },
      { step: 4, instruction: 'Compare the coverage months in WinTeam to the actual dates from the benefit change records.' },
      { step: 5, instruction: 'If any months are wrong — for example, a dependent shows as covered all 12 months when they were only covered for 6 — correct the months now.' },
      { step: 6, instruction: 'Click Save after each correction.' },
      { step: 7, instruction: 'Mark this item complete when all mid-year change records are accurate.' },
    ],
    if_something_looks_wrong: [
      'If you are not sure which months a dependent was covered, check with your insurance carrier or your benefits enrollment system.',
      'COBRA participants who continued coverage after termination should show coverage only for the months they were actually on COBRA.',
    ],
    estimated_minutes: 60,
  },

  data_variable_hour: {
    overview: 'Variable-hour employees (also called variable-hour or seasonal employees) work unpredictable schedules and are tracked differently for ACA purposes. WinTeam uses measurement periods to track their hours and determine if they became full-time. If a variable-hour employee averaged 30 or more hours per week during their measurement period, they had to be offered coverage. This step asks you to confirm those employees were handled correctly.',
    why_it_matters: 'If a variable-hour employee who crossed the full-time threshold was not offered coverage — or if their offer was not recorded in WinTeam — you may face ACA penalty exposure.',
    steps: [
      { step: 1, instruction: 'In this application, go to the Eligibility Monitoring section and look for variable-hour employees whose measurement periods completed during the filing year.' },
      { step: 2, instruction: 'For each variable-hour employee who was determined to be full-time based on their measurement period results, verify they were offered coverage.' },
      { step: 3, instruction: 'In WinTeam, confirm a benefit package was assigned to them starting at the beginning of their stability period.' },
      { step: 4, instruction: 'Confirm their enrollment or declination is recorded.' },
      { step: 5, instruction: 'If any employee was determined full-time but was not offered coverage, log a Blocking issue and work with your HR team to resolve it.' },
      { step: 6, instruction: 'Mark this item complete once all variable-hour eligibility situations have been reviewed and documented.' },
    ],
    if_something_looks_wrong: [
      'If you are not sure which employees are variable-hour, look for employees classified as Variable or Seasonal in the Employee Tracker.',
      'If measurement periods were not tracked properly during the year, contact your WinTeam consultant to determine how to handle these employees retroactively.',
    ],
    estimated_minutes: 45,
  },

  data_terminations: {
    overview: 'Employees who left the company during the filing year still receive a 1095-C form for the months they were covered. WinTeam uses the termination date to determine when coverage ended. If termination dates are wrong — for example, showing December 31 when someone actually left in June — WinTeam will show coverage for months the employee was not actually covered.',
    why_it_matters: 'Wrong termination dates will cause incorrect coverage months on the 1095-C for terminated employees, which misrepresents your actual benefit offering.',
    steps: [
      { step: 1, instruction: 'In this application, review the Employee Tracker and look for employees with a termination status.' },
      { step: 2, instruction: 'For each terminated employee, note the termination date shown in WinTeam.' },
      { step: 3, instruction: 'Compare to your HR records (separation notices, final paycheck dates, or HRIS system) to confirm the termination date is accurate.' },
      { step: 4, instruction: 'If the termination date in WinTeam is wrong, open the employee record and correct it.' },
      { step: 5, instruction: 'Also confirm the employee\'s benefit coverage end date in INS > Benefits by Employee aligns with their termination date.' },
      { step: 6, instruction: 'Click Save for any changes.' },
      { step: 7, instruction: 'Mark this item complete when all termination dates look correct.' },
    ],
    if_something_looks_wrong: [
      'If an employee was on leave (FMLA, LOA) before terminating, the coverage end date may be different from the last day worked. Check your policy on continuing coverage during leaves.',
      'COBRA elections extend coverage past the termination date but are tracked separately — do not change the termination date just because an employee elected COBRA.',
    ],
    estimated_minutes: 30,
  },

  data_new_hires: {
    overview: 'Employees hired during the filing year who completed the 90-day waiting period and became eligible for benefits must have their coverage enrollment entered in WinTeam starting from the correct date. The 90-day waiting period means coverage cannot be delayed more than 90 days after the hire date. If someone was hired in February, their coverage should start no later than May.',
    why_it_matters: 'If new hire coverage is entered with the wrong start date, or is missing entirely, WinTeam will generate wrong codes for the months before the correct start date, which can misrepresent your offer-of-coverage.',
    steps: [
      { step: 1, instruction: 'Pull a list of all new hires from the filing year and their hire dates.' },
      { step: 2, instruction: 'Calculate when each new hire\'s 90-day waiting period ended (90 days after hire date).' },
      { step: 3, instruction: 'For each new hire, go to INS > Benefits by Employee in WinTeam and open their record.' },
      { step: 4, instruction: 'Check whether a benefit package is assigned with an effective date within 90 days of hire.' },
      { step: 5, instruction: 'Check whether their enrollment (or declination) is recorded starting from the correct date.' },
      { step: 6, instruction: 'If anything is missing or wrong, correct it and click Save.' },
      { step: 7, instruction: 'Mark this item complete when all new hires have correct coverage start dates.' },
    ],
    if_something_looks_wrong: [
      'If a new hire declined coverage, they still need a benefit package showing the offer was made within 90 days.',
      'If a new hire was classified as variable-hour, their eligibility may be determined by a measurement period rather than a 90-day waiting period — review those cases separately.',
    ],
    estimated_minutes: 45,
  },

  data_tracker_ready: {
    overview: 'This is the final check before moving to Phase 4. The Employee Tracker in this application reviews every employee\'s record and flags any remaining issues — missing SSNs, missing DOBs, missing stability dates, missing dependent information, and more. Before you can generate the real electronic filing, every employee who will receive a 1095-C should show as Ready in the tracker with no open issues.',
    why_it_matters: 'Any employee not showing as Ready has a data problem that will cause an error or incomplete information on their 1095-C form. Resolving all issues before filing prevents corrections later.',
    steps: [
      { step: 1, instruction: 'In this application, go to the Filing Employees page (Filing > Employees).' },
      { step: 2, instruction: 'Review the list and look for any employees who do not show a Ready status.' },
      { step: 3, instruction: 'Click on each non-ready employee to see what issues are flagged.', screenshot_hint: 'Each employee shows a status indicator and a list of any issues. Issues are categorized as missing SSN, missing DOB, missing stability date, etc.' },
      { step: 4, instruction: 'Resolve each issue: enter missing SSNs, DOBs, stability dates, or dependent information as needed.' },
      { step: 5, instruction: 'After fixing an employee\'s issues, refresh their status in the tracker to confirm they now show as Ready.' },
      { step: 6, instruction: 'Continue until every employee who will receive a 1095-C shows as Ready.' },
      { step: 7, instruction: 'Mark this item complete — this is a Gate item that must be done before Phase 4 can begin.' },
    ],
    if_something_looks_wrong: [
      'If many employees are not Ready, work through the other Phase 3 checklist items first (SSNs, DOBs, dependents, etc.) before coming back to this final check.',
      'If an employee is showing as not Ready but you believe all their information is correct, contact TEAM Software support or review the specific issue flags for that employee.',
    ],
    estimated_minutes: 60,
  },

  // ============================================================
  // PHASE 4 — Generate, Verify, and File
  // ============================================================

  file_preview_all: {
    overview: 'Phase 4 is where you generate the actual filing. But before generating the real electronic file that goes to the IRS, you must run a full preview report and verify it is completely correct. The preview report shows you exactly what the 1095-C forms will look like — every line, every code, every employee. This is your final quality check, and you cannot skip it.',
    why_it_matters: 'If you generate and submit the electronic file without reviewing the preview first, any errors in the forms will be submitted to the IRS and will require a corrected filing to fix.',
    steps: [
      { step: 1, instruction: 'In WinTeam, click INS in the top navigation menu.' },
      { step: 2, instruction: 'Click Employee 1095-C Report from the dropdown.' },
      { step: 3, instruction: 'In the Tax Year field, confirm the current filing year is entered.' },
      { step: 4, instruction: 'In the Output Type field, select 1095-C Forms (preview) or Preview Report.', warning: 'Do NOT select Electronic File at this step. You are only previewing — not filing.' },
      { step: 5, instruction: 'Set the employee range to All (include all employees).' },
      { step: 6, instruction: 'Click Print or Run to generate the preview.' },
      { step: 7, instruction: 'Wait for all forms to generate. This may take a few minutes for large employee populations.', detail: 'Do not close WinTeam while the report is generating.' },
      { step: 8, instruction: 'Once the preview is generated, save it as a PDF so you can reference it for the next several checklist items.' },
      { step: 9, instruction: 'Mark this item complete, then move on to the spot-check steps.' },
    ],
    if_something_looks_wrong: [
      'If the report generates zero forms, go back to Phase 1 and verify ACA Configuration is enabled in SYS: Company Setup.',
      'If the report takes a very long time, that is normal for large workforces. Do not interrupt it.',
    ],
    estimated_minutes: 20,
  },

  file_spot_plan1: {
    overview: 'Now you will carefully review the preview forms for a sample of employees. Start with Plan 1 (MEC) enrollees. For each Plan 1 employee, you are checking three specific things on their 1095-C: Line 14 should be 1E, Part III should be populated with the employee and their covered dependents, and Line 16 should be 2C (meaning they were enrolled in coverage).',
    why_it_matters: 'Any error caught now can be fixed before filing. Any error missed now becomes a corrected filing after the IRS receives the file.',
    steps: [
      { step: 1, instruction: 'Using the preview PDF from the previous step, find the forms for 3 employees who were enrolled in Plan 1 (MEC) for the full year.' },
      { step: 2, instruction: 'For each form, look at Line 14. Confirm it shows 1E for all 12 months.', detail: 'Code 1E means minimum value coverage was offered to the employee, their spouse, and their dependents.' },
      { step: 3, instruction: 'Check Part III at the bottom of each form. Confirm it shows the employee and any covered dependents with months covered.', screenshot_hint: 'Part III should have at least one row for the employee. If they have covered dependents, additional rows should appear for each dependent.' },
      { step: 4, instruction: 'Check Line 16. For employees enrolled all year, it should show 2C (enrolled in minimum essential coverage).', detail: 'Code 2C means the employee was enrolled in the employer-sponsored coverage.' },
      { step: 5, instruction: 'If all three checks pass for all three employees — mark this item complete.' },
      { step: 6, instruction: 'If anything looks wrong, note it in the Finding field and do not mark complete until the issue is fixed.' },
    ],
    if_something_looks_wrong: [
      'If Line 14 shows 1F instead of 1E, the employee\'s benefit package likely only contains Plan 1 and not all three plans. Go back to Phase 1 to fix the package.',
      'If Part III is blank for a Plan 1 employee, go back to Phase 1 and verify the Self Insured checkbox is checked on Plan 1.',
      'If Line 16 is blank or shows a different code, check the employee\'s benefit enrollment dates and stability period in WinTeam.',
    ],
    estimated_minutes: 20,
  },

  file_spot_plan2: {
    overview: 'Now spot-check 3 employees enrolled in Plan 2 (Self-Insured major medical). Plan 2 is also a self-insured plan, so Part III must be populated — but the dependent information for Plan 2 enrollees may be different (more dependents, different coverage months). Line 14 should still be 1E, and Part III should show all covered individuals.',
    why_it_matters: 'Plan 2 enrollees have the most complex 1095-C forms because they require detailed dependent information in Part III. Catching errors here prevents costly corrected filings.',
    steps: [
      { step: 1, instruction: 'In the preview PDF, find the forms for 3 employees enrolled in Plan 2 (Self-Insured full medical).' },
      { step: 2, instruction: 'Check Line 14: confirm it shows 1E for all 12 months (or the months they were enrolled).' },
      { step: 3, instruction: 'Check Part III: confirm the employee is listed, and that all covered dependents (spouse, children) appear with correct months.', screenshot_hint: 'For a Plan 2 family enrollment, you might see 4–6 rows in Part III: employee plus spouse plus children.' },
      { step: 4, instruction: 'Verify each dependent\'s SSN or DOB is populated in Part III.' },
      { step: 5, instruction: 'Verify the covered months shown in Part III match when each person was actually on the plan.' },
      { step: 6, instruction: 'If everything looks correct for all three employees, mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If a dependent is missing from Part III, go back to Phase 3 and add them in the Covered Individuals tab for that employee in WinTeam.',
      'If a dependent\'s SSN shows as blanks or zeros, go back to Phase 3 and enter the correct SSN.',
    ],
    estimated_minutes: 20,
  },

  file_spot_plan3: {
    overview: 'Now spot-check 3 employees enrolled in Plan 3 (Select Health, the fully insured plan). The key thing to verify for Plan 3 employees is that Part III is completely blank — since Plan 3 is fully insured, the IRS does not require dependent information. If Part III has data for Plan 3 employees, that is an error. Line 14 should still be 1E.',
    why_it_matters: 'If Part III is incorrectly populated for Plan 3 employees, the IRS will have invalid data on those forms, which can cause processing errors.',
    steps: [
      { step: 1, instruction: 'In the preview PDF, find the forms for 3 employees enrolled in Plan 3 (Select Health).' },
      { step: 2, instruction: 'Check Line 14: confirm it shows 1E for all 12 months.' },
      { step: 3, instruction: 'Check Part III: confirm it is completely blank — no rows, no data, nothing.', screenshot_hint: 'For a Plan 3 employee, Part III should be entirely empty with no rows filled in.' },
      { step: 4, instruction: 'If Part III is blank and Line 14 is 1E — mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If Part III has data for Plan 3 employees, go back to Phase 1 and verify that the Self Insured checkbox is NOT checked on Plan 3.',
      'If Line 14 shows anything other than 1E, go back to Phase 1 to investigate the benefit package setup.',
    ],
    estimated_minutes: 15,
  },

  file_spot_declined: {
    overview: 'Employees who were offered coverage but chose not to enroll still receive a 1095-C. Their form documents that the offer was made. Line 14 should be 1E (the offer was made), Part III should be blank (they are not enrolled), and Line 16 should show a safe harbor code that corresponds to how your company tested affordability.',
    why_it_matters: 'Incorrect codes on declined-employee forms can misrepresent that you made an offer of coverage, which is what the ACA employer mandate compliance depends on.',
    steps: [
      { step: 1, instruction: 'In the preview PDF, find forms for 3 employees who declined all coverage during the filing year.' },
      { step: 2, instruction: 'Check Line 14: confirm it shows 1E for all 12 months they were eligible (even though they declined).' },
      { step: 3, instruction: 'Check Part III: confirm it is blank (since they were not enrolled).' },
      { step: 4, instruction: 'Check Line 16: confirm it shows a safe harbor code.', detail: 'Common codes: 2F (W-2 safe harbor), 2G (FPL safe harbor), or 2H (rate of pay safe harbor). The code should match the safe harbor method your company uses.' },
      { step: 5, instruction: 'If all checks pass, mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If Line 14 is blank for declined employees, their benefit package may not be assigned in WinTeam. Go back to Phase 3 to verify declined employees have packages.',
      'If Line 16 is blank, WinTeam may not have a safe harbor method configured. Check INS > Eligibility Setup for the safe harbor settings.',
    ],
    estimated_minutes: 15,
  },

  file_line15_consistent: {
    overview: 'As a final check on Line 15, scan through the preview report and confirm that every enrolled employee shows the same dollar amount on Line 15. Line 15 is the employee-only monthly premium for the lowest-cost minimum value plan — which is Plan 1 for your company. Every form should show the same number. Any variation is an error.',
    why_it_matters: 'Inconsistent Line 15 amounts indicate that different premium amounts are entered in WinTeam for different employees, which will produce incorrect affordability calculations.',
    steps: [
      { step: 1, instruction: 'Flip through 10–15 forms in the preview report, looking specifically at Line 15.' },
      { step: 2, instruction: 'Note any form where Line 15 shows a different amount from the others, or where Line 15 is blank.' },
      { step: 3, instruction: 'If all forms show the same correct amount, mark this item complete.' },
      { step: 4, instruction: 'If any forms show a different amount, identify those employees and investigate.', warning: 'Go back to INS > Benefit Setup > Plan 1 > Pricing Tab and verify the employee-only premium is a single consistent amount. Also check if those employees have a different Plan 1 benefit record with a different premium.' },
    ],
    if_something_looks_wrong: [
      'A blank Line 15 usually means the employee does not have a Plan 1 enrollment record in WinTeam.',
      'A different dollar amount usually means the Plan 1 premium field was entered differently for that employee\'s specific benefit record.',
    ],
    estimated_minutes: 20,
  },

  file_count_matches: {
    overview: 'Count the total number of 1095-C forms in the preview report and compare it to your expected headcount of full-time employees for the filing year. The two numbers should be close. A significant mismatch — for example, 50 forms when you expect 120 — means employees are missing from WinTeam and would not receive forms.',
    why_it_matters: 'A form count that does not match your headcount means some employees are being missed, and those employees will not receive the required 1095-C forms.',
    steps: [
      { step: 1, instruction: 'Count the total pages or forms in the preview PDF. Many PDF viewers show total pages at the bottom.' },
      { step: 2, instruction: 'Compare to your expected full-time headcount for the filing year. This is the number of full-time employees (average 30+ hours per week) who worked at any point during the year.' },
      { step: 3, instruction: 'If the count matches or is within a small margin — mark this item complete.' },
      { step: 4, instruction: 'If the count is significantly lower than expected, go back to Phase 3 and verify all employees are in WinTeam.' },
      { step: 5, instruction: 'If the count is higher than expected, you may have part-time employees who were incorrectly included. Investigate and remove them if they do not qualify for a 1095-C.' },
    ],
    if_something_looks_wrong: [
      'Small differences in the count (1–3 employees) may be due to short-term variable-hour employees — review those records individually.',
      'If you are unsure of your expected headcount, run a full-year payroll report filtered to full-time employees and count that list.',
    ],
    estimated_minutes: 20,
  },

  file_fix_rerun: {
    overview: 'If any of the spot-checks in the previous steps uncovered errors, this step asks you to fix each one and then re-run the preview report. You must keep fixing and re-running until the preview report comes back completely clean. Do not generate the electronic filing file until you have a clean preview report. This step may take one cycle or several — that is normal.',
    why_it_matters: 'The preview report is your last chance to find and fix errors before the IRS receives your filing. An error found after submission requires a corrected filing, which is more work and can draw IRS attention.',
    steps: [
      { step: 1, instruction: 'Go through the notes you made during the spot-check steps and list every discrepancy you found.' },
      { step: 2, instruction: 'Fix each issue in WinTeam — this might involve correcting benefit setup, fixing enrollment records, adding missing dependent data, etc.' },
      { step: 3, instruction: 'After fixing all issues, go back to INS > Employee 1095-C Report and re-run the preview for all employees.' },
      { step: 4, instruction: 'Re-check the same spot-checks: Line 14 = 1E, Part III populated correctly, Line 15 consistent, form count correct.' },
      { step: 5, instruction: 'If new issues appear, fix them and re-run again.', warning: 'Keep running the cycle until you have a preview report with zero discrepancies. Do not advance until the preview is fully clean.' },
      { step: 6, instruction: 'Once the preview is clean, mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If you are finding many errors in successive re-runs, consider contacting TEAM Software support or your WinTeam consultant before spending more time on manual fixes.',
      'Keep notes on everything you changed in case you need to explain changes later.',
    ],
    estimated_minutes: 60,
  },

  file_generate_1095c: {
    overview: 'This is the step where you generate the real electronic file that will go to the IRS. You have verified the preview is clean — now you change the Output Type to Electronic File and generate the actual submission file. This file is a specific format the IRS system can read. Save it to a secure location immediately.',
    why_it_matters: 'This is the file you submit to the IRS. Any error in this file that was not caught in the preview will require a corrected filing.',
    steps: [
      { step: 1, instruction: 'In WinTeam, go to INS > Employee 1095-C Report.' },
      { step: 2, instruction: 'Confirm the Tax Year is set to the current filing year.' },
      { step: 3, instruction: 'Change the Output Type to 1095-C Electronic File (NOT Preview).', warning: 'You are now generating the real filing file. Make sure all spot-checks from previous steps were completed with a clean preview before proceeding.' },
      { step: 4, instruction: 'Set the employee range to All.' },
      { step: 5, instruction: 'Click Generate or Run.' },
      { step: 6, instruction: 'When WinTeam prompts you to save the file, save it to a secure folder. Name it clearly, for example: "1095C_[TaxYear]_[CompanyName]_[Date].xml".' },
      { step: 7, instruction: 'Verify the file was saved successfully and note the file location.' },
      { step: 8, instruction: 'Mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If WinTeam generates an error instead of a file, note the error message and contact TEAM Software support.',
      'Do not edit the electronic file manually — it is a structured format and any manual changes will likely corrupt it.',
    ],
    estimated_minutes: 20,
  },

  file_generate_1094c: {
    overview: 'The 1094-C is the cover sheet that goes with your 1095-C forms. It tells the IRS who you are, how many 1095-C forms you are submitting, and confirms your status as an Applicable Large Employer (ALE) subject to ACA reporting requirements. You must file the 1094-C together with the 1095-C electronic file — you cannot file one without the other.',
    why_it_matters: 'Without the 1094-C, your submission is incomplete. The IRS will not accept a 1095-C electronic file without an accompanying 1094-C transmittal.',
    steps: [
      { step: 1, instruction: 'In WinTeam, go to INS > Employee 1095-C Report (same location as the 1095-C file generation).' },
      { step: 2, instruction: 'Look for an option to generate the 1094-C transmittal. This may be a separate button or a different Output Type option.' },
      { step: 3, instruction: 'Generate the 1094-C for the same tax year.' },
      { step: 4, instruction: 'Review the 1094-C output and verify the total number of forms matches the count from your 1095-C preview (the form count check from a previous step).', screenshot_hint: 'The 1094-C should show your company EIN, company name, and the total number of 1095-C forms being submitted.' },
      { step: 5, instruction: 'Save the 1094-C file to the same secure folder as your 1095-C file.' },
      { step: 6, instruction: 'Mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If the form count on the 1094-C does not match the number of 1095-C forms you generated, investigate the discrepancy before filing.',
      'If you cannot find the 1094-C generation option in WinTeam, contact TEAM Software support.',
    ],
    estimated_minutes: 15,
  },

  file_submit: {
    overview: 'Now you submit your 1094-C and 1095-C files to the IRS. There are two ways to do this: through WinTeam\'s built-in FIRE integration (FIRE stands for Filing Information Returns Electronically — it is the IRS\'s submission portal), or through TEAM Software\'s e-file service if you purchased that option. Either way, the submission is done electronically. You will receive a confirmation number when the submission is accepted.',
    why_it_matters: 'The IRS filing deadline is firm. A late submission may result in IRS penalties. You must submit before the deadline even if you are still resolving minor issues.',
    steps: [
      { step: 1, instruction: 'Determine which submission method you are using: WinTeam FIRE integration or TEAM Software e-file service. Check with your WinTeam administrator if unsure.' },
      { step: 2, instruction: 'If using WinTeam FIRE integration: follow WinTeam\'s prompts to upload the 1094-C and 1095-C files through the FIRE portal.' },
      { step: 3, instruction: 'If using TEAM Software e-file service: upload the files to their portal per the instructions they provided.' },
      { step: 4, instruction: 'Complete the submission process and wait for a confirmation screen or email.', warning: 'Do not close your browser or WinTeam until you see a confirmation number or success message. Closing early may mean the submission did not complete.' },
      { step: 5, instruction: 'Write down or save the submission confirmation number. This is your proof that the filing was submitted.' },
      { step: 6, instruction: 'Note the submission date and time.' },
      { step: 7, instruction: 'Mark this item complete.' },
    ],
    if_something_looks_wrong: [
      'If the submission fails or returns an error, note the error code and contact TEAM Software support immediately.',
      'If you are past the filing deadline, submit as soon as possible. The IRS generally treats late filings more favorably than no filing at all.',
    ],
    estimated_minutes: 30,
  },

  file_acknowledgement: {
    overview: 'After submitting your electronic file to the IRS, you need to go back and retrieve the acknowledgement file. The IRS processes your submission and returns an acknowledgement that tells you whether it was Accepted, Accepted with Errors, or Rejected. This is different from the submission confirmation you received when you uploaded the file — the acknowledgement comes after the IRS has processed it, which can take a day or more.',
    why_it_matters: 'If your submission was Rejected or Accepted with Errors, you need to know immediately so you can fix the issues and refile. Not checking the acknowledgement means you might think you filed successfully when actually the IRS rejected the entire submission.',
    steps: [
      { step: 1, instruction: 'Log back into the IRS FIRE system (or TEAM Software e-file portal) 24–48 hours after your submission.' },
      { step: 2, instruction: 'Find the acknowledgement file for your submission. It will be in the same account where you uploaded your files.' },
      { step: 3, instruction: 'Download the acknowledgement file and open it.' },
      { step: 4, instruction: 'Read the status: Accepted, Accepted with Errors, or Rejected.' },
      { step: 5, instruction: 'If the status is Accepted — great. Save the acknowledgement file to your records and mark this item complete.' },
      { step: 6, instruction: 'If the status is Accepted with Errors or Rejected, read the error details carefully.', warning: 'Accepted with Errors means some records had problems. Rejected means the entire submission was not accepted. In either case, you need to fix the errors and submit a corrected file.' },
    ],
    if_something_looks_wrong: [
      'If you cannot log back into the FIRE system, contact TEAM Software support or the IRS FIRE help line.',
      'If your submission was rejected, do not panic — log a Blocking issue with the error details and contact TEAM Software support for guidance on how to submit a correction.',
    ],
    estimated_minutes: 20,
  },

  file_save_copies: {
    overview: 'ACA reporting rules require you to keep copies of all your filing records for at least 3 years. This includes the individual 1095-C PDF forms for each employee, the 1094-C transmittal, the electronic submission file, and the IRS acknowledgement. These records may be needed if the IRS audits you, if an employee disputes their form, or if you need to file a correction in a future year.',
    why_it_matters: 'If you do not keep copies and the IRS questions your filing later, you may not be able to prove what you filed or demonstrate that you filed correctly.',
    steps: [
      { step: 1, instruction: 'Create a dedicated secure folder for this filing year\'s ACA records.' },
      { step: 2, instruction: 'Save the full PDF of all employee 1095-C forms into the folder.' },
      { step: 3, instruction: 'Save the 1094-C transmittal document or file into the folder.' },
      { step: 4, instruction: 'Save the 1095-C electronic submission file (.xml or equivalent) into the folder.' },
      { step: 5, instruction: 'Save the IRS acknowledgement file into the folder.' },
      { step: 6, instruction: 'Label everything clearly with the tax year and date.' },
      { step: 7, instruction: 'Back up the folder to a second location (another drive, cloud storage, etc.).', detail: 'The IRS recommends keeping ACA records for at least 3 years from the filing date.' },
      { step: 8, instruction: 'Mark this item complete. Your filing is done!' },
    ],
    if_something_looks_wrong: [
      'If you cannot find one of the files to save, check the download folder on the computer where you generated the files.',
      'If you used TEAM Software e-file service, you may be able to download copies directly from their portal.',
    ],
    estimated_minutes: 15,
  },

}
