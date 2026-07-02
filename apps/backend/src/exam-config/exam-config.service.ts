import { Injectable, Inject, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class ExamConfigService implements OnModuleInit {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.examConfig.count()
    if (count === 0) {
      await this.prisma.examConfig.create({ data: {} })
      console.log('✅ 默认考试配置已初始化')
    }
  }

  async get() {
    let config = await this.prisma.examConfig.findFirst()
    if (!config) {
      config = await this.prisma.examConfig.create({ data: {} })
    }
    return config
  }

  async update(data: { passingScore?: number; timeLimit?: number; questionCount?: number }) {
    const config = await this.prisma.examConfig.findFirst()
    if (!config) return this.prisma.examConfig.create({ data })
    return this.prisma.examConfig.update({
      where: { id: config.id },
      data,
    })
  }
}
