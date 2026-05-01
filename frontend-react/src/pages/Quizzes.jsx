import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { api('GET', '/quizzes').then(setQuizzes).catch(() => {}); }, []);

  return (
    <div className="page active" style={{ animation: 'fadeIn 0.22s ease' }}>
      <div className="page-header">
        <h1 className="page-title">Quizzes</h1>
        <p className="page-sub">Test your knowledge and earn eco points</p>
      </div>
      <div className="grid-2">
        {quizzes.length ? quizzes.map(q => (
          <div key={q.id} className="card card-hover" onClick={() => navigate(`/quizzes/${q.id}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontSize: '2rem' }}>✏️</div>
              {q.my_last_score != null
                ? <span className={`tag ${q.my_last_score >= q.pass_score_percent ? 'tag-green' : 'tag-red'}`}>{Math.round(q.my_last_score)}%</span>
                : <span className="tag tag-gray">Not taken</span>}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{q.title}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>{q.module_title ? `Module: ${q.module_title}` : ''}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', paddingTop: 10, borderTop: '0.5px solid var(--border)' }}>
              <span>{q.question_count || 0} questions</span>
              <span>Pass: {q.pass_score_percent}%</span>
            </div>
          </div>
        )) : <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>No quizzes available yet</div>}
      </div>
    </div>
  );
}
