export async function apiFetch(url: string, options: RequestInit = {}) {
  const userStr = localStorage.getItem('user');
  let token = '';
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      token = user.accessToken;
    } catch (e) {}
  }

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
  
  if (res.status === 401) {
    // Token expiração ou inválido
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sessão expirada');
  }

  return res;
}
