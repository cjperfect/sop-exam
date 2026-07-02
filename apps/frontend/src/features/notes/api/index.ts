import { api } from '@/lib/api'
import type { Note } from '@sop/shared'

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/** 获取笔记列表 */
export async function fetchNotes(params?: { search?: string; userName?: string; page?: number; pageSize?: number }) {
  const { data } = await api.get<PaginatedResult<Note>>('/api/notes', { params })
  return data
}

/** 获取笔记详情 */
export async function fetchNote(id: string) {
  const { data } = await api.get<Note>(`/api/notes/${id}`)
  return data
}

/** 创建笔记 */
export async function createNote(input: Partial<Note>) {
  const { data } = await api.post<Note>('/api/notes', input)
  return data
}

/** 更新笔记 */
export async function updateNote(id: string, input: Partial<Note>) {
  const { data } = await api.put<Note>(`/api/notes/${id}`, input)
  return data
}

/** 删除笔记 */
export async function deleteNote(id: string) {
  const { data } = await api.delete<{ success: boolean }>(`/api/notes/${id}`)
  return data
}
