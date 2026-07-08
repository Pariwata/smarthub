"use client";

import { useEffect } from "react";

/** A horizontal progress bar with an optional in-progress segment. */
export function ProgressBar({
  done,
  inProgress = 0,
  total,
  className = "",
}: {
  done: number;
  inProgress?: number;
  total: number;
  className?: string;
}) {
  const donePct = total === 0 ? 0 : (done / total) * 100;
  const progPct = total === 0 ? 0 : (inProgress / total) * 100;
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}
    >
      <div className="flex h-full">
        <div className="bg-emerald-500" style={{ width: `${donePct}%` }} />
        <div className="bg-amber-400" style={{ width: `${progPct}%` }} />
      </div>
    </div>
  );
}

/** A colored circular avatar showing a person's initials. */
export function Avatar({
  name,
  color = "#3366ff",
  size = 28,
}: {
  name: string;
  color?: string;
  size?: number;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        fontSize: size * 0.4,
      }}
      title={name}
    >
      {initials || "?"}
    </span>
  );
}

const BADGE_STYLES: Record<string, string> = {
  todo: "bg-slate-100 text-slate-600",
  in_progress: "bg-amber-100 text-amber-700",
  done: "bg-emerald-100 text-emerald-700",
  planning: "bg-sky-100 text-sky-700",
  active: "bg-brand-100 text-brand-700",
  on_hold: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  archived: "bg-slate-100 text-slate-500",
  low: "bg-slate-100 text-slate-500",
  medium: "bg-sky-100 text-sky-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-rose-100 text-rose-700",
};

export function Badge({
  value,
  label,
}: {
  value: string;
  label?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        BADGE_STYLES[value] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {label ?? value}
    </span>
  );
}

/** A lightweight modal dialog rendered over a backdrop. */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="mt-8 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** A labelled form field wrapper. */
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50";

export const btnGhost =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50";
