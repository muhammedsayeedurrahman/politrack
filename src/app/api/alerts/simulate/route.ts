import { ok } from '../../_lib/response';
import { simulateNewAlert } from '../../_lib/data';

export async function POST() {
  const newAlert = simulateNewAlert();
  return ok(newAlert);
}
