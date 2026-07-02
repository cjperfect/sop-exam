import { api } from '@/lib/api'
import type { Exam, Submission, GenerateExamParams, GeneratedExam, GradingResult } from '@sop/shared'

/** 获取考试列表 */
export async function fetchExams() {
  const { data } = await api.get<Exam[]>('/api/exams')
  return data
}

/** 获取考试详情 */
export async function fetchExam(id: string) {
  const { data } = await api.get<Exam>(`/api/exams/${id}`)
  return data
}

/** AI 生成试卷 */
export async function generateExamAPI(params: GenerateExamParams) {
  const { data } = await api.post<GeneratedExam>('/api/ai/generate-exam', params)
  return data
}

/** AI 批改试卷 */
export async function gradeExamAPI(params: {
  questions: Array<{
    type: string
    content: string
    options: unknown
    answer: string
    explanation: string
    score: number
    sortOrder: number
    sopSource: string
  }>
  answers: Array<{ questionId: number; answer: string | string[] }>
  userId: string
  examTitle: string
  sopTitle: string
  sopId: number
}) {
  const { data } = await api.post<GradingResult>('/api/ai/grade-exam', params)
  return data
}

/** 提交答卷（已废弃 — 改用 createSubmission） */
export async function submitExam(examId: string, answers: unknown[], timeSpent: number) {
  const { data } = await api.post<Submission>(`/api/exams/${examId}/submit`, {
    answers,
    timeSpent,
  })
  return data
}

/** 创建考试（保存 AI 生成的试卷到数据库） */
export async function createExam(exam: {
  sopId: number
  sopTitle: string
  title: string
  description: string
  totalQuestions: number
  totalScore: number
  questions: Array<{
    type: string
    content: string
    options: string
    answer: string
    explanation: string
    score: number
    sortOrder: number
    sopSource?: string
  }>
}) {
  const { data } = await api.post('/api/exams', exam)
  return data as { id: number; questions?: Array<{ id: number }> }
}

/** 创建提交记录（持久化到数据库） */
export async function createSubmission(submission: {
  examId: number
  sopId: number
  userId: number
  userName?: string
  startedAt: string
  submittedAt?: string
  timeSpent?: number
  totalScore?: number
  totalMaxScore?: number
  isPassed?: boolean
  suggestions?: string
  answerDetails?: Array<{
    questionId: number
    userAnswer?: string
    correctAnswer?: string
    isCorrect?: boolean
    aiScore?: number
    aiFeedback?: string
  }>
}) {
  const { data } = await api.post<Submission>('/api/submissions', submission)
  return data
}

/** 获取提交记录 */
export async function fetchSubmissions(page = 1) {
  const { data } = await api.get<{ items: Submission[]; total: number }>('/api/submissions', { params: { page, pageSize: 100 } })
  return data.items ?? []
}

/** 获取提交详情 */
export async function fetchSubmission(id: string) {
  const { data } = await api.get<Submission>(`/api/submissions/${id}`)
  return data
}
