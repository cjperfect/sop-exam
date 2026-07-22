/**
 * 考试提交服务 — 后端自动判分 + AI 学习建议
 *
 * 交卷时:
 * 1. 查 exam + questions → 本地比对答案判分
 * 2. 调用 DeepSeek 生成逐题点评 + 全局学习建议
 * 3. 保存 submission + answer_details 到数据库
 */
import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import { DeepSeekService } from '../ai/deepseek.service.js'
import { buildSuggestionPrompt } from '../ai/prompts/learning-suggestion.prompt.js'
import type { CreateSubmissionDto } from './submissions.dto.js'

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name)

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(DeepSeekService) private readonly deepseek: DeepSeekService,
  ) {}

  /**
   * 分页获取考试记录列表
   * 支持按考试人、SOP 标题、考试 ID、SOP ID、是否通过等条件筛选
   */
  async findAll(
    page = 1,
    pageSize = 10,
    userName?: string,
    sopTitle?: string,
    examId?: number,
    sopId?: number,
    isPassed?: boolean,
  ) {
    const skip = (page - 1) * pageSize

    // 构建 where 条件
    const where: Record<string, unknown> = { isDeleted: false }

    if (userName) {
      where.userName = { contains: userName }
    }
    if (examId) {
      where.examId = examId
    }
    if (sopId) {
      where.sopId = sopId
    }
    if (isPassed !== undefined && isPassed !== null) {
      where.isPassed = isPassed
    }

    // SOP 标题筛选需要通过 Exam → SopDocument 关联查询
    if (sopTitle) {
      where.exam = {
        sop: {
          title: { contains: sopTitle },
        },
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.submission.findMany({
        where: where as any,
        include: {
          exam: {
            select: {
              id: true,
              title: true,
              sop: {
                select: {
                  id: true,
                  title: true,
                },
              },
              config: {
                select: {
                  passingScore: true,
                  timeLimit: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              employeeId: true,
              department: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.submission.count({ where: where as any }),
    ])

    // 转换数据格式，添加前端需要的计算字段
    const mappedItems = items.map((item) => ({
      id: item.id,
      examId: item.examId,
      sopId: item.sopId,
      sopTitle: item.exam?.sop?.title ?? '',
      examTitle: item.exam?.title ?? '',
      userId: item.userId,
      userName: item.userName,
      totalScore: item.totalScore,
      totalMaxScore: item.totalMaxScore,
      passingScore: item.exam?.config?.passingScore ?? 60,
      isPassed: item.isPassed,
      startedAt: item.startedAt,
      submittedAt: item.submittedAt,
      timeSpent: item.timeSpent,
      suggestions: item.suggestions,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      // 用户信息
      user: item.user
        ? {
            id: item.user.id,
            username: item.user.username,
            employeeId: item.user.employeeId,
            department: item.user.department,
          }
        : null,
    }))

    return { items: mappedItems, total, page, pageSize }
  }

  /**
   * 获取考试记录详情
   * 包含试卷信息、答题详情（含题目）、用户信息
   */
  async findOne(id: number) {
    const submission = await this.prisma.submission.findUnique({
      where: { id, isDeleted: false },
      include: {
        exam: {
          select: {
            title: true,
            sop: { select: { title: true } },
          },
        },
        answerDetails: {
          include: {
            question: true,
          },
          orderBy: {
            question: { sortOrder: 'asc' },
          },
        },
      },
    })

    if (!submission) {
      throw new NotFoundException('考试记录不存在')
    }

    // 转换答题详情为前端期望的 answers 格式
    const answers = submission.answerDetails.map((detail) => {
      // 处理 options：可能是 JSON 字符串或已解析的对象
      let options = detail.question.options
      if (typeof options === 'string') {
        try {
          options = JSON.parse(options)
        } catch {
          options = null
        }
      }

      return {
        questionId: detail.questionId,
        questionType: detail.question.type,
        questionContent: detail.question.content,
        options,
        answer: detail.userAnswer ?? '',
        correctAnswer: detail.correctAnswer ?? detail.question.answer,
        isCorrect: detail.isCorrect,
        score: detail.aiScore,
        maxScore: detail.question.score,
        aiFeedback: detail.aiFeedback,
        explanation: detail.question.explanation,
        sopSource: detail.question.sopSource,
      }
    })

    return {
      id: submission.id,
      sopTitle: submission.exam?.sop?.title ?? '',
      examTitle: submission.exam?.title ?? '',
      userName: submission.userName,
      answers,
      totalScore: submission.totalScore,
      totalMaxScore: submission.totalMaxScore,
      isPassed: submission.isPassed,
      timeSpent: submission.timeSpent,
      startedAt: submission.startedAt,
      submittedAt: submission.submittedAt,
      suggestions: submission.suggestions,
    }
  }

  /**
   * 创建考试记录 — 后端自动判分 + AI 学习建议
   * user 来自 JWT（{ id, username, accountNo, ... }）
   */
  async create(dto: CreateSubmissionDto, user?: { id: number; username?: string; accountNo?: number }) {
    const now = new Date()
    // 验证考试是否存在，同时获取题目和配置
    const exam = await this.prisma.exam.findUnique({
      where: { id: dto.examId, isDeleted: false },
      include: {
        questions: { orderBy: { sortOrder: 'asc' } },
        config: { select: { passingScore: true } },
        sop: { select: { title: true } },
      },
    })
    if (!exam) {
      throw new NotFoundException(`考试不存在 (examId=${dto.examId})`)
    }

    // 构建用户答案映射
    const userAnswerMap = new Map<string, string>()
    if (dto.answerDetails) {
      for (const a of dto.answerDetails) {
        userAnswerMap.set(String(a.questionId), a.userAnswer ?? '')
      }
    }

    // 本地判分
    let totalScore = 0
    const totalMaxScore = exam.questions.reduce((s, q) => s + q.score, 0)
    const gradedDetails: Array<{
      questionId: number
      examId: number
      userAnswer: string | null
      correctAnswer: string | null
      isCorrect: boolean
      aiScore: number
      aiFeedback: string | null
    }> = []

    const questionResults: Array<{
      index: number
      questionContent: string
      isCorrect: boolean
      correctAnswer: string
      userAnswer: string
      sopSource: string
    }> = []

    for (const q of exam.questions) {
      const userAnswer = userAnswerMap.get(String(q.id)) ?? ''
      const correctAnswer = q.answer
      const isCorrect = this.checkAnswer(q.type, userAnswer, correctAnswer)
      const score = isCorrect ? q.score : 0
      totalScore += score

      gradedDetails.push({
        questionId: q.id,
        examId: dto.examId,
        userAnswer: userAnswer || null,
        correctAnswer,
        isCorrect,
        aiScore: score,
        aiFeedback: isCorrect ? null : `正确答案是 ${correctAnswer}。${q.explanation ?? ''}`,
      })

      questionResults.push({
        index: q.sortOrder,
        questionContent: q.content,
        isCorrect,
        correctAnswer: Array.isArray(correctAnswer) ? (correctAnswer as any).join(',') : String(correctAnswer),
        userAnswer: String(userAnswer),
        sopSource: q.sopSource ?? '',
      })
    }

    const passingScore = exam.config?.passingScore ?? 60
    const isPassed = totalMaxScore > 0 ? totalScore / totalMaxScore >= passingScore / 100 : false

    // AI 学习建议
    let suggestions: string | null = null
    if (this.deepseek.isConfigured) {
      try {
        const { systemPrompt, userPrompt } = buildSuggestionPrompt({
          examTitle: exam.title,
          sopTitle: exam.sop?.title ?? '',
          totalScore,
          totalMaxScore,
          questionResults,
        })

        const raw = await this.deepseek.chat(systemPrompt, userPrompt)

        // 提取 overall 建议
        try {
          const parsed = JSON.parse(raw.replace(/```(?:json)?\s*\n?([\s\S]*?)```/, '$1').trim()) as {
            perQuestion?: Array<{ index: number; feedback: string }>
            overall?: string
          }
          suggestions = parsed.overall?.trim() ?? raw

          // 逐题应用 AI 点评
          if (parsed.perQuestion?.length) {
            for (const pq of parsed.perQuestion) {
              const detail = gradedDetails[pq.index - 1]
              if (detail) {
                detail.aiFeedback = pq.feedback
              }
            }
          }
        } catch {
          suggestions = raw
        }

        this.logger.log(`Generated AI suggestions for submission`)
      } catch (err) {
        this.logger.warn(`AI suggestions failed: ${(err as Error).message}`)
        suggestions = `本次考试得分 ${totalScore}/${totalMaxScore}，${isPassed ? '已通过' : '未通过'}。建议复习相关 SOP 文档。`
      }
    }

    // 保存（userId/userName 从 JWT 取，时间由服务端计算）
    const startedAt = exam.createdAt
    const submission = await this.prisma.submission.create({
      data: {
        examId: dto.examId,
        sopId: dto.sopId,
        userId: user?.id ?? 0,
        userName: user?.username ?? '',
        startedAt,
        submittedAt: now,
        timeSpent: Math.round((now.getTime() - startedAt.getTime()) / 1000),
        totalScore,
        totalMaxScore,
        isPassed,
        suggestions,
      },
    })

    await this.prisma.answerDetail.createMany({
      data: gradedDetails.map((d) => ({ ...d, submissionId: submission.id })),
    })

    return this.findOne(submission.id)
  }

  /** 客观题判分 */
  private checkAnswer(type: string, userAnswer: string, correctAnswer: string): boolean {
    if (!userAnswer) return false

    switch (type) {
      case 'single_choice':
      case 'true_false':
        return userAnswer.trim().toUpperCase() === correctAnswer.trim().toUpperCase()

      case 'multi_choice': {
        const ua = (Array.isArray(userAnswer) ? userAnswer : [userAnswer])
          .map((v) => String(v).trim().toUpperCase())
          .sort()
        const ca = String(correctAnswer)
          .split(',')
          .map((v) => v.trim().toUpperCase())
          .sort()
        return ua.length === ca.length && ua.every((v, i) => v === ca[i])
      }

      case 'fill_blank':
        return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()

      default:
        return userAnswer === correctAnswer
    }
  }

  /**
   * 软删除考试记录
   */
  async remove(id: number) {
    const submission = await this.prisma.submission.findUnique({
      where: { id, isDeleted: false },
    })
    if (!submission) {
      throw new NotFoundException('考试记录不存在')
    }
    await this.prisma.submission.update({
      where: { id },
      data: { isDeleted: true },
    })
    return { success: true }
  }
}
