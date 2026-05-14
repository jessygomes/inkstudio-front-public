import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { UAParser } from 'ua-parser-js';

// Helper pour hasher l'IP (GDPR compliant)
function hashIP(ip: string | null): string {
  if (!ip) return 'unknown';
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

// Helper pour détecter le type d'appareil
function detectDeviceType(userAgent: string): string {
  const parser = new UAParser(userAgent);
  const device = parser.getDevice().type;

  if (device === 'mobile') return 'MOBILE';
  if (device === 'tablet') return 'TABLET';
  return 'DESKTOP';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { salonId } = body;

    if (!salonId) {
      return NextResponse.json(
        { error: 'salonId is required' },
        { status: 400 }
      );
    }

    // Récupérer les infos de la requête
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const userAgent = request.headers.get('user-agent') || '';
    const referrer =
      request.headers.get('referer') || request.headers.get('referrer') || '';
    const ipHash = hashIP(ip);
    const deviceType = detectDeviceType(userAgent);
    const geoCountry =
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry') ||
      'unknown';
    const geoCity =
      request.headers.get('x-vercel-ip-city') ||
      request.headers.get('cf-ipcity') ||
      'unknown';

    // Envoyer au backend avec les métadonnées nécessaires au comptage et à l'analyse.
    const backendUrl = process.env.NEXT_PUBLIC_BACK_URL;
    const response = await fetch(`${backendUrl}/salon-analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        salonId,
        ipHash,
        referrer: referrer.substring(0, 255),
        userAgent: userAgent.substring(0, 255),
        deviceType,
        country: geoCountry,
        city: geoCity,
      }),
    });

    // console.log('Tracking salon profile view:', {
    //   salonId,
    //   ipHash,
    //   referrer: referrer.substring(0, 255),
    //   userAgent: userAgent.substring(0, 255),
    //   deviceType,
    //   country: geoCountry,
    //   city: geoCity,
    //   backendStatus: response.status,
    // });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('Failed to track profile view:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      });

      return NextResponse.json(
        {
          success: false,
          tracked: false,
          backendStatus: response.status,
          backendError: responseText || response.statusText,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      tracked: response.ok,
      backendStatus: response.status,
      backendResponse: responseText || null,
    });
  } catch (error) {
    console.error('Error tracking profile view:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}
