import { NextResponse } from 'next/server';

const GATEWAY_URL = process.env.GATEWAY_URL ?? 'http://localhost:3000';

export async function GET() {
  try {
    const [overview, timeseries, topRoutes, recentLogs] = await Promise.all([
      fetch(`${GATEWAY_URL}/analytics/overview`, { cache: 'no-store' }),
      fetch(`${GATEWAY_URL}/analytics/timeseries`, { cache: 'no-store' }),
      fetch(`${GATEWAY_URL}/analytics/top-routes`, { cache: 'no-store' }),
      fetch(`${GATEWAY_URL}/analytics/recent`, { cache: 'no-store' }),
    ]);

    const data = await Promise.all([
      overview.json(),
      timeseries.json(),
      topRoutes.json(),
      recentLogs.json(),
    ]);

    return NextResponse.json({
      overview:   data[0],
      timeseries: data[1],
      topRoutes:  data[2],
      recentLogs: data[3],
    });
  } catch (err) {
    return NextResponse.json({ error: 'Gateway unreachable' }, { status: 502 });
  }
}