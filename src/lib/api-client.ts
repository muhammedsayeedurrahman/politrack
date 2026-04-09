import type { ApiResponse } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function unwrap<T>(res: Response): Promise<T> {
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success || json.error) {
    throw new ApiError(json.error ?? 'Unknown API error', res.status);
  }
  return json.data as T;
}

function buildQuery(params?: Record<string, string | string[] | number | boolean | undefined | null>): string {
  if (!params) return '';
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      if (value.length > 0) sp.set(key, value.join(','));
    } else {
      sp.set(key, String(value));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | string[] | number | boolean | undefined | null>,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}${buildQuery(params)}`);
  return unwrap<T>(res);
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return unwrap<T>(res);
}

export async function apiPatch<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return unwrap<T>(res);
}

export { ApiError };
