import { deleteLink, updateLink } from '../../../lib/db';

export async function DELETE({ params }) {
  deleteLink(Number(params.id));
  return new Response(null, { status: 204, headers: { 'HX-Trigger': 'dashboard-updated' } });
}

export async function PUT({ params, request }) {
  const form = await request.formData();
  const categoryId = Number(form.get('categoryId'));
  const name = String(form.get('name') || '').trim();
  const url = String(form.get('url') || '').trim();
  const description = String(form.get('description') || '').trim();
  if (!categoryId || !name || !url) return new Response('Missing fields', { status: 400 });
  updateLink(Number(params.id), categoryId, name, url, description);
  return new Response(null, { status: 204, headers: { 'HX-Trigger': 'dashboard-updated' } });
}
