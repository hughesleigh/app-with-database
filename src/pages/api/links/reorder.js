import { reorderLinks } from '../../../lib/db';

export async function POST({ request }) {
  const { lists } = await request.json();
  if (!Array.isArray(lists)) return new Response('Invalid payload', { status: 400 });
  for (const list of lists) {
    reorderLinks(Number(list.categoryId), (list.linkIds || []).map(Number));
  }
  return new Response(null, { status: 204 });
}
