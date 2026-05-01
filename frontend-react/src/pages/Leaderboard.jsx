import { useState, useEffect } from 'react';
import { api, mediaUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { fmt } from '../services/helpers';

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  useEffect(() => { api('GET', '/leaderboard').then(setData).catch(() => {}); }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="page active" style={{ animation: 'fadeIn 0.22s ease' }}>
      <div className="page-header">
        <h1 className="page-title">Leaderboard</h1>
        <p className="page-sub">Top eco learners worldwide</p>
      </div>
      <div style={{ maxWidth: 600 }}>
        <div className="table-wrap">
          {data.map((u, i) => (
            <div key={u.id} className="lb-row" style={{ ...(u.id === user?.id ? { background: 'var(--t50)' } : {}), padding: '12px 16px' }}>
              <div className={`lb-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>{i < 3 ? medals[i] : i + 1}</div>
              <div className="avatar" style={{ background: `hsl(${i * 47},45%,48%)`, width: 36, height: 36 }}>
                {u.avatar_url ? <img src={mediaUrl(u.avatar_url)} alt="" /> : (u.name || 'U').charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: u.id === user?.id ? 600 : 400 }}>{u.name} {u.id === user?.id ? '(You)' : ''}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.modules_done || 0} modules completed</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', color: 'var(--g800)' }}>{fmt(u.eco_points)}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>pts</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
