import { NextResponse } from "next/server";

/** Standard JSON success response. */
export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

/** Standard JSON error response. */
export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Safely parse a JSON request body, returning null on failure. */
export async function readJson<T = Record<string, unknown>>(
  req: Request
): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

/** Coerce a value to a trimmed non-empty string, or undefined. */
export function str(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}

/** Parse an incoming date-ish value into a Date or null. */
export function date(v: unknown): Date | null {
  if (v === null || v === undefined || v === "") return null;
  const d = new Date(v as string);
  return Number.isNaN(d.getTime()) ? null : d;
}
