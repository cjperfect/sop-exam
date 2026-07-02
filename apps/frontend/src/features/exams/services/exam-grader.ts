import type { Question } from '../data/question-schema'
import type { AnswerRecord } from '../data/submission-schema'
import { generateLearningSuggestions } from './learning-suggestions'
import { gradeExamAPI } from '../api'

interface GradingParams {
  questions: Question[]
  answers: Array<{ questionId: string; answer: string | string[] }>
  userId: string
  examTitle: string
  sopTitle: string
  sopId: string
}

export interface GradingResult {
  answers: AnswerRecord[]
  totalScore: number
  totalMaxScore: number
  isPassed: boolean
  suggestions: string
}

/**
 * 批改试卷 — 优先调后端 AI API，失败则本地判分
 */
export async function gradeExam(params: GradingParams): Promise<GradingResult> {
  try {
    return await gradeExamAPI({
      questions: params.questions.map((q) => ({
        type: q.type,
        content: q.content,
        options: q.options ?? [],
        answer: typeof q.answer === 'string' ? q.answer : q.answer.join(','),
        explanation: q.explanation,
        score: q.score,
        sortOrder: q.sortOrder,
        sopSource: q.sopSource,
      })),
      answers: params.answers.map((a) => ({
        questionId: Number(a.questionId),
        answer: a.answer,
      })),
      userId: params.userId,
      examTitle: params.examTitle,
      sopTitle: params.sopTitle,
      sopId: Number(params.sopId),
    })
  } catch {
    // 后端不可用，回退到本地判分
    return localGrade(params)
  }
}

/** 本地判分（客观题） */
async function localGrade(params: GradingParams): Promise<GradingResult> {
  const { questions, answers } = params
  let totalScore = 0
  const totalMaxScore = questions.reduce((s, q) => s + q.score, 0)

  const answerRecords = questions.map((q) => {
    const userAnswer = answers.find((a) => a.questionId === q.id)?.answer

    let isCorrect = false
    if (q.type === 'single_choice' || q.type === 'true_false') {
      isCorrect = String(userAnswer) === String(q.answer)
    } else if (q.type === 'multi_choice') {
      const ua = (userAnswer as string[]) ?? []
      const ca = q.answer as string[]
      isCorrect = ua.length === ca.length && ua.every((v) => ca.includes(v))
    } else if (q.type === 'fill_blank') {
      const ua = String(userAnswer ?? '').trim()
      const ca = String(q.answer).trim()
      isCorrect = ua.toLowerCase() === ca.toLowerCase()
    }

    const score = isCorrect ? q.score : 0
    if (isCorrect) totalScore += score

    return {
      questionId: String(q.id),
      questionType: q.type,
      questionContent: q.content,
      answer: userAnswer ?? '',
      correctAnswer: q.answer,
      isCorrect,
      score,
      maxScore: q.score,
      aiFeedback: isCorrect ? undefined : `回答错误。${q.explanation}`,
      sopSource: q.sopSource,
    }
  })

  const passingScore = 60
  const passingTotal = Math.ceil(totalMaxScore * (passingScore / 100))
  const isPassed = totalScore >= passingTotal

  const suggestions = await generateLearningSuggestions({
    examTitle: params.examTitle,
    sopTitle: params.sopTitle,
    totalScore,
    totalMaxScore,
    questionResults: answerRecords,
  })

  return { answers: answerRecords as any, totalScore, totalMaxScore, isPassed, suggestions }
}
