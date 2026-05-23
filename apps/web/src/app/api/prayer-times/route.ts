import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = searchParams.get('latitude');
  const lng = searchParams.get('longitude');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'latitude and longitude required' }, { status: 400 });
  }

  const backendUrl = `http://localhost:3001/api/v1/prayer-times?latitude=${lat}&longitude=${lng}`;

  try {
    const resp = await fetch(backendUrl, { next: { revalidate: 3600 } });
    if (!resp.ok) throw new Error(`Backend returned ${resp.status}`);
    const data = await resp.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Prayer times unavailable' }, { status: 502 });
  }
}
