import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class UsersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private select = {
    id: true, username: true, employeeId: true,
    department: true, role: true, createdAt: true,
  } as const

  async findAll(page = 1, pageSize = 10, username?: string, employeeId?: string, role?: string) {
    const skip = (page - 1) * pageSize
    const where: Record<string, unknown> = { isDeleted: false }
    const and: Record<string, unknown>[] = []
    if (username) {
      and.push({ username: { contains: username } })
    }
    if (employeeId) {
      and.push({ employeeId: { contains: employeeId } })
    }
    if (role) {
      and.push({ role })
    }
    if (and.length > 0) {
      where.AND = and
    }
    const [items, total, depts] = await Promise.all([
      this.prisma.user.findMany({ where: where as any, orderBy: { createdAt: 'desc' }, skip, take: pageSize, select: this.select }),
      this.prisma.user.count({ where: where as any }),
      this.prisma.department.findMany({ where: { isDeleted: false }, select: { id: true, name: true } }),
    ])
    const deptMap = new Map(depts.map((d) => [String(d.id), d.name]))
    const mappedItems = items.map((item) => ({
      ...item,
      department: deptMap.get(item.department) || item.department,
    }))
    return { items: mappedItems, total, page, pageSize }
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id, isDeleted: false }, select: this.select })
    if (!user) throw new NotFoundException('用户不存在')
    const dept = await this.prisma.department.findUnique({ where: { id: Number(user.department) }, select: { name: true } })
    return { ...user, department: dept?.name || user.department }
  }

  async getRawUser(id: number) {
    return this.prisma.user.findUnique({ where: { id, isDeleted: false }, select: { id: true, role: true } })
  }

  private generateRandomPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let pwd = ''
    for (let i = 0; i < 10; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    return pwd
  }

  async create(data: Record<string, unknown>) {
    const rawPassword = this.generateRandomPassword()
    const hashedPassword = bcrypt.hashSync(rawPassword, 10)
    const role = (data.role as string) || 'user'
    const user = await this.prisma.user.create({
      data: {
        username: (data.username as string) ?? '',
        employeeId: (data.employeeId as string) ?? '',
        department: (data.department as string) ?? '',
        password: hashedPassword,
        mustChangePassword: true,
        status: 'active',
        role,
      },
      select: { ...this.select, password: false },
    })
    return { ...user, rawPassword }
  }

  async update(id: number, data: Record<string, unknown>) {
    const existing = await this.prisma.user.findUnique({ where: { id, isDeleted: false } })
    if (!existing) throw new NotFoundException('用户不存在')
    return this.prisma.user.update({ where: { id }, data: data as any, select: this.select })
  }

  async remove(id: number) {
    const existing = await this.prisma.user.findUnique({ where: { id, isDeleted: false } })
    if (!existing) throw new NotFoundException('用户不存在')
    await this.prisma.user.update({ where: { id }, data: { isDeleted: true } })
    return { success: true }
  }
}
