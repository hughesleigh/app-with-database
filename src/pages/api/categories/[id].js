import { deleteCategory } from '../../../lib/db';

export async function DELETE({ params }) {
  deleteCategory(Number(params.id));
  return new Response(null, { status: 204, headers: { 'HX-Trigger': 'dashboard-updated' } });
}
