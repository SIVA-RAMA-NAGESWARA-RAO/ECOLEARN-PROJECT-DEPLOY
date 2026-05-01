import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { showToast, openModal, closeModal } from '../../components/UI';

export default function AdminAssignments() {
  const [assigns, setAssigns] = useState([]);
  const [modules, setModules] = useState([]);
  const load = async () => {
    const [a, m] = await Promise.all([api('GET', '/assignments'), api('GET', '/modules')]);
    setAssigns(a); setModules(m);
  };
  useEffect(() => { load(); }, []);

  const del = async (id) => { if (!confirm('Delete this assignment?')) return; await api('DELETE', `/assignments/${id}`); showToast('Deleted', 'success'); await load(); };

  return (
    <div className="page active" style={{ animation: 'fadeIn 0.22s ease' }}>
      <div className="admin-header">
        <div><h1>Manage Assignments</h1><p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>{assigns.length} assignments</p></div>
        <button className="btn btn-teal" onClick={() => openModal(<CreateAssignForm modules={modules} onDone={() => { closeModal(); load(); }} />)}>+ New Assignment</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Title</th><th>Module</th><th>Due Date</th><th>Submissions</th><th>Actions</th></tr></thead>
          <tbody>
            {assigns.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 500 }}>{a.title}</td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{a.module_title || 'Standalone'}</td>
                <td style={{ fontSize: 12, color: 'var(--muted)' }}>{a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No deadline'}</td>
                <td><span className="tag tag-teal">{a.submission_count || 0} submitted</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openModal(<SubmissionsView id={a.id} title={a.title} />, true)}>View Submissions</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--r400)' }} onClick={() => del(a.id)}>Delete</button>
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

function CreateAssignForm({ modules, onDone }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [due, setDue] = useState('');
  const [score, setScore] = useState(100);

  const submit = async () => {
    if (!title) return showToast('Title required', 'error');
    await api('POST', '/assignments', { title, description: desc, module_id: moduleId || null, due_date: due || null, max_score: score });
    showToast('Assignment created!', 'success');
    onDone();
  };

  return (
    <>
      <div className="modal-header"><h2 className="modal-title">Create Assignment</h2><button className="modal-close" onClick={closeModal}>✕</button></div>
      <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={desc} onChange={e => setDesc(e.target.value)} style={{ minHeight: 100 }} /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Module</label><select className="form-select" value={moduleId} onChange={e => setModuleId(e.target.value)}><option value="">Standalone</option>{modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Due Date</label><input className="form-input" type="datetime-local" value={due} onChange={e => setDue(e.target.value)} /></div>
      </div>
      <div className="form-group"><label className="form-label">Max Score</label><input className="form-input" type="number" value={score} onChange={e => setScore(e.target.value)} /></div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><button className="btn btn-ghost" onClick={closeModal}>Cancel</button><button className="btn btn-green" onClick={submit}>Create Assignment</button></div>
    </>
  );
}

function SubmissionsView({ id, title }) {
  const [subs, setSubs] = useState([]);
  useEffect(() => { api('GET', `/assignments/${id}/submissions`).then(setSubs).catch(() => {}); }, [id]);

  const grade = (userId, name) => {
    openModal(<GradeForm assignId={id} userId={userId} name={name} />);
  };

  return (
    <>
      <div className="modal-header"><h2 className="modal-title">Submissions: {title}</h2><button className="modal-close" onClick={closeModal}>✕</button></div>
      {subs.length ? (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Submitted</th><th>Status</th><th>Score</th><th>Actions</th></tr></thead>
            <tbody>
              {subs.map(s => (
                <tr key={s.user_id}>
                  <td><div style={{ fontWeight: 500 }}>{s.name}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.email}</div></td>
                  <td style={{ fontSize: 12 }}>{new Date(s.submitted_at).toLocaleString()}</td>
                  <td><span className={`tag ${s.status === 'graded' ? 'tag-green' : 'tag-blue'}`}>{s.status}</span></td>
                  <td>{s.score != null ? s.score : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {s.text_response && <button className="btn btn-ghost btn-sm" onClick={() => alert(s.text_response)}>View Text</button>}
                      <button className="btn btn-ghost btn-sm" onClick={() => grade(s.user_id, s.name)}>Grade</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>No submissions yet</div>}
    </>
  );
}

function GradeForm({ assignId, userId, name }) {
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  const submit = async () => {
    await api('PATCH', `/assignments/${assignId}/submissions/${userId}/grade`, { score: +score, feedback });
    closeModal();
    showToast('Grade submitted!', 'success');
  };

  return (
    <>
      <div className="modal-header"><h2 className="modal-title">Grade: {name}</h2><button className="modal-close" onClick={closeModal}>✕</button></div>
      <div className="form-group"><label className="form-label">Score</label><input className="form-input" type="number" min="0" max="100" value={score} onChange={e => setScore(e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Feedback</label><textarea className="form-textarea" value={feedback} onChange={e => setFeedback(e.target.value)} /></div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><button className="btn btn-ghost" onClick={closeModal}>Cancel</button><button className="btn btn-green" onClick={submit}>Submit Grade</button></div>
    </>
  );
}
