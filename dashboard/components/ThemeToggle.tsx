'use client';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle} style={{
      background: 'var(--bg-card)',
      border: '0.5px solid var(--border)',
      borderRadius: 8,
      padding: '6px 12px',
      fontSize: 12,
      color: 'var(--text-secondary)',
      cursor: 'pointer',
    }}>
      {theme === 'dark' ? '☀ Light' : '☾ Dark'}
    </button>
  );
}