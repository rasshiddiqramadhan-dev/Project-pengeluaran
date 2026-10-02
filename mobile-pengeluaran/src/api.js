let activeBaseUrl = (
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.11:3000'
).replace(/\/$/, '');

export function getBaseUrl() {
  return activeBaseUrl;
}

export function setBaseUrl(url) {
  if (url) {
    activeBaseUrl = url.trim().replace(/\/$/, '');
  }
}

export async function request(path, options = {}) {
  if (!activeBaseUrl) throw new Error('Isi EXPO_PUBLIC_API_URL di .env');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${activeBaseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
    if (response.status === 204) return null;
    const raw = await response.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      throw new Error(`Respons bukan JSON (${response.status})`);
    }
    if (!response.ok) {
      const error = new Error(data?.pesan || `HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Waktu tunggu habis. Pastikan backend berjalan dan IP sesuai.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  getBaseUrl,
  setBaseUrl,
  ping: () => request('/'),
  list: () => request('/pengeluaran'),
  detail: (id) => request(`/pengeluaran/${id}`),
  categories: () => request('/kategori'),
  create: (body) =>
    request('/pengeluaran', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (id, body) =>
    request(`/pengeluaran/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  remove: (id) => request(`/pengeluaran/${id}`, { method: 'DELETE' }),
};