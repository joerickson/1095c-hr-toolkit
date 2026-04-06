"use client";

export default function PrintButton({ label = "Print Guide" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="btn-secondary text-sm no-print"
    >
      {label}
    </button>
  );
}
