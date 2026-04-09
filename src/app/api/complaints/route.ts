import { NextRequest, NextResponse } from 'next/server';
import { ok, err } from '@/app/api/_lib/response';

function generateTrackingCode(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `WB-${year}-${code}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { category, what } = body;
    if (!category || !what || typeof what !== 'string' || what.trim().length < 10) {
      return err('Category and description (min 10 chars) are required', 400);
    }

    const trackingCode = generateTrackingCode();

    // In production, this would persist to a database and create an alert
    // For demo, we return the tracking code
    return ok({
      trackingCode,
      message: 'Complaint received successfully',
      createdAt: new Date().toISOString(),
    });
  } catch {
    return err('Failed to process complaint', 500);
  }
}
