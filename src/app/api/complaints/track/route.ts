import { NextRequest } from 'next/server';
import { ok, err, parseSearchParams } from '@/app/api/_lib/response';
import { getComplaintByTrackingCode } from '@/app/api/_lib/data';

export async function GET(req: NextRequest) {
  const params = parseSearchParams(req);
  const code = params.code?.trim().toUpperCase();

  if (!code) {
    return err('Tracking code is required', 400);
  }

  const complaint = getComplaintByTrackingCode(code);

  if (!complaint) {
    return err('No report found with this tracking code. Please check and try again.', 404);
  }

  return ok({
    trackingCode: complaint.trackingCode,
    category: complaint.category,
    status: complaint.status,
    submittedAt: complaint.submittedAt,
    updatedAt: complaint.updatedAt,
    timeline: complaint.timeline,
  });
}
