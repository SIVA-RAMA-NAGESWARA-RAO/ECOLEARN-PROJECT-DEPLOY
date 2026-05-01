const API_BASE = import.meta.env.VITE_API_URL || '';

export function getToken() {
  return localStorage.getItem('eco_token');
}
export function setToken(t) {
  if (t) localStorage.setItem('eco_token', t);
  else localStorage.removeItem('eco_token');
}

export async function api(method, path, body, isForm = false) {
  const token = getToken();
  const opts = { method, headers: {} };
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  if (body) {
    if (isForm) {
      opts.body = body;
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
  }
  const r = await fetch(`${API_BASE}/api${path}`, opts);
  const ct = r.headers.get('Content-Type') || '';
  const data = ct.includes('application/json') ? await r.json() : {};
  if (!r.ok) throw new Error(data.error || `${r.status} ${r.statusText}`);
  return data;
}

export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}
