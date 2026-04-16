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

  // Matrix mode
  getMode: async () => jsonOrThrow(await fetch('/api/mode', { headers: getHeaders() })),
  setMode: async (body) => jsonOrThrow(await fetch('/api/mode', {
    method: 'PUT', headers: getHeaders(), body: JSON.stringify(body),
  })),
  goIdle: async () => jsonOrThrow(await fetch('/api/mode/idle', { method: 'POST', headers: getHeaders() })),

  // Schedule
  listSchedule: async () => jsonOrThrow(await fetch('/api/schedule/all', { headers: getHeaders() })),
  getCurrentSession: async () => jsonOrThrow(await fetch('/api/schedule/current', { headers: getHeaders() })),
  getNextSession: async () => jsonOrThrow(await fetch('/api/schedule/next', { headers: getHeaders() })),

  // Moderation
  modConfig: async () => jsonOrThrow(await fetch('/api/mod/config', { headers: getHeaders() })),
  modUpdateConfig: async (updates) => jsonOrThrow(await fetch('/api/mod/config', {
    method: 'PUT', headers: getHeaders(), body: JSON.stringify(updates),
  })),
  modEmergencyOff: async () => jsonOrThrow(await fetch('/api/mod/emergency-off', { method: 'POST', headers: getHeaders() })),
  modHistory: async (limit = 100) => jsonOrThrow(await fetch(`/api/mod/history?limit=${limit}`, { headers: getHeaders() })),
  modDeviceLocks: async () => jsonOrThrow(await fetch('/api/mod/devices', { headers: getHeaders() })),
  modLockDevice: async (mac) => jsonOrThrow(await fetch(`/api/mod/device/${encodeURIComponent(mac)}/lock`, { method: 'POST', headers: getHeaders() })),
  modUnlockDevice: async (mac) => jsonOrThrow(await fetch(`/api/mod/device/${encodeURIComponent(mac)}/unlock`, { method: 'POST', headers: getHeaders() })),
  modBanned: async () => jsonOrThrow(await fetch('/api/mod/banned', { headers: getHeaders() })),
  modBan: async (userId, username, reason) => jsonOrThrow(await fetch('/api/mod/banned', {
    method: 'POST', headers: getHeaders(), body: JSON.stringify({ user_id: userId, username, reason }),
  })),
  modUnban: async (userId) => jsonOrThrow(await fetch(`/api/mod/banned/${encodeURIComponent(userId)}`, { method: 'DELETE', headers: getHeaders() })),
};
