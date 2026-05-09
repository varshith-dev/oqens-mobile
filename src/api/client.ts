import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { API_BASE_URL, SECURE_STORE_TOKEN_KEY } from '../utils/constants'

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(SECURE_STORE_TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync(SECURE_STORE_TOKEN_KEY)
      // useAuthStore.getState().logout() — called from store to avoid circular dep
    }
    return Promise.reject(error)
  }
)

export default client
