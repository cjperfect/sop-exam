import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class SopsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findAll(page = 1, pageSize = 10, search?: string, user?: { role?: string }) {
    const skip = (page - 1) * pageSize
    const where: Record<string, unknown> = { isDeleted: false }
    if (search) where.title = { contains: search }
    if (!user || user.role !== 'admin') where.status = 'published'
    const [items, total] = await Promise.all([
      this.prisma.sopDocument.findMany({
        where: where as any,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
        include: { department: { select: { name: true } }, uploadedBy: { select: { username: true } } },
      }),
      this.prisma.sopDocument.count({ where: where as any }),
    ])
    const mappedItems = items.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      departmentId: item.departmentId,
      department: item.department.name,
      userId: item.userId,
      uploadedByName: item.uploadedBy.username,
      fileType: item.fileType,
      status: item.status,
      viewCount: item.viewCount,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
    return { items: mappedItems, total, page, pageSize }
  }

  async findOne(id: number) {
    const doc = await this.prisma.sopDocument.findUnique({
      where: { id, isDeleted: false },
      include: { department: { select: { name: true } }, uploadedBy: { select: { username: true } } },
    })
    if (!doc) throw new NotFoundException('SOP 不存在')
    this.prisma.sopDocument.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {})
    return {
      id: doc.id,
      title: doc.title,
      content: doc.content,
      departmentId: doc.departmentId,
      department: doc.department.name,
      userId: doc.userId,
      uploadedByName: doc.uploadedBy.username,
      fileType: doc.fileType,
      status: doc.status,
      viewCount: doc.viewCount,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }
  }

  async create(data: Record<string, unknown>) {
    return this.prisma.sopDocument.create({
      data: {
        title: (data.title as string) ?? '',
        content: (data.content as string) ?? '',
        departmentId: Number(data.departmentId) || 1,
        userId: Number(data.userId) || 1,
        fileType: (data.fileType as string) ?? 'markdown',
        status: (data.status as string) ?? 'draft',
      },
      include: { department: { select: { name: true } }, uploadedBy: { select: { username: true } } },
    })
    return {
      id: doc.id,
      title: doc.title,
      content: doc.content,
      departmentId: doc.departmentId,
      department: doc.department.name,
      userId: doc.userId,
      uploadedByName: doc.uploadedBy.username,
      fileType: doc.fileType,
      status: doc.status,
      viewCount: doc.viewCount,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }
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
