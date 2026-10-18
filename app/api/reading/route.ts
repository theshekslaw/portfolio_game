import { listReading } from '@/lib/reading';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return Response.json(await listReading());
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
