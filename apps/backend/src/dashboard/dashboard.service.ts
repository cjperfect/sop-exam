import { Injectable, Inject } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class DashboardService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getStats() {
    const [totalSops, publishedSops, totalExams, totalUsers] = await Promise.all([
      this.prisma.sopDocument.count({ where: { isDeleted: false } }),
      this.prisma.sopDocument.count({ where: { isDeleted: false, status: 'published' } }),
      this.prisma.submission.count({ where: { isDeleted: false } }),
      this.prisma.user.count({ where: { isDeleted: false } }),
    ])

    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const monthlyExams = await this.prisma.submission.count({
      where: { isDeleted: false, createdAt: { gte: thisMonth } },
    })

    const activeUsers = await this.prisma.user.count({
      where: { isDeleted: false, status: 'active' },
    })

    const passedSubmissions = await this.prisma.submission.count({
      where: { isDeleted: false, isPassed: true },
    })
    const avgPassRate = totalExams > 0 ? Math.round((passedSubmissions / totalExams) * 100) : 0

    return { totalSops, publishedSops, totalExams, monthlyExams, totalUsers, activeUsers, avgPassRate }
  }

  async getStatistics(months: number) {
    const names = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    const now = new Date()
    const result = []
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)
      const total = await this.prisma.submission.count({
        where: { isDeleted: false, createdAt: { gte: d, lt: end } },
      })
      result.push({ name: names[d.getMonth()], total })
    }
    return result
  }

  async getRecentActivities(limit: number) {
    const submissions = await this.prisma.submission.findMany({
      where: { isDeleted: false },
      orderBy: { submittedAt: 'desc' },
      take: limit,
    })
    return submissions.map((s) => ({
      id: s.id,
      userName: s.userName || '未知用户',
      isPassed: s.isPassed,
      score: s.totalScore,
      totalMaxScore: s.totalMaxScore,
      submittedAt: s.submittedAt,
    }))
  }
}
