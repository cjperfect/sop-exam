export type ExamStatus = 'draft' | 'published' | 'closed'
export type QuestionType = 'single_choice' | 'multi_choice' | 'true_false' | 'fill_blank'

export interface QuestionOption {
  key: string
  value: string
}

export interface Question {
  type: QuestionType
  content: string
  options: QuestionOption[]
  answer: string
  explanation: string
  score: number
  sortOrder: number
  sopSource: string
}

export interface Exam {
  id: number
  sopId: number
  sopTitle: string
  title: string
  description: string
  totalQuestions: number
  totalScore: number
  passingScore: number
  timeLimit: number
  status: ExamStatus
  generatedBy: 'ai' | 'manual'
  createdBy: string
  attempts: number
  attemptCount: number
  createdAt: string
  updatedAt: string
}

export interface AnswerRecord {
  questionId: number
  questionType: QuestionType
  questionContent: string
  answer: string | string[]
  correctAnswer: string | string[]
  isCorrect: boolean
  score: number
  maxScore: number
  aiFeedback?: string
  sopSource?: string
}

/** API: 生成试卷请求参数 */
export interface GenerateExamParams {
  sopId: number
}

/** API: 生成试卷响应 */
export interface GeneratedExam {
  title: string
  description: string
  questions: Question[]
}

/** API: 批改试卷请求参数 */
export interface GradingParams {
  questions: Question[]
  answers: Array<{ questionId: number; answer: string | string[] }>
  userId: string
  examTitle: string
  sopTitle: string
  sopId: number
}

/** API: 批改试卷响应 */
export interface GradingResult {
  answers: AnswerRecord[]
  totalScore: number
  totalMaxScore: number
  isPassed: boolean
  suggestions: string
}
