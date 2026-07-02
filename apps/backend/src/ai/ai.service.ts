import { Injectable, Inject, Logger } from '@nestjs/common'
import OpenAI from 'openai'
import { DEEPSEEK_SERVICE, isDeepSeekConfigured } from './deepseek.provider.js'
import { buildGenerateExamPrompt } from './prompts/generate-exam.prompt.js'
import { buildSuggestionPrompt } from './prompts/learning-suggestion.prompt.js'
import { mockGenerateExam } from './mock/mock-exam-generator.js'
import { mockGenerateSuggestions } from './mock/mock-suggestions.js'
import type { GenerateExamDto, GradeExamDto } from './ai.dto.js'
import type { GeneratedExam, GradingResult, AnswerRecord } from '@sop/shared'

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name)

  constructor(
    @Inject(DEEPSEEK_SERVICE) private readonly deepseek: OpenAI | null,
  ) {}

  /** 生成试卷 */
  async generateExam(dto: GenerateExamDto): Promise<GeneratedExam> {
    const { sopContent, sopTitle, questionCount = 10 } = dto

    if (!isDeepSeekConfigured() || !this.deepseek) {
      this.logger.warn('DeepSeek not configured, using mock exam generator')
      return mockGenerateExam(sopContent, sopTitle, questionCount)
    }

    try {
      const { systemPrompt, userPrompt } = buildGenerateExamPrompt(
        sopTitle,
        sopContent,
        questionCount,
      )

      const response = await this.deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      })

      const raw = response.choices[0]?.message?.content?.trim() ?? ''
      const parsed = this.parseJsonResponse<GeneratedExam>(raw)

      console.log('raw',raw)
      // 校验返回结果
      if (!parsed.questions?.length) {
        throw new Error('AI response has no questions')
      }

      // 补充默认值 & 修正 sortOrder
      parsed.questions = parsed.questions.map((q, i) => ({
        type: q.type,
        content: q.content,
        options: q.options ?? [],
        answer: q.answer ?? '',
        explanation: q.explanation ?? '',
        score: q.score ?? 10,
        sortOrder: i + 1,
        sopSource: q.sopSource ?? '',
      }))

      if (!parsed.title) parsed.title = `${sopTitle} — 知识考核`
      if (!parsed.description) parsed.description = `基于《${sopTitle}》自动生成的 ${questionCount} 道考题`
      if (!parsed.timeLimit) parsed.timeLimit = Math.ceil(questionCount * 1.5)
      if (!parsed.passingScore) parsed.passingScore = 60

      this.logger.log(`Generated ${parsed.questions.length} questions via DeepSeek`)
      return parsed
    } catch (err) {
      this.logger.warn(`DeepSeek generation failed, falling back to mock: ${(err as Error).message}`)
      return mockGenerateExam(sopContent, sopTitle, questionCount)
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
    const isPassed = totalMaxScore > 0 ? (totalScore / totalMaxScore) >= 0.6 : false

    // 阶段2：AI 逐题点评 + 全局学习建议
    let suggestions: string
    const wrongCount = answerRecords.filter((r) => !r.isCorrect).length

    if (isDeepSeekConfigured() && this.deepseek) {
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

        const response = await this.deepseek.chat.completions.create({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.8,
          max_tokens: 2048,
        })

        const raw = response.choices[0]?.message?.content?.trim() ?? ''
        const parsed = this.parseJsonResponse<{ perQuestion: Array<{ index: number; feedback: string }>; overall: string }>(raw)

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
  private checkAnswer(
    type: string,
    userAnswer: string | string[] | undefined,
    correctAnswer: string,
  ): boolean {
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
