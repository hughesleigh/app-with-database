import { deletePanel } from '../../../lib/db';

export async function DELETE({ params }) {
  deletePanel(Number(params.id));
  return new Response(null, { status: 204, headers: { 'HX-Trigger': 'dashboard-updated' } });
}
