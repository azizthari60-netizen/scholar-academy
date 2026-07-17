const ScholarAPI = (() => {
  const TOKEN_KEY = 'scholar_token';
  const USER_KEY = 'scholar_user';

  function getBaseUrl() {
    if (window.location.protocol === 'file:') return 'http://localhost:5000';
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return window.location.origin;
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  }

  async function request(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${getBaseUrl()}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(data.message || 'Request failed');
      err.status = res.status;
      throw err;
    }
    return data;
  }

  return {
    getToken,
    getUser,
    setSession,
    clearSession,
    login: (email, password, role) =>
      request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password, role }) }),
    me: () => request('/api/auth/me'),
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
    patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
    del: (path) => request(path, { method: 'DELETE' }),
    fetchHtml: async (path) => {
      const headers = {};
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${getBaseUrl()}${path}`, { headers });
      if (!res.ok) throw new Error('Unable to load content');
      return res.text();
    },
    logout: () => {
      clearSession();
      window.location.href = '/pages/auth/login.html';
    },
  };
})();

window.ScholarAPI = ScholarAPI;
