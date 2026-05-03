import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export async function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const apiKey = req.apiKey!;

  // Floor timestamp to the start of the current minute
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setSeconds(0, 0);

  const rateLimit = await prisma.rateLimit.upsert({
    where: {
      apiKeyId_windowStart: {
        apiKeyId: apiKey.id,
        windowStart,
      },
    },
    create: {
      apiKeyId: apiKey.id,
      windowStart,
      requestCount: 1,
      maxRequests: 100,
    },
    update: {
      requestCount: { increment: 1 },
    },
  });

  const remaining = Math.max(0, rateLimit.maxRequests - rateLimit.requestCount);
  const resetAt = new Date(windowStart.getTime() + 60_000);

  res.setHeader('X-RateLimit-Limit', rateLimit.maxRequests);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', resetAt.toISOString());

  if (rateLimit.requestCount > rateLimit.maxRequests) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: resetAt.toISOString(),
    });
    return;
  }

  next();
}