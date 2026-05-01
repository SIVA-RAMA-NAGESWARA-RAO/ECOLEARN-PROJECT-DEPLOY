import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { fmt } from '../services/helpers';
import ModuleCard from '../components/ModuleCard';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    Promise.all([api('GET', '/modules'), api('GET', '/quizzes')])
      .then(([m, q]) => { setModules(m); setQuizzes(q); })
      .catch(() => {});
  }, []);

  const done = modules.filter(m => m.my_completed).length;
  const inProg = modules.filter(m => m.my_progress > 0 && !m.my_completed).length;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="page active" style={{ animation: 'fadeIn 0.22s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        <div>
          <h1 className="page-title serif">Good to see you, {user?.name?.split(' ')[0]} 🌿</h1>
          <p className="page-sub">{isAdmin ? 'Admin Dashboard — manage content and track student progress' : 'Continue your sustainability learning journey'}</p>
        </div>
        {isAdmin && <button className="btn btn-green" onClick={() => navigate('/admin/modules')}>+ New Module</button>}
      </div>
      <div className="grid-stats">
        <div className="stat-card"><div className="stat-label">Eco Points</div><div className="stat-val" style={{ color: 'var(--g600)' }}>{fmt(user?.eco_points)}</div><div className="stat-sub">lifetime earned</div></div>
        <div className="stat-card"><div className="stat-label">Completed</div><div className="stat-val" style={{ color: 'var(--t600)' }}>{done}</div><div className="stat-sub">modules finished</div></div>
        <div className="stat-card"><div className="stat-label">In Progress</div><div className="stat-val" style={{ color: 'var(--a400)' }}>{inProg}</div><div className="stat-sub">modules started</div></div>
        <div className="stat-card"><div className="stat-label">Quizzes</div><div className="stat-val" style={{ color: 'var(--b600)' }}>{quizzes.filter(q => q.my_last_score != null).length}</div><div className="stat-sub">attempted</div></div>
      </div>
      {inProg > 0 && (
        <>
          <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', marginBottom: '1rem' }}>Continue Learning</h3>
          <div className="grid-3" style={{ marginBottom: '1.75rem' }}>
            {modules.filter(m => m.my_progress > 0 && !m.my_completed).slice(0, 3).map(m => <ModuleCard key={m.id} m={m} />)}
          </div>
        </>
      )}
      <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.1rem', marginBottom: '1rem' }}>{isAdmin ? 'All Modules' : 'Latest Modules'}</h3>
      <div className="grid-3">
        {modules.slice(0, 6).map(m => <ModuleCard key={m.id} m={m} />)}
      </div>
      {modules.length > 6 && (
        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/modules')}>View all {modules.length} modules →</button>
        </div>
      )}
    </div>
  );
}
