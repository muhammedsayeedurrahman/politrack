import { ok } from '../../_lib/response';
import { getUnreadAlertCount } from '../../_lib/data';

export async function GET() {
  return ok({ count: getUnreadAlertCount() });
}
