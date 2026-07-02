import { api } from '@/lib/api'

export interface ExamConfigData {
  id: number
  passingScore: number
  totalScore: number
  timeLimit: number
  questionCount: number
}

export async function fetchExamConfig() {
  const { data } = await api.get<ExamConfigData>('/api/exam-config')
  return data
}

export async function updateExamConfig(input: { passingScore?: number; totalScore?: number; timeLimit?: number; questionCount?: number }) {
  const { data } = await api.put<ExamConfigData>('/api/exam-config', input)
  return data
}
