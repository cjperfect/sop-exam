import { Injectable, Inject, OnModuleInit, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin()
    await this.seedUser()
  }

  private async seedAdmin() {
    const hashedPassword = bcrypt.hashSync('admin', 10)
    await this.prisma.user.upsert({
      where: { username: 'admin' },
      update: { password: hashedPassword, mustChangePassword: false, role: 'super_admin' },
      create: {
        username: 'admin',
        employeeId: '800000',
        password: hashedPassword,
        status: 'active',
        role: 'super_admin',
        mustChangePassword: false,
      },
    })
    console.log('✅ 超级管理员账号已就绪 (admin / admin)')
  }

  private async seedUser() {
    const hashedPassword = bcrypt.hashSync('user', 10)
    await this.prisma.user.upsert({
      where: { username: 'user' },
      update: {},
      create: {
        username: 'user',
        employeeId: '800001',
        password: hashedPassword,
        status: 'active',
        role: 'user',
        mustChangePassword: false,
      },
    })
    console.log('✅ 普通用户账号已就绪 (user / user, 工号: 800001)')
  }

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } })
    if (!user) throw new UnauthorizedException('账号或密码错误')

    const isPasswordValid = bcrypt.compareSync(password, user.password)
    if (!isPasswordValid) throw new UnauthorizedException('账号或密码错误')

    const payload = { sub: user.id, username: user.username, role: user.role }
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        accountNo: user.id,
        username: user.username,
        role: [user.role],
        exp: Date.now() + 24 * 60 * 60 * 1000,
      },
      mustChangePassword: user.mustChangePassword,
    }
  }

  async register(data: { username: string; password: string }) {
    const exists = await this.prisma.user.findUnique({ where: { username: data.username } })
    if (exists) throw new UnauthorizedException('用户名已存在')

    const hashedPassword = bcrypt.hashSync(data.password, 10)
    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        status: 'active',
        role: 'user',
      },
    })

    const payload = { sub: user.id, username: user.username, role: user.role }
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        accountNo: user.id,
        username: user.username,
        role: [user.role],
        exp: Date.now() + 24 * 60 * 60 * 1000,
      },
    }
  }

  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) return null
    return {
      id: user.id,
      username: user.username,
      role: [user.role],
    }
  }

  async getUserById(id: number) {
    return this.prisma.user.findUnique({ where: { id }, select: { id: true, role: true } })
  }

  async adminResetPassword(targetUserId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } })
    if (!user) throw new UnauthorizedException('用户不存在')

    const rawPassword = this.generateRandomPassword()
    const hashed = bcrypt.hashSync(rawPassword, 10)
    await this.prisma.user.update({
      where: { id: targetUserId },
      data: { password: hashed, mustChangePassword: true },
    })
    return { rawPassword }
  }

  private generateRandomPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let pwd = ''
    for (let i = 0; i < 10; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    return pwd
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new UnauthorizedException('用户不存在')

    const isValid = bcrypt.compareSync(oldPassword, user.password)
    if (!isValid) throw new UnauthorizedException('原密码错误')

    const hashed = bcrypt.hashSync(newPassword, 10)
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed, mustChangePassword: false },
    })
    return { success: true }
  }
}
