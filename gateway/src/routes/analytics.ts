import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Overview stats — used by dashboard hero cards
router.get('/overview', async (_req: Request, res: Response) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24h

  const [total, errors, latency] = await Promise.all([
    prisma.requestLog.count({ where: { createdAt: { gte: since } } }),
    prisma.requestLog.count({
      where: { createdAt: { gte: since }, statusCode: { gte: 400 } },
    }),
    prisma.requestLog.aggregate({
      where: { createdAt: { gte: since } },
      _avg: { latencyMs: true },
    }),
  ]);

  res.json({
    totalRequests: total,
    errorCount: errors,
    errorRate: total > 0 ? ((errors / total) * 100).toFixed(2) : '0.00',
    avgLatencyMs: Math.round(latency._avg.latencyMs ?? 0),
  });
});

// Hourly timeseries for the chart — raw SQL for efficiency
router.get('/timeseries', async (_req: Request, res: Response) => {
  const rows = await prisma.$queryRaw<{ hour: Date; count: bigint }[]>`
    SELECT
      date_trunc('hour', "createdAt") AS hour,
      COUNT(*) AS count
    FROM "RequestLog"
    WHERE "createdAt" >= NOW() - INTERVAL '24 hours'
    GROUP BY 1
    ORDER BY 1 ASC
  `;

  res.json(rows.map((r) => ({ hour: r.hour, count: Number(r.count) })));
});

// Top routes by request volume
router.get('/top-routes', async (_req: Request, res: Response) => {
  const rows = await prisma.$queryRaw<{ path: string; count: bigint; avg_latency: number }[]>`
    SELECT
      path,
      COUNT(*) AS count,
      AVG("latencyMs") AS avg_latency
    FROM "RequestLog"
    WHERE "createdAt" >= NOW() - INTERVAL '24 hours'
    GROUP BY path
    ORDER BY count DESC
    LIMIT 10
  `;

  res.json(rows.map((r) => ({ ...r, count: Number(r.count), avg_latency: Math.round(r.avg_latency) })));
});

export default router;