import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class NotesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findAll(params?: { search?: string; userName?: string; page?: number; pageSize?: number }) {
    const where: Record<string, unknown> = { isDeleted: false }
    if (params?.search) where.content = { contains: params.search }
    if (params?.userName) where.userName = params.userName
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 10
    const skip = (page - 1) * pageSize
    const [items, total] = await Promise.all([
      this.prisma.note.findMany({ where: where as any, orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
      this.prisma.note.count({ where: where as any }),
    ])
    return { items, total, page, pageSize }
  }

  async findOne(id: number) {
    const note = await this.prisma.note.findUnique({ where: { id, isDeleted: false } })
    if (!note) throw new NotFoundException('笔记不存在')
    return note
  }

  async create(data: Record<string, unknown>) {
    return this.prisma.note.create({
      data: {
        sopId: (data.sopId as number) ?? 0,
        sopTitle: (data.sopTitle as string) ?? '',
        userId: (data.userId as number) ?? 0,
        userName: (data.userName as string) ?? '',
        content: (data.content as string) ?? '',
        pageRef: (data.pageRef as string) ?? null,
      },
    })
  }

  async update(id: number, data: Record<string, unknown>) {
    const existing = await this.prisma.note.findUnique({ where: { id, isDeleted: false } })
    if (!existing) throw new NotFoundException('笔记不存在')
    return this.prisma.note.update({ where: { id }, data: data as any })
  }

  async remove(id: number) {
    const existing = await this.prisma.note.findUnique({ where: { id, isDeleted: false } })
    if (!existing) throw new NotFoundException('笔记不存在')
    await this.prisma.note.update({ where: { id }, data: { isDeleted: true } })
    return { success: true }
  }
}
