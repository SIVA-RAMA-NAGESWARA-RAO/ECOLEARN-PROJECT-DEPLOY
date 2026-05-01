import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { showToast, openModal, closeModal } from '../components/UI';

export default function QuizTake() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => { api('GET', `/quizzes/${id}`).then(setQuiz).catch(e => showToast(e.message, 'error')); }, [id]);

  const selectOpt = (qId, optId) => {
    setAnswers(prev => ({ ...prev, [qId]: { question_id: qId, selected_option_id: optId } }));
  };

  const submit = async () => {
    const ans = Object.values(answers);
    if (!ans.length && quiz?.questions?.length) {
      if (!confirm("You haven't answered any questions. Submit anyway?")) return;
    }
    try {
      const result = await api('POST', `/quizzes/${id}/submit`, { answers: ans });
      await refreshUser();
      showResult(result);
    } catch (e) { showToast(e.message, 'error'); }
  };

  const showResult = (result) => {
    openModal(
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>{result.passed ? '🎉' : '😔'}</div>
        <h2 className="modal-title" style={{ marginBottom: 6 }}>{result.passed ? 'Quiz Passed!' : 'Try Again'}</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: '1.5rem' }}>
          {result.passed ? `Great work! You earned ${result.earned_points} eco points.` : 'Keep learning and try again!'}
        </p>
        <div style={{ background: result.passed ? 'var(--g50)' : 'var(--r50)', borderRadius: 'var(--rad)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: '3rem', fontWeight: 500, color: result.passed ? 'var(--g800)' : 'var(--r800)' }}>{Math.round(result.score_percent)}%</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{result.earned_points} / {result.total_points} points</div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={() => { closeModal(); navigate('/quizzes'); }}>All Quizzes</button>
          {result.passed
            ? <button className="btn btn-teal" onClick={closeModal}>Continue</button>
            : <button className="btn btn-teal" onClick={() => { closeModal(); setAnswers({}); api('GET', `/quizzes/${id}`).then(setQuiz); }}>Retry</button>}
        </div>
      </div>
    );
  };

  if (!quiz) return <div style={{ padding: '2rem', color: 'var(--muted)' }}>Loading...</div>;

  return (
    <div className="page active" style={{ animation: 'fadeIn 0.22s ease' }}>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }} onClick={() => navigate('/quizzes')}>← Back to Quizzes</button>
      <div style={{ background: 'linear-gradient(135deg,var(--t800),var(--t600))', borderRadius: 'var(--rad)', padding: '1.5rem', color: '#fff', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: '1.5rem', marginBottom: 4 }}>{quiz.title}</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{quiz.description || ''} · {quiz.questions?.length || 0} questions · Pass: {quiz.pass_score_percent}%</p>
      </div>

      {(quiz.questions || []).map((q, i) => (
        <div key={q.id} className="quiz-q">
          <div className="quiz-q-num">Question {i + 1} of {quiz.questions.length} · {q.points} pts</div>
          <div className="quiz-q-text">{q.question_text}</div>
          {(q.question_type === 'mcq' || q.question_type === 'multi') && (q.options || []).map(o => (
            <div key={o.id} className={`opt ${answers[q.id]?.selected_option_id === o.id ? 'selected' : ''}`} onClick={() => selectOpt(q.id, o.id)}>
              <div className="opt-dot" />{o.option_text}
            </div>
          ))}
          {q.question_type === 'short_answer' && (
            <textarea className="form-input form-textarea" placeholder="Type your answer..." onChange={e => setAnswers(prev => ({ ...prev, [q.id]: { question_id: q.id, text_answer: e.target.value } }))} />
          )}
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '1.5rem' }}>
        <button className="btn btn-teal" onClick={submit}>Submit Quiz →</button>
      </div>
    </div>
  );
}
