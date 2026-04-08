import { reorderCategories } from '../../../lib/db';

export async function POST({ request }) {
  const { panelId, categoryIds } = await request.json();
  if (!panelId || !Array.isArray(categoryIds)) return new Response('Invalid payload', { status: 400 });
  reorderCategories(panelId, categoryIds);
  return new Response(null, { status: 204 });
}
