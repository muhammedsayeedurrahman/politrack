import { NextRequest } from 'next/server';
import { ok, err } from '@/app/api/_lib/response';
import { createComplaint } from '@/app/api/_lib/data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { category, what } = body;
    if (!category || !what || typeof what !== 'string' || what.trim().length < 10) {
      return err('Category and description (min 10 chars) are required', 400);
    }

    const complaint = createComplaint(body);

    return ok({
      trackingCode: complaint.trackingCode,
      message: 'Complaint received successfully',
      createdAt: complaint.submittedAt,
    });
  } catch {
    return err('Failed to process complaint', 500);
  }
}
