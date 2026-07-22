import { Injectable, Inject } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class ExamConfigService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

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
