import { accountRoute, readJson } from '@/lib/server/account-route';
import { readUserVisitedCities, saveUserVisitedCities, deleteUserVisitedCities } from '@/lib/server/user-visited-cities';
export const runtime = 'nodejs';
export function GET(request: Request) {
  return accountRoute(request, userId => readUserVisitedCities(userId));
}
export function PUT(request: Request) {
  return accountRoute(request, async userId => {
    const body = await readJson(request);
    await saveUserVisitedCities(userId, body.cities);
    return { saved: true };
  });
}
export function DELETE(request: Request) {
  return accountRoute(request, async userId => {
    await deleteUserVisitedCities(userId);
    return { deleted: true };
  });
}
