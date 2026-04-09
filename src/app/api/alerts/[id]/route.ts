import type { NextRequest } from 'next/server';
import { ok, err } from '../../_lib/response';
import { getAlertById, markAlertAsRead, dismissAlert } from '../../_lib/data';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const alert = getAlertById(id);
  if (!alert) return err('Alert not found', 404);
  return ok(alert);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json() as { action: 'markAsRead' | 'dismiss' };

  if (body.action === 'markAsRead') {
    const updated = markAlertAsRead(id);
    if (!updated) return err('Alert not found', 404);
    return ok(updated);
  }

  if (body.action === 'dismiss') {
    const updated = dismissAlert(id);
    if (!updated) return err('Alert not found', 404);
    return ok(updated);
  }

  return err('Invalid action. Use "markAsRead" or "dismiss".', 400);
}
