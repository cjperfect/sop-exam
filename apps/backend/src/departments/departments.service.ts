import { Injectable, Inject, NotFoundException, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'

const SEED_DEPARTMENTS = [
  { name: 'AI与软件', description: 'AI与软件部门' },
  { name: '产品中心', description: '产品中心' },
  { name: 'GTM', description: 'GTM部门' },
  { name: 'DQA', description: 'DQA部门' },
  { name: '结构部', description: '结构部' },
  { name: 'ID', description: 'ID部门' },
  { name: '嵌入式', description: '嵌入式部门' },
  { name: '电子部', description: '电子部门' },
]

@Injectable()
export class DepartmentsService implements OnModuleInit {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.department.count()
    if (count > 0) return
    for (const d of SEED_DEPARTMENTS) {
      await this.prisma.department.create({ data: d })
    }
    console.log('✅ 默认部门已初始化')
  }

  async findAll() {
    return this.prisma.department.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, description: true },
    })
  }

  async findOne(id: number) {
    const dept = await this.prisma.department.findUnique({ where: { id } })
    if (!dept) throw new NotFoundException('部门不存在')
    return dept
  }

  async create(data: { name: string; description?: string }) {
    return this.prisma.department.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() ?? '',
      },
    })
  }

  async update(id: number, data: { name?: string; description?: string }) {
    const existing = await this.prisma.department.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('部门不存在')
    return this.prisma.department.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description.trim() } : {}),
      },
    })
  }

  async remove(id: number) {
    const existing = await this.prisma.department.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('部门不存在')
    await this.prisma.department.update({ where: { id }, data: { isDeleted: true } })
    return { success: true }
  }
}
