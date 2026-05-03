interface Route {
  path: string;
  count: number;
  avg_latency: number;
}

export function TopRoutes({ data }: { data: Route[] }) {
  const max = data[0]?.count ?? 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((r) => (
        <div key={r.path}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--accent-light)', fontFamily: 'monospace' }}>
              {r.path}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {r.count} req · {r.avg_latency}ms
            </span>
          </div>
          <div style={{ height: 3, background: 'var(--route-bar-bg)', borderRadius: 2 }}>
            <div style={{
              height: 3,
              borderRadius: 2,
              width: `${(r.count / max) * 100}%`,
              background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}