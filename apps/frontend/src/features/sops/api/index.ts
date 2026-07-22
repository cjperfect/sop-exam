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

/** 获取 SOP 列表 */
export async function fetchSops(params?: SopListParams & { page?: number; pageSize?: number }) {
  const { data } = await api.get<PaginatedResult<SopDocument>>('/api/sops', { params })
  return data
}

/** 获取 SOP 详情 */
export async function fetchSop(id: string) {
  const { data } = await api.get<SopDocument>(`/api/sops/${id}`)
  return data
}

/** 创建 SOP */
export async function createSop(input: Partial<SopDocument>) {
  const { data } = await api.post<SopDocument>('/api/sops', input)
  return data
}

/** 更新 SOP */
export async function updateSop(id: string, input: Partial<SopDocument>) {
  const { data } = await api.put<SopDocument>(`/api/sops/${id}`, input)
  return data
}

/** 获取部门列表 */
export async function fetchDepartments() {
  const { data } = await api.get<Array<{ id: number; name: string; description: string }>>('/api/departments')
  return data.map((d) => d.name)
}

/** 删除 SOP */
export async function deleteSop(id: string) {
  const { data } = await api.delete<{ success: boolean }>(`/api/sops/${id}`)
  return data
}
