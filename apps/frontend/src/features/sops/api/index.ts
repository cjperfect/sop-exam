import { api } from '@/lib/api'
import type { SopDocument } from '@sop/shared'

export interface SopListParams {
  search?: string
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/** 获取已发布的 SOP 列表（文档库） */
export async function fetchSops(params?: SopListParams & { page?: number; pageSize?: number }) {
  const { data } = await api.get<PaginatedResult<SopDocument>>('/api/sops', { params })
  return data
}

/** 获取 SOP 详情（文档库） */
export async function fetchSop(id: string) {
  const { data } = await api.get<SopDocument>(`/api/sops/${id}`)
  return data
}

/** 获取部门列表 */
export async function fetchDepartments() {
  const { data } = await api.get<Array<{ id: number; name: string; description: string }>>('/api/departments')
  return data
}
