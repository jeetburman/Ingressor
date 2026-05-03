import { StatsCard } from '../components/StatsCard';
import { TimeseriesChart } from '../components/TimeseriesChart';
import { TopRoutes } from '../components/TopRoutes';
import { RecentRequests } from '../components/RecentRequests';
import { ThemeToggle } from '../components/ThemeToggle';

async function getData() {
  try {
    const res = await fetch('http://localhost:3000/analytics/overview', { cache: 'no-store' });
    const timeSeries = await fetch('http://localhost:3000/analytics/timeseries', { cache: 'no-store' });
    const topRoutes = await fetch('http://localhost:3000/analytics/top-routes', { cache: 'no-store' });
    const recent = await fetch('http://localhost:3000/analytics/recent', { cache: 'no-store' });

    return {
      overview:   await res.json(),
      timeseries: (await timeSeries.json()).map((r: any) => ({
        hour:  new Date(r.hour).getHours() + ':00',
        count: r.count,
      })),
      topRoutes:  await topRoutes.json(),
      recentLogs: await recent.json(),
    };
  } catch {
    return { overview: null, timeseries: [], topRoutes: [], recentLogs: [] };
  }
}

export default async function Dashboard() {
  const { overview, timeseries, topRoutes, recentLogs } = await getData();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* Navbar */}
      <nav style={{
        background: 'var(--bg-nav)',
        borderBottom: '0.5px solid var(--border)',
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
          }} />
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
            Ingressor
          </span>
        </div>
        <ThemeToggle />
      </nav>

      {/* Main content */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        <h1 style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
          Overview
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
          Last 24 hours
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          <StatsCard label="Total requests" value={overview?.totalRequests ?? '—'} accent="blue" />
          <StatsCard label="Errors"         value={overview?.errorCount    ?? '—'} accent="red"  />
          <StatsCard label="Error rate"     value={overview ? `${overview.errorRate}%` : '—'} />
          <StatsCard label="Avg latency"    value={overview ? `${overview.avgLatencyMs}ms` : '—'} accent="green" />
        </div>

        {/* Chart + Top Routes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12, marginBottom: 12 }}>
          <div style={{
            background: 'var(--bg-card)', border: '0.5px solid var(--border)',
            borderRadius: 10, padding: 16,
          }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
              Requests per hour
            </p>
            <TimeseriesChart data={timeseries} />
          </div>

          <div style={{
            background: 'var(--bg-card)', border: '0.5px solid var(--border)',
            borderRadius: 10, padding: 16,
          }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
              Top routes
            </p>
            <TopRoutes data={topRoutes} />
          </div>
        </div>

        {/* Recent Requests */}
        <div style={{
          background: 'var(--bg-card)', border: '0.5px solid var(--border)',
          borderRadius: 10, padding: 16,
        }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
            Recent requests
          </p>
          <RecentRequests data={recentLogs} />
        </div>

      </main>
    </div>
  );
}