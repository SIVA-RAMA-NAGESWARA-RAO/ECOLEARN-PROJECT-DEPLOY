import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TOPIC_COLORS, TOPIC_ICONS } from '../services/helpers';
import ModuleCard from '../components/ModuleCard';

const TOPICS = ['all', 'energy', 'waste', 'diet', 'water', 'biodiversity', 'cities', 'other'];

export default function Modules() {
  const [modules, setModules] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => { load(); }, [filter]);

  const load = async () => {
    const m = await api('GET', `/modules${filter !== 'all' ? `?topic=${filter}` : ''}`);
    setModules(m);
  };

  return (
    <div className="page active" style={{ animation: 'fadeIn 0.22s ease' }}>
      <div className="page-header">
        <h1 className="page-title">Modules</h1>
        <p className="page-sub">Complete modules to earn points and track your sustainability learning</p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {TOPICS.map(t => (
          <button key={t} className={`btn btn-sm ${filter === t ? 'btn-teal' : 'btn-ghost'}`} onClick={() => setFilter(t)}>
            {t === 'all' ? 'All Topics' : `${TOPIC_ICONS[t] || ''} ${t.charAt(0).toUpperCase() + t.slice(1)}`}
          </button>
        ))}
      </div>
      <div className="grid-3">
        {modules.length ? modules.map(m => <ModuleCard key={m.id} m={m} />) :
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>No modules found</div>}
      </div>
    </div>
  );
}
