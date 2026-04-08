import { categoryBelongsToPanel, createLink } from '../../../lib/db';

export async function POST({ request }) {
  const form = await request.formData();
  const categoryId = Number(form.get('categoryId'));
  const panelId = Number(form.get('panelId'));
  const name = String(form.get('name') || '').trim();
  const url = String(form.get('url') || '').trim();
  const description = String(form.get('description') || '').trim();
  if (!categoryId || !panelId || !name || !url) return new Response('Missing fields', { status: 400 });
  if (!categoryBelongsToPanel(categoryId, panelId)) return new Response('Category does not belong to active panel', { status: 400 });
  createLink(categoryId, name, url, description);
  return new Response(null, { status: 204, headers: { 'HX-Trigger': 'dashboard-updated' } });
}
