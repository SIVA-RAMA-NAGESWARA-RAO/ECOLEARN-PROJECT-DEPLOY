import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { fmt } from '../services/helpers';
import { mediaUrl } from '../services/api';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = location.pathname;

  const isActive = (path) => currentPage === path || currentPage.startsWith(path + '/');

  return (
    <div id="app">
      <Topbar user={user} navigate={navigate} />
      <div className="main-content">
        <Sidebar
          currentPage={currentPage}
          navigate={navigate}
          role={user?.role}
          logout={logout}
          isActive={isActive}
        />
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}

function Topbar({ user, navigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  const doSearch = (q) => {
    setQuery(q);
    clearTimeout(timer.current);
    if (q.length < 2) { setOpen(false); return; }
    timer.current = setTimeout(async () => {
      try {
        const data = await api('GET', `/search?q=${encodeURIComponent(q)}`);
        setResults(data);
        setOpen(true);
      } catch {}
    }, 300);
  };

  const goTo = (type, id) => {
    setOpen(false);
    setQuery('');
    if (type === 'module') navigate(`/modules/${id}`);
    else if (type === 'quiz') navigate(`/quizzes/${id}`);
    else navigate('/assignments');
  };

  const allResults = results
    ? [
        ...(results.modules || []).map(m => ({ ...m, _type: 'Module' })),
        ...(results.quizzes || []).map(m => ({ ...m, _type: 'Quiz' })),
        ...(results.assignments || []).map(m => ({ ...m, _type: 'Assignment' })),
      ]
    : [];

  return (
    <div className="topbar">
      <div className="logo" onClick={() => navigate('/')}>
        <div className="logo-mark">🌿</div>
        EcoLearn
      </div>
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Search modules, quizzes, assignments..."
          value={query}
          onChange={e => doSearch(e.target.value)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
        {open && (
          <div className="search-results open">
            {allResults.length ? allResults.map(r => (
              <div key={`${r.type}-${r.id}`} className="sr-item" onClick={() => goTo(r.type, r.id)}>
                <span className={`sr-type tag tag-${r.type === 'module' ? 'teal' : r.type === 'quiz' ? 'amber' : 'blue'}`}>{r._type}</span>
                <span>{r.title}</span>
              </div>
            )) : (
              <div style={{ padding: '1rem', textAlign: 'center', fontSize: '13px', color: 'var(--muted)' }}>No results found</div>
            )}
          </div>
        )}
      </div>
      <div className="topbar-right">
        <div className="pts-badge">{fmt(user?.eco_points)} pts</div>
        <div className="avatar" onClick={() => navigate('/profile')}>
          {user?.avatar_url
            ? <img src={mediaUrl(user.avatar_url)} alt="" />
            : (user?.name || 'U').charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ currentPage, navigate, role, logout, isActive }) {
  return (
    <div className="sidebar">
      <div className="nav-section">
        <div className="nav-label">Learn</div>
        <div className={`nav-item ${isActive('/') && currentPage === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>
          <span className="ni">🏠</span>Home
        </div>
        <div className={`nav-item ${isActive('/modules') ? 'active' : ''}`} onClick={() => navigate('/modules')}>
          <span className="ni">📚</span>Modules
        </div>
        <div className={`nav-item ${isActive('/quizzes') ? 'active' : ''}`} onClick={() => navigate('/quizzes')}>
          <span className="ni">✏️</span>Quizzes
        </div>
        <div className={`nav-item ${isActive('/assignments') ? 'active' : ''}`} onClick={() => navigate('/assignments')}>
          <span className="ni">📋</span>Assignments
        </div>
      </div>
      <div className="nav-section">
        <div className="nav-label">Community</div>
        <div className={`nav-item ${isActive('/leaderboard') ? 'active' : ''}`} onClick={() => navigate('/leaderboard')}>
          <span className="ni">🏆</span>Leaderboard
        </div>
      </div>
      {role === 'admin' && (
        <div className="nav-section">
          <div className="nav-label">Admin</div>
          <div className={`nav-item ${isActive('/admin/modules') ? 'active' : ''}`} onClick={() => navigate('/admin/modules')}>
            <span className="ni">🗂️</span>Manage Modules
          </div>
          <div className={`nav-item ${isActive('/admin/quizzes') ? 'active' : ''}`} onClick={() => navigate('/admin/quizzes')}>
            <span className="ni">📝</span>Manage Quizzes
          </div>
          <div className={`nav-item ${isActive('/admin/assignments') ? 'active' : ''}`} onClick={() => navigate('/admin/assignments')}>
            <span className="ni">📌</span>Manage Assignments
          </div>
          <div className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`} onClick={() => navigate('/admin/users')}>
            <span className="ni">👥</span>Users
          </div>
          <div className={`nav-item ${isActive('/admin/analytics') ? 'active' : ''}`} onClick={() => navigate('/admin/analytics')}>
            <span className="ni">📊</span>Analytics
          </div>
        </div>
      )}
      <div style={{ marginTop: 'auto', padding: '0.75rem' }}>
        <div className={`nav-item ${isActive('/profile') ? 'active' : ''}`} onClick={() => navigate('/profile')}>
          <span className="ni">👤</span>My Profile
        </div>
        <div className="nav-item" onClick={() => { logout(); navigate('/login'); }} style={{ color: 'var(--r400)' }}>
          <span className="ni">🚪</span>Sign Out
        </div>
      </div>
    </div>
  );
}
