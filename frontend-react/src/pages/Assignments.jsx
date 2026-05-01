import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { showToast, openModal, closeModal } from '../components/UI';

export default function Assignments() {
  const [assigns, setAssigns] = useState([]);
  const load = async () => { setAssigns(await api('GET', '/assignments')); };
  useEffect(() => { load(); }, []);

  const statusColor = { submitted: 'tag-blue', graded: 'tag-green', returned: 'tag-teal' };

  const openSubmit = (a) => {
    openModal(<SubmitForm assignment={a} onDone={() => { closeModal(); load(); }} />);
  };

  return (
    <div className="page active" style={{ animation: 'fadeIn 0.22s ease' }}>
      <div className="page-header">
        <h1 className="page-title">Assignments</h1>
        <p className="page-sub">Submit your work and get feedback from educators</p>
      </div>
      {assigns.length ? assigns.map(a => (
        <div key={a.id} className="assign-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h3>{a.title}</h3>
              <div className="desc">{a.description || ''}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {a.module_title && <span className="tag tag-teal">{a.module_title}</span>}
                {a.due_date && <span className="tag tag-amber">Due: {new Date(a.due_date).toLocaleDateString()}</span>}
                <span className="tag tag-gray">Max Score: {a.max_score}</span>
                {a.my_status && <span className={`tag ${statusColor[a.my_status] || 'tag-gray'}`}>{a.my_status}</span>}
                {a.my_score != null && <span className="tag tag-green">Score: {a.my_score}/{a.max_score}</span>}
              </div>
            </div>
            <button className="btn btn-teal btn-sm" onClick={() => openSubmit(a)}>{a.my_status ? 'Resubmit' : 'Submit'}</button>
          </div>
        </div>
      )) : <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>No assignments yet</div>}
    </div>
  );
}

function SubmitForm({ assignment, onDone }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  const submit = async () => {
    if (!text.trim() && !file) return showToast('Please provide a response or upload a file', 'error');
    const fd = new FormData();
    if (text) fd.append('text_response', text);
    if (file) fd.append('file', file);
    try {
      await api('POST', `/assignments/${assignment.id}/submit`, fd, true);
      showToast('Assignment submitted! ✓', 'success');
      onDone();
    } catch (e) { showToast(e.message, 'error'); }
  };

  return (
    <>
      <div className="modal-header">
        <h2 className="modal-title">Submit Assignment</h2>
        <button className="modal-close" onClick={closeModal}>✕</button>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: '1.25rem' }}>{assignment.title}</p>
      <div className="form-group">
        <label className="form-label">Written Response</label>
        <textarea className="form-textarea" placeholder="Type your response here..." style={{ minHeight: 120 }} value={text} onChange={e => setText(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Upload File (Optional)</label>
        <div className="upload-zone" onClick={() => fileRef.current?.click()}>
          <input type="file" ref={fileRef} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.zip" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
          <div className="upload-icon">📁</div>
          <div className="upload-text">Click to upload<br /><span style={{ fontSize: 11 }}>PDF, Word, Images, Video, ZIP up to 50MB</span></div>
          {file && <div className="upload-preview"><span>📎 {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)</span></div>}
        </div>
      </div>
      <button className="btn btn-teal btn-full" onClick={submit}>Submit Assignment</button>
    </>
  );
}
