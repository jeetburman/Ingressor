import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import adminRouter from './routes/admin';
import analyticsRouter from './routes/analytics';
import { authMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { proxyMiddleware } from './middleware/proxy';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

// Health check — no auth needed
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

// Admin routes — protected by ADMIN_SECRET header
app.use('/admin', adminRouter);

// Analytics routes — for the Next.js dashboard to call
app.use('/analytics', analyticsRouter);

// All other routes go through the gateway pipeline
app.all('/{*path}', authMiddleware, rateLimitMiddleware, proxyMiddleware);

app.listen(PORT, () => {
  console.log(`Gateway running on http://localhost:${PORT}`);
});