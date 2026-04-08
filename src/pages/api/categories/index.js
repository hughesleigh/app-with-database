import { createCategory } from '../../../lib/db';

export async function POST({ request }) {
  const form = await request.formData();
  const panelId = Number(form.get('panelId'));
  const name = String(form.get('name') || '').trim();
  if (!panelId || !name) return new Response('Missing fields', { status: 400 });
  createCategory(panelId, name);
  return new Response(null, { status: 204, headers: { 'HX-Trigger': 'dashboard-updated' } });
}
