import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ salonId: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const salonId = resolvedParams.salonId;
    const url = new URL(request.url);
    const days = url.searchParams.get('days') || '30';

    const backendUrl = process.env.NEXT_PUBLIC_BACK_URL;
    const response = await fetch(
      `${backendUrl}/salon-analytics/${salonId}/stats?days=${days}`,
      {
        headers: {
          Authorization: `Bearer ${(session as any).accessToken || ''}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch stats' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching salon analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
