import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartHub — Project Tracking",
  description:
    "Track projects, task progress, and team workload in one dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
                SH
              </span>
              <span className="text-lg font-semibold text-slate-900">
                SmartHub
              </span>
              <span className="hidden text-sm text-slate-400 sm:inline">
                / Project Tracking
              </span>
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-slate-500 hover:text-brand-600"
            >
              All projects
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
