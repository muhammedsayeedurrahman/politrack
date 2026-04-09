import { ok } from '../../_lib/response';
import { getEntitiesByType } from '../../_lib/data';

export async function GET() {
  return ok(getEntitiesByType());
}
