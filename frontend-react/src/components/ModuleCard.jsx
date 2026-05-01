import { useNavigate } from 'react-router-dom';
import { TOPIC_COLORS, TOPIC_ICONS, LEVEL_COLORS } from '../services/helpers';
import { mediaUrl } from '../services/api';

export default function ModuleCard({ m, onClick }) {
  const navigate = useNavigate();
  const pct = Math.round(m.my_progress || 0);
  const done = m.my_completed;

  const handleClick = () => {
    if (onClick) onClick(m);
    else navigate(`/modules/${m.id}`);
  };

  return (
    <div className="mod-card" onClick={handleClick}>
      <div className="mod-thumb">
        {m.thumbnail_url
          ? <><img src={mediaUrl(m.thumbnail_url)} alt={m.title} /><div className="mod-thumb-overlay" /></>
          : <span style={{ fontSize: '3rem' }}>{TOPIC_ICONS[m.topic] || '📚'}</span>}
        {!m.is_published && <span style={{ position: 'absolute', top: 8, right: 8 }} className="tag tag-amber">Draft</span>}
        {done ? <span style={{ position: 'absolute', top: 8, left: 8, background: 'var(--g400)', color: '#fff', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</span> : null}
      </div>
      <div className="mod-body">
        <div className="mod-meta">
          <span className={`tag ${TOPIC_COLORS[m.topic] || 'tag-gray'}`}>{m.topic}</span>
          <span className={`tag ${LEVEL_COLORS[m.level] || 'tag-gray'}`}>{m.level}</span>
        </div>
        <div className="mod-title">{m.title}</div>
        <div className="mod-desc">{m.description || ''}</div>
        <div className="mod-footer">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>
              <span>{m.item_count || 0} items</span><span>{pct}%</span>
            </div>
            <div className="prog-bar"><div className="prog-fill" style={{ width: `${pct}%`, background: done ? 'var(--g400)' : 'var(--t400)' }} /></div>
          </div>
          <div style={{ marginLeft: 10, fontSize: 11, fontWeight: 600, color: 'var(--g600)' }}>+{m.points_reward}pts</div>
        </div>
      </div>
    </div>
  );
}
