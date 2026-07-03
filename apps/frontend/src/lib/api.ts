import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

// 开发环境走 Vite proxy（/api → localhost:3001），无需跨域
// 生产环境通过 VITE_API_URL 指定后端地址
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
})

// 自动携带 JWT token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 解包统一响应格式 { code, msg, data } → data
// 错误时保持 message 字段兼容
api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'code' in response.data) {
      response.data = response.data.data
    }
    return response
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response?.data) {
      const body = error.response.data as Record<string, unknown>
      if (body.code && typeof body.msg === 'string') {
        // 将 { code, msg, data } 转为 { message: msg } 保持兼容
        error.response.data = { message: body.msg }
      }
    }
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().auth.reset()
    }
    return Promise.reject(error)
  },
)

/** 登录 */
export async function loginAPI(username: string, password: string) {
  const { data } = await api.post('/api/auth/login', { username, password })
  return data as {
    accessToken: string
    user: {
      id: number
      accountNo: number
      username: string
      role: string[]
      exp: number
    }
    mustChangePassword?: boolean
  }
}
