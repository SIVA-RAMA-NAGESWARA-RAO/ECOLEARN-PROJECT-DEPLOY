import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { fmt } from '../../services/helpers';
import { showToast } from '../../components/UI';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const timer = useRef(null);

  const load = async (q = '') => { setUsers(await api('GET', `/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`)); };
  useEffect(() => { load(); }, []);

  const changeRole = async (id, role) => {
    await api('PATCH', `/admin/users/${id}`, { role });
    showToast('Role updated!', 'success');
  };

  return (
    <div className="page active" style={{ animation: 'fadeIn 0.22s ease' }}>
      <div className="admin-header">
        <div><h1>Users</h1><p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>{users.length} accounts</p></div>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <input className="form-input" placeholder="🔍 Search users by name or email..." style={{ maxWidth: 400 }}
          onChange={e => { clearTimeout(timer.current); timer.current = setTimeout(() => load(e.target.value), 300); }} />
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Points</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="avatar" style={{ width: 28, height: 28, fontSize: 11, flexShrink: 0 }}>{(u.name || '?').charAt(0)}</div><span style={{ fontWeight: 500 }}>{u.name}</span></div></td>
                <td style={{ color: 'var(--muted)', fontSize: 13 }}>{u.email}</td>
                <td><span className={`tag ${u.role === 'admin' ? 'tag-red' : u.role === 'teacher' ? 'tag-blue' : 'tag-teal'}`}>{u.role}</span></td>
                <td style={{ fontWeight: 600, color: 'var(--g800)' }}>{fmt(u.eco_points)}</td>
                <td style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  <select className="form-select" style={{ width: 120, fontSize: 12, padding: '5px 8px' }} value={u.role} onChange={e => changeRole(u.id, e.target.value)}>
                    <option value="student">Student</option><option value="teacher">Teacher</option><option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
