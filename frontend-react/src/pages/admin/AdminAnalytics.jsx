import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { fmt, ago } from '../../services/helpers';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api('GET', '/admin/analytics')
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return <div style={{ padding: '2rem', color: 'var(--muted)' }}>Loading analytics...</div>;

  return (
    <div className="page active" style={{ animation: 'fadeIn 0.22s ease' }}>
      <div className="admin-header">
        <div>
          <h1>Platform Analytics</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>Real-time overview of platform activity</p>
        </div>
      </div>

      <div className="grid-stats" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-val" style={{ color: 'var(--t600)' }}>{fmt(data.total_users)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Published Modules</div>
          <div className="stat-val" style={{ color: 'var(--g600)' }}>{data.published_modules} / {data.total_modules}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Quiz Attempts</div>
          <div className="stat-val" style={{ color: 'var(--a400)' }}>{fmt(data.quiz_attempts)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Quiz Score</div>
          <div className="stat-val" style={{ color: 'var(--b600)' }}>{data.avg_score || 0}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '1rem', marginBottom: '1rem' }}>Top Completed Modules</h3>
          {(data.top_modules || []).length ? (data.top_modules || []).map((m, i) => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '0.5px solid var(--border)', fontSize: '13px' }}>
              <span>{i + 1}. {m.title}</span>
              <span className="tag tag-teal">{m.completions} completions</span>
            </div>
          )) : <div style={{ color: 'var(--muted)', fontSize: 13 }}>No module completions yet.</div>}
        </div>

        <div className="card">
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '1rem', marginBottom: '1rem' }}>Recent Activity</h3>
          {(data.recent_activity || []).length ? (data.recent_activity || []).map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--t400)', marginTop: 6, flexShrink: 0 }}></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <b>{a.name}</b> — {a.action?.replace(/_/g, ' ')}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>{ago(a.created_at)}</div>
              </div>
            </div>
          )) : <div style={{ color: 'var(--muted)', fontSize: 13 }}>No recent activity.</div>}
        </div>
      </div>
    </div>
  );
}
