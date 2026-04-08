import { createPanel } from '../../../lib/db';

export async function POST({ request }) {
  const form = await request.formData();
  const name = String(form.get('name') || '').trim();
  if (!name) return new Response('Panel name required', { status: 400 });
  createPanel(name);
  return new Response(null, { status: 204, headers: { 'HX-Trigger': 'dashboard-updated' } });
}
