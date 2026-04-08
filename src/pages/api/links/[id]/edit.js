import { getLinkForEdit } from '../../../../lib/db';

export async function GET({ params }) {
  const data = getLinkForEdit(Number(params.id));
  if (!data) return new Response('Not found', { status: 404 });
  const options = data.categories
    .map((category) => `<option value="${category.id}" ${category.id === data.link.category_id ? 'selected' : ''}>${category.name}</option>`)
    .join('');
  const html = `
    <form class="stack" hx-put="/api/links/${data.link.id}" hx-swap="none" x-on:submit="openModal=false">
      <label>Name<input name="name" value="${escapeHtml(data.link.name)}" required /></label>
      <label>URL<input type="url" name="url" value="${escapeHtml(data.link.url)}" required /></label>
      <label>Description<input name="description" value="${escapeHtml(data.link.description)}" /></label>
      <label>Category<select name="categoryId" required>${options}</select></label>
      <button>Save changes</button>
    </form>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
