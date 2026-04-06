"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { FilingChecklistItem, WalkthroughStep } from "@/lib/filing-checklist-items";

interface Props {
  item: FilingChecklistItem;
  onClose: () => void;
  onMarkComplete: () => void;
  isComplete: boolean;
  isPending: boolean;
}

export default function WalkthroughOverlay({
  item,
  onClose,
  onMarkComplete,
  isComplete,
  isPending,
}: Props) {
  const t = useTranslations("walkthroughs");
  const tCommon = useTranslations("common");
  const tFiling = useTranslations("filing");
  const walkthrough = item.walkthrough!;
  const totalSteps = walkthrough.steps.length;
  const [currentStep, setCurrentStep] = useState(0);
  const [troubleshootOpen, setTroubleshootOpen] = useState(false);

  const goNext = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  }, [totalSteps]);

  const goPrev = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        goPrev();
      } else if ((e.key === " " || e.key === "Enter") && e.target === document.getElementById("wt-mark-complete")) {
        e.preventDefault();
        if (!isComplete && !isPending) onMarkComplete();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goNext, goPrev, onMarkComplete, isComplete, isPending]);

  const step: WalkthroughStep = walkthrough.steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wt-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex-1 min-w-0 pr-4">
            <h2 id="wt-title" className="font-bold text-gray-900 text-base leading-snug">
              {item.label}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {tCommon("aboutMinutes", { minutes: walkthrough.estimated_minutes })}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-gray-400 font-medium">
              {tCommon("stepOf", { current: currentStep + 1, total: totalSteps })}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={t("close")}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Access needed banner */}
          {(() => {
            const access = item.access_required;
            const role = access.winteam_role;
            if (role === 'winteam_admin') {
              return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0">🔒</span>
                    <div>
                      <p className="text-sm font-semibold text-red-800">{t("accessNeeded")}</p>
                      <p className="text-xs text-red-700 mt-1 leading-relaxed">
                        Make sure your WinTeam Admin is available before starting. They will need to be at the computer or logged in remotely.
                        {access.delegation_notes && <span> {access.delegation_notes}</span>}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            if (role === 'hr_manager') {
              return (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0">👤</span>
                    <div>
                      <p className="text-sm font-semibold text-purple-800">{t("accessNeeded")}</p>
                      {access.delegation_notes && (
                        <p className="text-xs text-purple-700 mt-1 leading-relaxed">{access.delegation_notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
            if (role === 'standard_hr') {
              return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0">👤</span>
                    <div>
                      <p className="text-sm font-semibold text-blue-800">{tFiling("anyHRStaff")}</p>
                      {access.delegation_notes && (
                        <p className="text-xs text-blue-700 mt-1 leading-relaxed">{access.delegation_notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Overview */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-sm text-blue-900 leading-relaxed">{walkthrough.overview}</p>
          </div>

          {/* Why it matters */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">{t("whyItMatters")}</p>
            <p className="text-sm text-amber-900 leading-relaxed">{walkthrough.why_it_matters}</p>
          </div>

          {/* Current step */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-9 h-9 rounded-full bg-navy-700 text-white flex items-center justify-center text-lg font-bold leading-none">
                {step.step}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium leading-snug">{step.instruction}</p>
                {step.detail && (
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{step.detail}</p>
                )}
                {step.warning && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-1.964-.834-2.732 0L3.072 16.5C2.302 18.333 3.263 20 4.804 20z" />
                      </svg>
                      <p className="text-xs text-amber-800 leading-relaxed">{step.warning}</p>
                    </div>
                  </div>
                )}
                {step.screenshot_hint && (
                  <div className="mt-3 border-2 border-dashed border-gray-300 rounded-md p-3 bg-gray-50">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs text-gray-600 leading-relaxed italic">{step.screenshot_hint}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={currentStep === 0}
              className="text-sm text-navy-600 hover:text-navy-800 disabled:text-gray-300 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t("previousStep")}
            </button>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {walkthrough.steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`rounded-full transition-all ${
                    i === currentStep
                      ? "w-3 h-3 bg-navy-700"
                      : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              disabled={currentStep === totalSteps - 1}
              className="text-sm text-navy-600 hover:text-navy-800 disabled:text-gray-300 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
            >
              {t("nextStep")}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* If something looks wrong — collapsible */}
          {walkthrough.if_something_looks_wrong.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setTroubleshootOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t("ifSomethingLooksWrong")}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${troubleshootOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {troubleshootOpen && (
                <div className="px-4 pb-4">
                  <ul className="space-y-2">
                    {walkthrough.if_something_looks_wrong.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-400 mt-2" />
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-white rounded-b-xl">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            {t("close")}
          </button>
          <button
            id="wt-mark-complete"
            onClick={() => {
              if (!isComplete && !isPending) {
                onMarkComplete();
                onClose();
              }
            }}
            disabled={isComplete || isPending}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isComplete ? tCommon("complete") + " ✓" : isPending ? tCommon("loading") : tCommon("markCompleteAndClose")}
          </button>
        </div>
      </div>
    </div>
  );
}
