const TOKEN_KEY = 'wrangled.token';

function getHeaders() {
  const headers = { 'content-type': 'application/json' };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers['authorization'] = `Bearer ${token}`;
  return headers;
}

async function jsonOrThrow(res) {
  if (res.status === 401) throw new Error('AUTH_REQUIRED');
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

export const api = {
  listDevices: async () => jsonOrThrow(await fetch('/api/devices', { headers: getHeaders() })),
  getState: async (mac) => jsonOrThrow(await fetch(`/api/devices/${encodeURIComponent(mac)}/state`, { headers: getHeaders() })),
  sendCommand: async (mac, command) => jsonOrThrow(await fetch(`/api/devices/${encodeURIComponent(mac)}/commands`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify(command),
  })),
  rename: async (mac, name) => jsonOrThrow(await fetch(`/api/devices/${encodeURIComponent(mac)}/name`, {
    method: 'PUT', headers: getHeaders(), body: JSON.stringify({ name }),
  })),
  rescan: async () => jsonOrThrow(await fetch('/api/scan', { method: 'POST', headers: getHeaders() })),
  listEffects: async () => jsonOrThrow(await fetch('/api/effects', { headers: getHeaders() })),
  listPresets: async () => jsonOrThrow(await fetch('/api/presets', { headers: getHeaders() })),
  listEmoji: async () => jsonOrThrow(await fetch('/api/emoji', { headers: getHeaders() })),
  listWranglers: async () => jsonOrThrow(await fetch('/api/wranglers', { headers: getHeaders() })),
};
