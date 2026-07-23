import { api } from '@/lib/api'

export interface ExamRecord {
  id: string
  sopId: string
  sopTitle: string
  title: string
  description: string
  totalQuestions: number
  totalScore: number
  passingScore: number
  timeLimit: number
  status: string
  generatedBy: string
  createdBy: string
  attempts: number
  aiAnalysis?: string | null
  createdAt: string
  updatedAt: string
}

export interface SubmissionRecord {
  id: number
  examId: number
  sopId: number
  sopTitle: string
  examTitle: string
  userId: number
  userName: string
  answers: Array<{
    questionId: number
    questionType: string
    questionContent: string
    options: unknown
    answer: string
    correctAnswer: string
    isCorrect: boolean
    score: number
    maxScore: number
    aiFeedback?: string
    sopSource?: string
  }>
  totalScore: number
  totalMaxScore: number
  passingScore: number
  isPassed: boolean
  startedAt: string
  submittedAt: string
  timeSpent: number
  suggestions: string
  createdAt: string
  updatedAt: string
  exam?: {
    id: number
    title: string
    description: string
    totalQuestions: number
    totalScore: number
    passingScore: number
    timeLimit: number
    sopTitle: string
  } | null
  user?: {
    id: number
    username: string
    employeeId: string
    department: string
  } | null
}

export async function fetchAdminExams(page = 1, pageSize = 10) {
  const { data } = await api.get<{ items: ExamRecord[]; total: number; page: number; pageSize: number }>('/api/exams', { params: { page, pageSize } })
  return data
}

export async function fetchExamDetail(id: string) {
  const { data } = await api.get<ExamRecord & { questions: unknown[] }>(`/api/exams/${id}`)
  return data
}

export async function fetchSubmissionDetail(id: string) {
  const { data } = await api.get<SubmissionRecord>(`/api/submissions/${id}`)
  return data
}

export async function fetchSubmissions(params?: { page?: number; pageSize?: number; userName?: string; sopTitle?: string }) {
  const { data } = await api.get<{ items: SubmissionRecord[]; total: number; page: number; pageSize: number }>('/api/submissions', { params })
  return data
}

export async function deleteSubmission(id: string) {
  const { data } = await api.delete<{ success: boolean }>(`/api/submissions/${id}`)
  return data
}

export async function updateExamAiAnalysis(examId: number, aiAnalysis: string) {
  const { data } = await api.patch(`/api/exams/${examId}/ai-analysis`, { aiAnalysis })
  return data
}

export async function fetchExamSubmissions(examId: string) {
  const { data } = await api.get<SubmissionRecord[]>(`/api/submissions?examId=${examId}`)
  return data
}
