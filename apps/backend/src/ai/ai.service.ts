import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common'
import { DeepSeekService } from './deepseek.service.js'
import { SopsService } from '../sops/sops.service.js'
import { ExamConfigService } from '../exam-config/exam-config.service.js'
import { ExamsService } from '../exams/exams.service.js'
import { buildGenerateExamPrompt } from './prompts/generate-exam.prompt.js'
import { buildSuggestionPrompt } from './prompts/learning-suggestion.prompt.js'
import { mockGenerateSuggestions } from './mock/mock-suggestions.js'
import type { GenerateExamDto, GradeExamDto } from './dto/ai.dto.js'
import type { GradingResult, AnswerRecord } from '@sop/shared'

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name)

  constructor(
    @Inject(DeepSeekService) private readonly deepseek: DeepSeekService,
    @Inject(SopsService) private readonly sops: SopsService,
    @Inject(ExamConfigService) private readonly examConfig: ExamConfigService,
    @Inject(ExamsService) private readonly examsService: ExamsService,
  ) {}

  /** 流式生成试卷 — AsyncGenerator，逐事件 yield，流结束后自动保存试卷并返回 examId */
  async *generateExamStream(dto: GenerateExamDto): AsyncGenerator<{
    type: 'config' | 'message' | 'question' | 'done' | 'error'
    data: unknown
  }> {
    const { sopId } = dto

    if (!this.deepseek.isConfigured) {
      throw new Error('DeepSeek API 未配置，无法生成试卷')
    }

    const [sop, config] = await Promise.all([this.sops.findOne(sopId), this.examConfig.get()])
    if (!sop) throw new NotFoundException('SOP 不存在')

    const questionCount = config.questionCount
    yield { type: 'config', data: { timeLimit: config.timeLimit, passingScore: config.passingScore, questionCount } }

    const { systemPrompt, userPrompt } = buildGenerateExamPrompt(sop.title, sop.content, questionCount)

    let qIndex = 0
    const questions: Array<{
      type: string
      content: string
      options: string
      answer: string
      explanation: string
      score: number
      sortOrder: number
      sopSource: string
    }> = []

    const stream = this.deepseek.streamChat(systemPrompt, userPrompt)

    for await (const event of stream) {
      if (event.type === 'message') {
        yield { type: 'message', data: { text: event.text } }
      } else if (event.type === 'line') {
        try {
          const q = JSON.parse(event.text)
          if (!q.type || !q.content) continue

          const questionData = {
            type: q.type,
            content: q.content,
            options: q.options ?? [],
            answer: q.answer ?? '',
            explanation: q.explanation ?? '',
            score: q.score ?? 10,
            sortOrder: ++qIndex,
            sopSource: q.sopSource ?? '',
          }

          questions.push({
            ...questionData,
            options: JSON.stringify(questionData.options),
          })

          yield { type: 'question', data: questionData }
        } catch {
          this.logger.warn(`Failed to parse line: ${event.text.slice(0, 80)}...`)
        }
      }
    }

    // 流结束后保存试卷到数据库
    if (questions.length > 0) {
      try {
        const exam = await this.examsService.create({
          sopId: sop.id,
          sopTitle: sop.title,
          title: `${sop.title} — 知识考核`,
          description: `基于「${sop.title}」的 AI 生成试卷`,
          totalQuestions: questions.length,
          totalScore: questions.reduce((sum, q) => sum + q.score, 0),
          questions,
        })
        yield { type: 'done', data: { examId: exam.id, questionIds: exam.questions.map(q => ({ sortOrder: q.sortOrder, id: q.id })) } }
        this.logger.log(`Exam ${exam.id} created with ${questions.length} questions`)
      } catch (err) {
        this.logger.error(`Failed to create exam: ${(err as Error).message}`)
        yield { type: 'error', data: { message: '试卷保存失败' } }
      }
    } else {
      yield { type: 'error', data: { message: '未生成任何题目' } }
    }
  }

  /** 批改试卷并生成学习建议 */
  async gradeExam(dto: GradeExamDto): Promise<GradingResult> {
    const { questions, answers, examTitle, sopTitle } = dto

    // 阶段1：客观题本地判分（questions 和 answers 同序，按索引匹配）
    const answerRecords: AnswerRecord[] = questions.map((q, i) => {
      const userAnswer = answers[i]?.answer
      const isCorrect = this.checkAnswer(q.type, userAnswer, q.answer)
      const score = isCorrect ? q.score : 0

      return {
        questionId: q.sortOrder,
        questionType: q.type,
        questionContent: q.content,
        answer: userAnswer ?? '',
        correctAnswer: q.answer,
        isCorrect,
        score,
        maxScore: q.score,
        aiFeedback: isCorrect ? undefined : `正确答案是 ${q.answer}。${q.explanation}`,
        sopSource: q.sopSource,
      }
    })

    const totalScore = answerRecords.reduce((s, r) => s + r.score, 0)
    const totalMaxScore = questions.reduce((s, q) => s + q.score, 0)
    const isPassed = totalMaxScore > 0 ? totalScore / totalMaxScore >= 0.6 : false

    // 阶段2：AI 逐题点评 + 全局学习建议
    let suggestions: string
    const wrongCount = answerRecords.filter((r) => !r.isCorrect).length

    if (this.deepseek.isConfigured) {
      try {
        const { systemPrompt, userPrompt } = buildSuggestionPrompt({
          examTitle,
          sopTitle,
          totalScore,
          totalMaxScore,
          questionResults: answerRecords.map((r, i) => ({
            index: i + 1,
            questionContent: r.questionContent,
            isCorrect: r.isCorrect,
            correctAnswer: Array.isArray(r.correctAnswer) ? r.correctAnswer.join(',') : r.correctAnswer,
            userAnswer: String(r.answer),
            sopSource: r.sopSource,
          })),
        })

        const raw = await this.deepseek.chat(systemPrompt, userPrompt)
        const parsed = this.parseJsonResponse<{
          perQuestion: Array<{ index: number; feedback: string }>
          overall: string
        }>(raw)

        // 逐题应用 AI 点评
        if (parsed.perQuestion?.length) {
          for (const pq of parsed.perQuestion) {
            const record = answerRecords[pq.index - 1]
            if (record) {
              record.aiFeedback = pq.feedback
            }
          }
        }
        suggestions = parsed.overall?.trim() ?? ''
        if (!suggestions) throw new Error('Empty AI response for suggestions')
        this.logger.log('Generated per-question feedback + suggestions via DeepSeek')
      } catch (err) {
        this.logger.warn(`DeepSeek suggestions failed, using mock: ${(err as Error).message}`)
        suggestions = mockGenerateSuggestions(sopTitle, totalScore, totalMaxScore, wrongCount)
      }
    } else {
      suggestions = mockGenerateSuggestions(sopTitle, totalScore, totalMaxScore, wrongCount)
    }

    return {
      answers: answerRecords,
      totalScore,
      totalMaxScore,
      isPassed,
      suggestions,
    }
  }

  /** 客观题判分 */
  private checkAnswer(type: string, userAnswer: string | string[] | undefined, correctAnswer: string): boolean {
    if (userAnswer === undefined || userAnswer === null) return false

    switch (type) {
      case 'single_choice':
      case 'true_false':
        return String(userAnswer).trim().toUpperCase() === correctAnswer.trim().toUpperCase()

      case 'multi_choice': {
        const ua = (Array.isArray(userAnswer) ? userAnswer : [String(userAnswer)])
          .map((v) => String(v).trim().toUpperCase())
          .sort()
        const ca = correctAnswer
          .split(',')
          .map((v) => v.trim().toUpperCase())
          .sort()
        return ua.length === ca.length && ua.every((v, i) => v === ca[i])
      }

      case 'fill_blank':
        return String(userAnswer).trim().toLowerCase() === correctAnswer.trim().toLowerCase()

      default:
        return String(userAnswer) === String(correctAnswer)
    }
  }

  /** 安全解析 AI 返回的 JSON（兼容 markdown 代码块包裹） */
  private parseJsonResponse<T>(raw: string): T {
    // 去掉可能的 markdown 代码块标记
    let cleaned = raw
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
    if (codeBlockMatch) {
      cleaned = codeBlockMatch[1].trim()
    }
    return JSON.parse(cleaned) as T
  }
}
