import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { TOPIC_COLORS, TOPICS, LEVELS } from '../../services/helpers';
import { showToast, openModal, closeModal } from '../../components/UI';

export default function AdminModules() {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const load = async () => { setModules(await api('GET', '/modules')); };
  useEffect(() => { load(); }, []);

  const togglePublish = async (id, val) => {
    await api('PUT', `/modules/${id}`, { is_published: val });
    showToast(val ? 'Module published!' : 'Module unpublished', 'success');
    await load();
  };

  const del = async (id) => {
    if (!confirm('Delete this module and all its content?')) return;
    await api('DELETE', `/modules/${id}`);
    showToast('Module deleted', 'success');
    await load();
  };

  return (
    <div className="page active" style={{ animation: 'fadeIn 0.22s ease' }}>
      <div className="admin-header">
        <div><h1>Manage Modules</h1><p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>{modules.length} total modules</p></div>
        <button className="btn btn-teal" onClick={() => openModal(<CreateModuleForm onDone={() => { closeModal(); load(); }} />, true)}>+ New Module</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Title</th><th>Topic</th><th>Level</th><th>Items</th><th>Points</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {modules.map(m => (
              <tr key={m.id}>
                <td style={{ fontWeight: 500, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</td>
                <td><span className={`tag ${TOPIC_COLORS[m.topic] || 'tag-gray'}`}>{m.topic}</span></td>
                <td>{m.level}</td>
                <td>{m.item_count || 0}</td>
                <td style={{ color: 'var(--g800)', fontWeight: 600 }}>+{m.points_reward}</td>
                <td><span className={`tag ${m.is_published ? 'tag-green' : 'tag-amber'}`}>{m.is_published ? 'Published' : 'Draft'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/modules/${m.id}`)}>View</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => openModal(<EditModuleForm id={m.id} onDone={() => { closeModal(); load(); }} />, true)}>Edit</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--t600)' }} onClick={() => openModal(<AddItemForm moduleId={m.id} title={m.title} onDone={() => { closeModal(); load(); }} />, true)}>+ Item</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: m.is_published ? 'var(--a400)' : 'var(--g600)' }} onClick={() => togglePublish(m.id, m.is_published ? 0 : 1)}>{m.is_published ? 'Unpublish' : 'Publish'}</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--r400)' }} onClick={() => del(m.id)}>Delete</button>
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

function CreateModuleForm({ onDone }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [topic, setTopic] = useState('energy');
  const [level, setLevel] = useState('Beginner');
  const [points, setPoints] = useState(100);
  const [thumb, setThumb] = useState(null);

  const submit = async () => {
    if (!title) return showToast('Title required', 'error');
    const fd = new FormData();
    fd.append('title', title); fd.append('description', desc); fd.append('topic', topic);
    fd.append('level', level); fd.append('points_reward', points);
    if (thumb) fd.append('thumbnail', thumb);
    await api('POST', '/modules', fd, true);
    showToast('Module created!', 'success');
    onDone();
  };

  return (
    <>
      <div className="modal-header"><h2 className="modal-title">Create New Module</h2><button className="modal-close" onClick={closeModal}>✕</button></div>
      <div className="form-group"><label className="form-label">Module Title *</label><input className="form-input" placeholder="e.g. Introduction to Solar Energy" value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" placeholder="What will students learn?" value={desc} onChange={e => setDesc(e.target.value)} /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Topic</label>
          <select className="form-select" value={topic} onChange={e => setTopic(e.target.value)}>
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Level</label>
          <select className="form-select" value={level} onChange={e => setLevel(e.target.value)}>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group"><label className="form-label">Points Reward</label><input className="form-input" type="number" value={points} onChange={e => setPoints(e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Thumbnail Image</label><input type="file" accept="image/*" onChange={e => setThumb(e.target.files[0])} /></div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
        <button className="btn btn-green" onClick={submit}>Create Module</button>
      </div>
    </>
  );
}

function EditModuleForm({ id, onDone }) {
  const [mod, setMod] = useState(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('');
  const [points, setPoints] = useState(100);
  const [thumb, setThumb] = useState(null);

  useEffect(() => {
    api('GET', `/modules/${id}`).then(m => {
      setMod(m); setTitle(m.title); setDesc(m.description || '');
      setTopic(m.topic); setLevel(m.level); setPoints(m.points_reward);
    });
  }, [id]);

  const submit = async () => {
    const fd = new FormData();
    fd.append('title', title); fd.append('description', desc); fd.append('topic', topic);
    fd.append('level', level); fd.append('points_reward', points);
    if (thumb) fd.append('thumbnail', thumb);
    await api('PUT', `/modules/${id}`, fd, true);
    showToast('Module updated!', 'success');
    onDone();
  };

  if (!mod) return <div>Loading...</div>;
  return (
    <>
      <div className="modal-header"><h2 className="modal-title">Edit Module</h2><button className="modal-close" onClick={closeModal}>✕</button></div>
      <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={desc} onChange={e => setDesc(e.target.value)} /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Topic</label><select className="form-select" value={topic} onChange={e => setTopic(e.target.value)}>{TOPICS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Level</label><select className="form-select" value={level} onChange={e => setLevel(e.target.value)}>{LEVELS.map(l => <option key={l}>{l}</option>)}</select></div>
      </div>
      <div className="form-group"><label className="form-label">Points</label><input className="form-input" type="number" value={points} onChange={e => setPoints(e.target.value)} /></div>
      <div className="form-group"><label className="form-label">New Thumbnail</label><input type="file" accept="image/*" onChange={e => setThumb(e.target.files[0])} /></div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><button className="btn btn-ghost" onClick={closeModal}>Cancel</button><button className="btn btn-green" onClick={submit}>Save Changes</button></div>
    </>
  );
}

function AddItemForm({ moduleId, title, onDone }) {
  const [type, setType] = useState('text');
  const [itemTitle, setItemTitle] = useState('');
  const [content, setContent] = useState('');
  const [order, setOrder] = useState(1);
  const [duration, setDuration] = useState('');
  const [file, setFile] = useState(null);

  const submit = async () => {
    if (!itemTitle) return showToast('Title required', 'error');
    const fd = new FormData();
    fd.append('type', type); fd.append('title', itemTitle); fd.append('order_index', order);
    if (type === 'text' || type === 'link') fd.append('content', content);
    if (type === 'video') fd.append('duration_seconds', duration || 0);
    if (file) fd.append('file', file);
    await api('POST', `/modules/${moduleId}/items`, fd, true);
    showToast('Item added!', 'success');
    onDone();
  };

  return (
    <>
      <div className="modal-header"><h2 className="modal-title">Add Item to Module</h2><button className="modal-close" onClick={closeModal}>✕</button></div>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: '1.25rem' }}>Adding to: <b>{title}</b></p>
      <div className="form-group"><label className="form-label">Item Type</label>
        <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
          <option value="text">📄 Text / Article</option><option value="video">🎬 Video</option><option value="image">🖼️ Image</option><option value="link">🔗 Link / URL</option>
        </select>
      </div>
      <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={itemTitle} onChange={e => setItemTitle(e.target.value)} /></div>
      {(type === 'text' || type === 'link') && <div className="form-group"><label className="form-label">{type === 'text' ? 'Text Content' : 'URL'}</label><textarea className="form-textarea" value={content} onChange={e => setContent(e.target.value)} style={{ minHeight: 150 }} /></div>}
      {(type === 'video' || type === 'image') && <div className="form-group"><label className="form-label">Upload File</label><input type="file" accept={type === 'video' ? 'video/*' : 'image/*'} onChange={e => setFile(e.target.files[0])} /></div>}
      {type === 'video' && <div className="form-group"><label className="form-label">Duration (seconds)</label><input className="form-input" type="number" value={duration} onChange={e => setDuration(e.target.value)} /></div>}
      <div className="form-group"><label className="form-label">Order Index</label><input className="form-input" type="number" value={order} onChange={e => setOrder(e.target.value)} /></div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}><button className="btn btn-ghost" onClick={closeModal}>Cancel</button><button className="btn btn-teal" onClick={submit}>Add Item</button></div>
    </>
  );
}
