export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  try {
    const auth = (typeof window !== 'undefined' && localStorage.getItem('token')) || '';
    const headers = new Headers(init.headers || {});
    if (auth) headers.set('Authorization', auth);

    // If body is an object, stringify it. If it's a string (likely JSON), ensure JSON header.
    let body = init.body;
    if (body && !(body instanceof FormData)) {
      if (typeof body === 'object') {
        try { body = JSON.stringify(body); } catch (e) { /* leave as-is */ }
      }
      if (!headers.get('Content-Type')) headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(input, { ...init, headers, body } as RequestInit);

    if (res.status === 401) {
      let msg = 'Session expired — please sign in again.';
      try {
        const d = await res.json().catch(() => ({}));
        msg = d.message || d.error || msg;
      } catch {}
      try { localStorage.removeItem('token'); } catch {}
      alert(msg);
      // redirect to admin login (Next.js app route)
      if (typeof window !== 'undefined') window.location.href = '/admin/login';
    }

    return res;
  } catch (err) {
    throw err;
  }
}

export default fetchWithAuth;
