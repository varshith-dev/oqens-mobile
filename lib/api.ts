import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://api.oqens.me/api'
const AUTH_KEY = 'oqens_auth_token'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

apiClient.interceptors.request.use(async (config) => {
  try {
    const raw = await SecureStore.getItemAsync(AUTH_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      const token = parsed?.session?.accessToken
      if (token) config.headers['Authorization'] = `Bearer ${token}`
    }
  } catch {}
  return config
})

// ─── RPC query builder (mirrors awsClient.js) ────────────────────────────────
export async function rpcQuery(q: Record<string, unknown>) {
  const res = await apiClient.post('/rpc/query', q)
  return res.data
}

export async function rpcFunction(fnName: string, args?: Record<string, unknown>) {
  const res = await apiClient.post('/rpc/function', { fnName, args })
  return res.data
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function login(email: string, password: string) {
  const res = await apiClient.post('/auth/login', { email, password })
  return res.data
}

export async function register(data: { email: string; password: string; username: string; display_name: string }) {
  const res = await apiClient.post('/auth/register', data)
  return res.data
}

export async function getMe() {
  const res = await apiClient.post('/auth/me', {})
  return res.data
}

// ─── Session helpers ──────────────────────────────────────────────────────────
export async function saveSession(session: unknown) {
  await SecureStore.setItemAsync(AUTH_KEY, JSON.stringify({ session }))
}

export async function getSession() {
  const raw = await SecureStore.getItemAsync(AUTH_KEY)
  if (!raw) return null
  return JSON.parse(raw)?.session ?? null
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(AUTH_KEY)
}
