import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import type { CreateSubmissionDto } from './submissions.dto.js'

@Injectable()
export class SubmissionsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

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
   * 创建考试记录
   * 同时创建答题详情记录
   */
  async create(dto: CreateSubmissionDto) {
    // 验证考试是否存在
    const exam = await this.prisma.exam.findUnique({
      where: { id: dto.examId, isDeleted: false },
    })
    if (!exam) {
      throw new NotFoundException(`考试不存在 (examId=${dto.examId})`)
    }

    const submission = await this.prisma.submission.create({
      data: {
        examId: dto.examId,
        sopId: dto.sopId,
        userId: dto.userId,
        userName: dto.userName ?? '',
        startedAt: new Date(dto.startedAt),
        submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : null,
        timeSpent: dto.timeSpent ?? 0,
        totalScore: dto.totalScore ?? 0,
        totalMaxScore: dto.totalMaxScore ?? 0,
        isPassed: dto.isPassed ?? false,
        suggestions: dto.suggestions ?? null,
      },
    })

    // 如果有答题详情，批量创建 AnswerDetail 记录
    if (dto.answerDetails && dto.answerDetails.length > 0) {
      await this.prisma.answerDetail.createMany({
        data: dto.answerDetails.map((detail) => ({
          submissionId: submission.id,
          questionId: detail.questionId,
          examId: dto.examId,
          userAnswer: detail.userAnswer ?? null,
          correctAnswer: detail.correctAnswer ?? null,
          isCorrect: detail.isCorrect ?? false,
          aiScore: detail.aiScore ?? 0,
          aiFeedback: detail.aiFeedback ?? null,
        })),
      })
    }

    // 返回带关联数据的完整记录
    return this.findOne(submission.id)
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
