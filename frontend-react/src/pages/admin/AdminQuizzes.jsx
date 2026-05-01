import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { showToast, openModal, closeModal } from '../../components/UI';

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [modules, setModules] = useState([]);
  const load = async () => {
    const [q, m] = await Promise.all([api('GET', '/quizzes'), api('GET', '/modules')]);
    setQuizzes(q); setModules(m);
  };
  useEffect(() => { load(); }, []);

  const togglePublish = async (id, val) => {
    await api('PATCH', `/quizzes/${id}/publish`, { is_published: val });
    showToast(val ? 'Quiz published!' : 'Quiz unpublished', 'success');
    await load();
  };

  const del = async (id) => {
    if (!confirm('Delete this quiz?')) return;
    await api('DELETE', `/quizzes/${id}`);
    showToast('Quiz deleted', 'success');
    await load();
  };

  return (
    <div className="page active" style={{ animation: 'fadeIn 0.22s ease' }}>
      <div className="admin-header">
        <div><h1>Manage Quizzes</h1><p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>{quizzes.length} quizzes total</p></div>
        <button className="btn btn-teal" onClick={() => openModal(<QuizBuilder modules={modules} onDone={() => { closeModal(); load(); }} />, true)}>+ Create Quiz</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Title</th><th>Module</th><th>Questions</th><th>Pass Score</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {quizzes.map(q => (
              <tr key={q.id}>
                <td style={{ fontWeight: 500 }}>{q.title}</td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{q.module_title || 'Standalone'}</td>
                <td>{q.question_count || 0}</td>
                <td>{q.pass_score_percent}%</td>
                <td><span className={`tag ${q.is_published ? 'tag-green' : 'tag-amber'}`}>{q.is_published ? 'Published' : 'Draft'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" style={{ color: q.is_published ? 'var(--a400)' : 'var(--g600)' }} onClick={() => togglePublish(q.id, q.is_published ? 0 : 1)}>{q.is_published ? 'Unpublish' : 'Publish'}</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--r400)' }} onClick={() => del(q.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuizBuilder({ modules, onDone }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [passScore, setPassScore] = useState(60);
  const [questions, setQuestions] = useState([
    { id: 1, text: '', type: 'mcq', points: 10, options: [{ text: '', correct: false }, { text: '', correct: false }, { text: '', correct: false }, { text: '', correct: false }] }
  ]);

  const addQ = () => {
    setQuestions([...questions, { id: Date.now(), text: '', type: 'mcq', points: 10, options: [{ text: '', correct: false }, { text: '', correct: false }] }]);
  };

  const removeQ = (id) => setQuestions(questions.filter(q => q.id !== id));
  const updateQ = (idx, field, val) => { const q = [...questions]; q[idx][field] = val; setQuestions(q); };
  const updateOpt = (qi, oi, field, val) => { const q = [...questions]; q[qi].options[oi][field] = val; setQuestions(q); };
  const addOpt = (qi) => { const q = [...questions]; q[qi].options.push({ text: '', correct: false }); setQuestions(q); };
  const removeOpt = (qi, oi) => { const q = [...questions]; q[qi].options.splice(oi, 1); setQuestions(q); };

  const submit = async () => {
    if (!title) return showToast('Title required', 'error');
    const payload = {
      title, description: desc, module_id: moduleId || null, pass_score_percent: passScore,
      questions: questions.map(q => ({
        question_text: q.text, question_type: q.type, points: q.points,
        options: q.options.map(o => ({ option_text: o.text, is_correct: o.correct }))
      }))
    };
    await api('POST', '/quizzes', payload);
    showToast('Quiz created!', 'success');
    onDone();
  };

  return (
    <>
      <div className="modal-header"><h2 className="modal-title">Create Quiz</h2><button className="modal-close" onClick={closeModal}>✕</button></div>
      <div className="form-group"><label className="form-label">Quiz Title *</label><input className="form-input" value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={desc} onChange={e => setDesc(e.target.value)} style={{ minHeight: 60 }} /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Module (optional)</label><select className="form-select" value={moduleId} onChange={e => setModuleId(e.target.value)}><option value="">Standalone Quiz</option>{modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Pass Score (%)</label><input className="form-input" type="number" value={passScore} onChange={e => setPassScore(e.target.value)} /></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: '1rem' }}>Questions</h3>
        <button className="btn btn-ghost btn-sm" onClick={addQ}>+ Add Question</button>
      </div>
      {questions.map((q, qi) => (
        <div key={q.id} className="qbuilder-q">
          <div className="qb-head">
            <div className="qb-num">{qi + 1}</div>
            <input className="form-input" style={{ flex: 1 }} placeholder="Question text" value={q.text} onChange={e => updateQ(qi, 'text', e.target.value)} />
            <select className="form-select" style={{ width: 130 }} value={q.type} onChange={e => updateQ(qi, 'type', e.target.value)}>
              <option value="mcq">MCQ</option><option value="short_answer">Short Answer</option>
            </select>
            <input className="form-input" style={{ width: 70 }} type="number" value={q.points} onChange={e => updateQ(qi, 'points', +e.target.value)} />
            {questions.length > 1 && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--r400)', padding: '6px 8px' }} onClick={() => removeQ(q.id)}>✕</button>}
          </div>
          {q.type !== 'short_answer' && (
            <div style={{ paddingLeft: 32 }}>
              {q.options.map((o, oi) => (
                <div key={oi} className="opt-builder">
                  <input type="checkbox" checked={o.correct} onChange={e => updateOpt(qi, oi, 'correct', e.target.checked)} />
                  <input className="form-input" placeholder={`Option ${oi + 1}`} value={o.text} onChange={e => updateOpt(qi, oi, 'text', e.target.value)} />
                  {q.options.length > 2 && <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', color: 'var(--muted)' }} onClick={() => removeOpt(qi, oi)}>✕</button>}
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 4 }} onClick={() => addOpt(qi)}>+ Add Option</button>
            </div>
          )}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
        <button className="btn btn-teal" onClick={submit}>Create Quiz</button>
      </div>
    </>
  );
}
