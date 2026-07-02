import { api } from '@/lib/api'
import type { User } from '@sop/shared'

export interface UserListParams {
  username?: string
  employeeId?: string
  role?: string
  page?: number
  pageSize?: number
}

/** 获取用户列表 */
export async function fetchUsers(params?: UserListParams & { page?: number; pageSize?: number }) {
  const { data } = await api.get<{ items: User[]; total: number; page: number; pageSize: number }>('/api/users', { params })
  return data
}

/** 获取用户详情 */
export async function fetchUser(id: string) {
  const { data } = await api.get<User>(`/api/users/${id}`)
  return data
}

/** 创建用户 */
export async function createUser(input: Partial<User>) {
  const { data } = await api.post<User>('/api/users', input)
  return data
}

/** 更新用户 */
export async function updateUser(id: string, input: Partial<User>) {
  const { data } = await api.put<User>(`/api/users/${id}`, input)
  return data
}

/** 删除用户 */
export async function deleteUser(id: string) {
  const { data } = await api.delete<{ success: boolean }>(`/api/users/${id}`)
  return data
}
