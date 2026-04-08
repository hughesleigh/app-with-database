import { getDashboardData } from '../../../lib/db';

export async function GET({ url }) {
  const panel = url.searchParams.get('panel');
  const { categories } = getDashboardData(panel);
  const options = [
    '<option value="">Select category</option>',
    ...categories.map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
  ].join('');
  return new Response(options, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
