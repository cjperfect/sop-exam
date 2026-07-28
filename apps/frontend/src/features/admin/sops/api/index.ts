import { api } from '@/lib/api'
import type { SopDocument } from '@sop/shared'

export interface AdminSopListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/** 获取全部 SOP 列表（管理端，含草稿） */
export async function fetchAdminSops(params?: AdminSopListParams) {
  const { data } = await api.get<PaginatedResult<SopDocument>>('/api/admin/sops', { params })
  return data
}

/** 获取 SOP 详情（管理端） */
export async function fetchAdminSop(id: string) {
  const { data } = await api.get<SopDocument>(`/api/admin/sops/${id}`)
  return data
}

/** 创建 SOP（管理端） */
export async function createSop(input: Partial<SopDocument>) {
  const { data } = await api.post<SopDocument>('/api/admin/sops', input)
  return data
}

/** 更新 SOP（管理端） */
export async function updateSop(id: string, input: Partial<SopDocument>) {
  const { data } = await api.put<SopDocument>(`/api/admin/sops/${id}`, input)
  return data
}

/** 删除 SOP（管理端） */
export async function deleteAdminSop(id: string) {
  const { data } = await api.delete<{ success: boolean }>(`/api/admin/sops/${id}`)
  return data
}
