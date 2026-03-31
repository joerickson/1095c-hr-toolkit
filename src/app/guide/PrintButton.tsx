"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-secondary text-sm no-print"
    >
      Print Guide
    </button>
  );
}
