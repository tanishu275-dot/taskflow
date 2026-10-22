const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export function register(email, password) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function login(email, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export function getTasks(token) {
  return request('/api/tasks', { headers: authHeaders(token) });
}

export function createTask(token, title) {
  return request('/api/tasks', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ title }),
  });
}

export function updateTask(token, id, changes) {
  return request(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(changes),
  });
}

export function deleteTask(token, id) {
  return request(`/api/tasks/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}