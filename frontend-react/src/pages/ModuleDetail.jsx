import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, mediaUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TOPIC_COLORS, LEVEL_COLORS } from '../services/helpers';
import { showToast, openModal, closeModal } from '../components/UI';
import { openLightboxFn } from '../components/UI';

export default function ModuleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [mod, setMod] = useState(null);

  const load = async () => {
    try {
      const m = await api('GET', `/modules/${id}`);
      setMod(m);
    } catch (e) { showToast(e.message, 'error'); }
  };

  useEffect(() => { load(); }, [id]);

  const markDone = async (itemId) => {
    try {
      await api('POST', `/modules/${id}/items/${itemId}/complete`, { watch_seconds: 0 });
      closeModal();
      showToast('Item marked complete! ✓', 'success');
      await load();
      await refreshUser();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const openItem = (item) => {
    let body;
    if (item.type === 'text') {
      body = (
        <div className="content-text">
          <h2>{item.title}</h2>
          <p style={{ marginTop: '1rem' }} dangerouslySetInnerHTML={{ __html: (item.content || '').replace(/\n/g, '<br>') }} />
        </div>
      );
    } else if (item.type === 'video') {
      body = (
        <>
          <div className="video-container">
            <video controls onEnded={() => markDone(item.id)}>
              <source src={mediaUrl(item.file_url)} type="video/mp4" />
            </video>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>Watch the full video — it will be marked complete automatically.</p>
        </>
      );
    } else if (item.type === 'image') {
      body = item.file_url ? (
        <div className="img-gallery">
          <div className="img-thumb" onClick={() => openLightboxFn(mediaUrl(item.file_url))}>
            <img src={mediaUrl(item.file_url)} alt={item.title} loading="lazy" />
          </div>
        </div>
      ) : <div style={{ color: 'var(--muted)', fontSize: 13 }}>No image uploaded yet.</div>;
    } else {
      body = (
        <div className="content-text">
          <p>{item.content || ''}</p>
          {item.file_url && <a href={item.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--t600)' }}>{item.file_url}</a>}
        </div>
      );
    }

    openModal(
      <>
        <div className="modal-header">
          <h2 className="modal-title">{item.title}</h2>
          <button className="modal-close" onClick={closeModal}>✕</button>
        </div>
        {body}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{item.done ? '✓ Completed' : 'Mark as complete when done'}</span>
          {!item.done
            ? <button className="btn btn-green" onClick={() => markDone(item.id)}>✓ Mark Complete</button>
            : <span style={{ color: 'var(--g600)', fontWeight: 600 }}>✓ Done</span>}
        </div>
      </>, true
    );
  };

  if (!mod) return <div style={{ padding: '2rem', color: 'var(--muted)' }}>Loading...</div>;

  const pct = Math.round(mod.my_progress || 0);
  const icons = { video: '🎬', image: '🖼️', text: '📄', link: '🔗' };

  return (
    <div className="page active" style={{ animation: 'fadeIn 0.22s ease' }}>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }} onClick={() => navigate('/modules')}>← Back to Modules</button>
      <div className="mod-detail-hero">
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <span className={`tag ${TOPIC_COLORS[mod.topic] || 'tag-gray'}`}>{mod.topic}</span>
          <span className={`tag ${LEVEL_COLORS[mod.level] || 'tag-gray'}`}>{mod.level}</span>
          {!mod.is_published && <span className="tag tag-amber">Draft</span>}
        </div>
        <h1>{mod.title}</h1>
        <p>{mod.description || ''}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}><span>Overall Progress</span><span>{pct}%</span></div>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 100, height: 6 }}><div style={{ width: `${pct}%`, height: 6, borderRadius: 100, background: '#fff', transition: 'width 0.5s' }} /></div>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{mod.item_count || 0} items · +{mod.points_reward} pts</div>
        </div>
      </div>

      <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: '1rem', marginBottom: 10 }}>Content Items</h3>
      <div className="items-list">
        {(mod.items || []).length ? mod.items.map(item => (
          <div key={item.id} className={`item-row ${item.done ? 'done' : ''}`} onClick={() => openItem(item)}>
            <div className="item-icon" style={{ background: `var(--${item.done ? 'g' : 't'}50)` }}>{icons[item.type] || '📄'}</div>
            <div className="item-info">
              <div className="item-title">{item.title}</div>
              <div className="item-meta">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}{item.duration_seconds ? ` · ${Math.floor(item.duration_seconds / 60)}min` : ''}</div>
            </div>
            {item.done ? <div style={{ color: 'var(--g400)', fontSize: 18 }}>✓</div> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid var(--border2)', flexShrink: 0 }} />}
          </div>
        )) : <div style={{ color: 'var(--muted)', fontSize: 13, padding: '1rem 0' }}>No items in this module yet.</div>}
      </div>

      {mod.quizzes?.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: '1rem', marginBottom: 10 }}>Module Quizzes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mod.quizzes.map(q => (
              <div key={q.id} style={{ background: 'var(--card)', border: '0.5px solid var(--border)', borderRadius: 'var(--rad-sm)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: '1.2rem' }}>✏️</span><span style={{ fontSize: 14, fontWeight: 500 }}>{q.title}</span></div>
                <button className="btn btn-teal btn-sm" onClick={() => navigate(`/quizzes/${q.id}`)}>Take Quiz</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
