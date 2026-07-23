import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import type { CreateExamDto } from './dto/exams.dto.js'

@Injectable()
export class ExamsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findAll(page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize
    const where = { isDeleted: false }
    const [items, total] = await Promise.all([
      this.prisma.exam.findMany({
        where,
        include: {
          sop: { select: { id: true, title: true } },
          config: { select: { passingScore: true, timeLimit: true } },
          _count: { select: { questions: true, submissions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.exam.count({ where }),
    ])

    const mappedItems = items.map((item) => ({
      id: item.id,
      sopId: item.sopId,
      sopTitle: item.sop?.title ?? '',
      configId: item.configId,
      title: item.title,
      description: item.description,
      status: item.status,
      totalQuestions: item.totalQuestions,
      totalScore: item.totalScore,
      passingScore: item.config?.passingScore ?? 60,
      timeLimit: item.config?.timeLimit ?? 30,
      createdBy: item.createdBy,
      questionCount: item._count.questions,
      attemptCount: item._count.submissions,
      aiAnalysis: item.aiAnalysis,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))

    return { items: mappedItems, total, page, pageSize }
  }

  async findOne(id: number) {
    const exam = await this.prisma.exam.findUnique({
      where: { id, isDeleted: false },
      include: {
        sop: { select: { id: true, title: true } },
        config: { select: { passingScore: true, timeLimit: true } },
        questions: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { submissions: true } },
      },
    })
    if (!exam) {
      throw new NotFoundException('考试不存在')
    }

    return {
      id: exam.id,
      sopId: exam.sopId,
      sopTitle: exam.sop?.title ?? '',
      configId: exam.configId,
      title: exam.title,
      description: exam.description,
      status: exam.status,
      totalQuestions: exam.totalQuestions,
      totalScore: exam.totalScore,
      passingScore: exam.config?.passingScore ?? 60,
      timeLimit: exam.config?.timeLimit ?? 30,
      createdBy: exam.createdBy,
      aiAnalysis: exam.aiAnalysis,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
      attemptCount: exam._count.submissions,
      questions: exam.questions.map((q) => ({
        id: q.id,
        type: q.type,
        content: q.content,
        options: q.options,
        answer: q.answer,
        score: q.score,
        sortOrder: q.sortOrder,
        sopSource: q.sopSource,
      })),
    }
  }

  async create(dto: CreateExamDto) {
    // 获取或创建默认考试配置
    const config = await this.prisma.examConfig.findFirst()
    if (!config) {
      throw new NotFoundException('考试配置不存在，请先配置考试参数')
    }

    const exam = await this.prisma.exam.create({
      data: {
        sopId: dto.sopId,
        configId: config.id,
        title: dto.title,
        description: dto.description ?? '',
        totalQuestions: dto.totalQuestions ?? 0,
        totalScore: dto.totalScore ?? 0,
        status: 'published',
        createdBy: '',
        questions: {
          create: (dto.questions ?? []).map((q) => ({
            type: q.type,
            content: q.content,
            options: (q.options ? tryParseJson(q.options) : null) as any,
            answer: q.answer ?? '',
            score: q.score ?? 0,
            sortOrder: q.sortOrder ?? 0,
            sopSource: q.sopSource ?? null,
          })),
        },
      },
      include: {
        questions: { orderBy: { sortOrder: 'asc' } },
        config: { select: { passingScore: true, timeLimit: true } },
      },
    }) as any

    return {
      id: exam.id,
      sopId: exam.sopId,
      title: exam.title,
      totalQuestions: exam.totalQuestions,
      totalScore: exam.totalScore,
      passingScore: exam.config?.passingScore ?? 60,
      timeLimit: exam.config?.timeLimit ?? 30,
      questions: (exam.questions as any[]).map((q: any) => ({
        id: q.id,
        type: q.type,
        content: q.content,
        options: q.options,
        answer: q.answer,
        score: q.score,
        sortOrder: q.sortOrder,
        sopSource: q.sopSource,
      })),
    }
  }

  async submit(_id: number, _answers: unknown[]) {
    return { message: 'not implemented yet' }
  }

  async updateAiAnalysis(id: number, aiAnalysis: string) {
    const existing = await this.prisma.exam.findUnique({ where: { id, isDeleted: false } })
    if (!existing) throw new NotFoundException('考试不存在')
    return this.prisma.exam.update({
      where: { id },
      data: { aiAnalysis },
    })
  }
}

/** 安全解析 JSON 字符串，解析失败则返回原始值 */
function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}
