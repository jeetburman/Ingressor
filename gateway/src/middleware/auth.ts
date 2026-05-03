import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const rawKey = req.headers['x-api-key'] as string | undefined;

  if (!rawKey) {
    res.status(401).json({ error: 'Missing x-api-key header' });
    return;
  }

  // Keys are prefixed with "gw_" — fast filter before hitting DB
  if (!rawKey.startsWith('gw_')) {
    res.status(401).json({ error: 'Invalid API key format' });
    return;
  }

  const activeKeys = await prisma.apiKey.findMany({
    where: {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });

  const matched = activeKeys.find((k) => bcrypt.compareSync(rawKey, k.key));

  if (!matched) {
    res.status(401).json({ error: 'Invalid or expired API key' });
    return;
  }

  req.apiKey = matched;
  next();
}