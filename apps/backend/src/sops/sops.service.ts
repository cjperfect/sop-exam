import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class SopsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findAll(page = 1, pageSize = 10, search?: string, department?: string, status?: string) {
    const skip = (page - 1) * pageSize
    const where: Record<string, unknown> = { isDeleted: false }
    if (search) where.title = { contains: search }
    if (department) where.department = department
    if (status) where.status = status
    const [items, total] = await Promise.all([
      this.prisma.sopDocument.findMany({ where: where as any, orderBy: { updatedAt: 'desc' }, skip, take: pageSize }),
      this.prisma.sopDocument.count({ where: where as any }),
    ])
    return { items, total, page, pageSize }
  }

  async findOne(id: number) {
    const doc = await this.prisma.sopDocument.findUnique({ where: { id, isDeleted: false } })
    if (!doc) throw new NotFoundException('SOP 不存在')
    return doc
  }

  async create(data: Record<string, unknown>) {
    return this.prisma.sopDocument.create({
      data: {
        title: (data.title as string) ?? '',
        content: (data.content as string) ?? '',
        department: (data.department as string) ?? '',
        fileType: (data.fileType as string) ?? 'markdown',
        status: (data.status as string) ?? 'draft',
      },
    })
  }

  async update(id: number, data: Record<string, unknown>) {
    const existing = await this.prisma.sopDocument.findUnique({ where: { id, isDeleted: false } })
    if (!existing) throw new NotFoundException('SOP 不存在')
    return this.prisma.sopDocument.update({
      where: { id },
      data: data as any,
    })
  }

  async remove(id: number) {
    const existing = await this.prisma.sopDocument.findUnique({ where: { id, isDeleted: false } })
    if (!existing) throw new NotFoundException('SOP 不存在')
    await this.prisma.sopDocument.update({ where: { id }, data: { isDeleted: true } })
    return { success: true }
  }
}
