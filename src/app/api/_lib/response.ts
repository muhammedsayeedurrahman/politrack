import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { ApiResponse, Pagination } from '@/types';

export function ok<T>(data: T, pagination?: Pagination): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    error: null,
    ...(pagination ? { pagination } : {}),
  });
}

export function err(message: string, status: number = 400): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    { success: true, data: null, error: message },
    { status },
  ) as NextResponse<ApiResponse<null>>;
}

export function parseSearchParams(req: NextRequest): Record<string, string> {
  const params: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/** Parse a comma-separated query param into an array, or return undefined if absent. */
export function parseArray(params: Record<string, string>, key: string): string[] | undefined {
  const raw = params[key];
  if (!raw) return undefined;
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

/** Parse a numeric query param, or return undefined if absent / NaN. */
export function parseNumber(params: Record<string, string>, key: string): number | undefined {
  const raw = params[key];
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isNaN(n) ? undefined : n;
}
