import { api } from '@/lib/api'

export interface Department {
  id: number
  name: string
  description: string
}

export async function fetchDepartments() {
  const { data } = await api.get<Department[]>('/api/departments')
  return data
}

export async function createDepartment(input: { name: string; description?: string }) {
  const { data } = await api.post<Department>('/api/departments', input)
  return data
}

export async function updateDepartment(id: number, input: { name?: string; description?: string }) {
  const { data } = await api.put<Department>(`/api/departments/${id}`, input)
  return data
}

export async function deleteDepartment(id: number) {
  const { data } = await api.delete<{ success: boolean }>(`/api/departments/${id}`)
  return data
}
