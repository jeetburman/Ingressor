import { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';
import { prisma } from '../lib/prisma';

export async function proxyMiddleware(
  req: Request,
  res: Response
): Promise<void> {
  const start = Date.now();
  const apiKey = req.apiKey!;

  // Load routes for this user
  const routes = await prisma.route.findMany({
    where: { userId: apiKey.userId, isActive: true },
  });

  // Longest-prefix match — same strategy as Nginx/K8s Ingress
  const matched = routes
    .filter((r) => req.path.startsWith(r.prefix))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];

  if (!matched) {
    res.status(404).json({ error: 'No route configured for this path' });
    return;
  }

  const targetUrl = matched.targetUrl + req.path;

  try {
    const upstream = await axios({
      method: req.method as any,
      url: targetUrl,
      data: req.body,
      headers: {
        ...req.headers,
        host: undefined,           // don't forward original host
        'x-api-key': undefined,    // don't leak the key to upstream
        'x-forwarded-for': req.ip, // tell upstream the real client IP
        'x-request-id': req.headers['x-request-id'] ?? crypto.randomUUID(),
      },
      validateStatus: () => true,  // don't throw on 4xx/5xx — pass them through
    });

    const latencyMs = Date.now() - start;

    // Fire-and-forget log — never block the response for this
    prisma.requestLog
      .create({
        data: {
          apiKeyId: apiKey.id,
          method: req.method,
          path: req.path,
          targetUrl,
          statusCode: upstream.status,
          latencyMs,
          ip: req.ip ?? null,
          userAgent: req.headers['user-agent'] ?? null,
        },
      })
      .catch((err) => console.error('[logger] failed to write log:', err));

    res.status(upstream.status).json(upstream.data);
  } catch (err) {
    const latencyMs = Date.now() - start;
    const status = (err as AxiosError).response?.status ?? 502;

    prisma.requestLog
      .create({
        data: {
          apiKeyId: apiKey.id,
          method: req.method,
          path: req.path,
          targetUrl,
          statusCode: status,
          latencyMs,
          ip: req.ip ?? null,
          userAgent: req.headers['user-agent'] ?? null,
        },
      })
      .catch(() => {});

    res.status(502).json({ error: 'Upstream service unavailable' });
  }
}