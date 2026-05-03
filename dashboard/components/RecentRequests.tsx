interface Log {
  id: string;
  method: string;
  path: string;
  statusCode: number;
  latencyMs: number;
  createdAt: string;
}

const methodColors: Record<string, { bg: string; color: string }> = {
  GET:    { bg: 'var(--method-get-bg)',  color: 'var(--method-get-text)'  },
  POST:   { bg: 'var(--method-post-bg)', color: 'var(--method-post-text)' },
  DELETE: { bg: '#f8717122',             color: '#f87171'                  },
  PATCH:  { bg: '#f59e0b22',             color: '#f59e0b'                  },
  PUT:    { bg: '#a78bfa22',             color: '#a78bfa'                  },
};

export function RecentRequests({ data }: { data: Log[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {data.map((log) => {
        const m = methodColors[log.method] ?? methodColors.GET;
        const isError = log.statusCode >= 400;
        return (
          <div key={log.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '7px 0',
            borderBottom: '0.5px solid var(--border)',
          }}>
            <span style={{
              fontSize: 10, fontWeight: 500, padding: '2px 6px',
              borderRadius: 4, fontFamily: 'monospace',
              background: m.bg, color: m.color, minWidth: 42, textAlign: 'center',
            }}>
              {log.method}
            </span>
            <span style={{
              fontSize: 11, color: 'var(--text-secondary)',
              fontFamily: 'monospace', flex: 1,
            }}>
              {log.path}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 500,
              color: isError ? 'var(--status-err)' : 'var(--status-ok)',
              minWidth: 32,
            }}>
              {log.statusCode}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 48, textAlign: 'right' }}>
              {log.latencyMs}ms
            </span>
          </div>
        );
      })}
    </div>
  );
}