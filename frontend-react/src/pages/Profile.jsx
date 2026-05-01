import { useState, useEffect, useRef } from 'react';
import { api, mediaUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { fmt } from '../services/helpers';
import { showToast } from '../components/UI';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    api('GET', '/auth/me').then(u => { setProfile(u); refreshUser(); }).catch(() => {});
  }, []);

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      await api('POST', '/auth/avatar', fd, true);
      showToast('Avatar updated!', 'success');
      const u = await api('GET', '/auth/me');
      setProfile(u);
      await refreshUser();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const u = profile || user;
  if (!u) return null;

  return (
    <div className="page active" style={{ animation: 'fadeIn 0.22s ease' }}>
      <div className="page-header"><h1 className="page-title">My Profile</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
        <div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 80, margin: '0 auto 1rem' }}>
              <div className="avatar" style={{ width: 80, height: 80, fontSize: '2rem', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
                {u.avatar_url ? <img src={mediaUrl(u.avatar_url)} alt="" /> : (u.name || 'U').charAt(0)}
              </div>
              <div style={{ position: 'absolute', bottom: 0, right: -4, width: 24, height: 24, background: 'var(--t400)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>✏️</div>
            </div>
            <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={uploadAvatar} />
            <div style={{ fontSize: 16, fontWeight: 600 }}>{u.name}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>{u.email}</div>
            <div style={{ marginTop: 8 }}><span className={`tag ${u.role === 'admin' ? 'tag-red' : 'tag-teal'}`}>{u.role}</span></div>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '0.5px solid var(--border)' }}>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: '2rem', color: 'var(--g600)' }}>{fmt(u.eco_points)}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Eco Points Earned</div>
            </div>
          </div>
        </div>
        <div>
          <div className="card">
            <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', marginBottom: '1.25rem' }}>Account Details</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div><div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Full Name</div><div style={{ fontSize: 14 }}>{u.name}</div></div>
              <div><div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Email</div><div style={{ fontSize: 14 }}>{u.email}</div></div>
              <div><div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Role</div><div style={{ fontSize: 14 }}>{u.role}</div></div>
              <div><div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Member Since</div><div style={{ fontSize: 14 }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
