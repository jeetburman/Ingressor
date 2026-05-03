import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';

const router = Router();

// Simple admin guard — replace with proper JWT in production
router.use((req: Request, res: Response, next) => {
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
});

// Create user
router.post('/users', async (req: Request, res: Response) => {
  const { email, name } = req.body;
  const user = await prisma.user.create({ data: { email, name } });
  res.status(201).json(user);
});

// Generate API key
router.post('/api-keys', async (req: Request, res: Response) => {
  const { userId, name, expiresAt } = req.body;

  const raw = `gw_${uuidv4().replace(/-/g, '')}`;
  const hashed = await bcrypt.hash(raw, 10);

  const apiKey = await prisma.apiKey.create({
    data: {
      key: hashed,
      name,
      userId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  // Return raw key ONCE — we never store it in plain text
  res.status(201).json({ ...apiKey, rawKey: raw });
});

// Revoke key
router.delete('/api-keys/:id', async (req: Request, res: Response) => {
  await prisma.apiKey.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });
  res.json({ message: 'Key revoked' });
});

// Register a proxy route
router.post('/routes', async (req: Request, res: Response) => {
  const { userId, prefix, targetUrl } = req.body;
  const route = await prisma.route.create({ data: { userId, prefix, targetUrl } });
  res.status(201).json(route);
});

// List routes
router.get('/routes', async (_req: Request, res: Response) => {
  const routes = await prisma.route.findMany({ include: { user: true } });
  res.json(routes);
});

export default router;