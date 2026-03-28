const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5005/api';
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5005';

export { API_BASE, SERVER_URL };

export async function authFetch(url, options = {}) {
  const token = localStorage.getItem('lumina_token');
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}

export async function jsonFetch(url, options = {}) {
  const token = localStorage.getItem('lumina_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}
