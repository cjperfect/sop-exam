import { Controller, Get, Query, UseGuards, Inject } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { DashboardService } from './dashboard.service.js'

@ApiTags('仪表盘')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/dashboard')
export class DashboardController {
  constructor(@Inject(DashboardService) private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: '获取仪表盘统计' })
  getStats() {
    return this.dashboardService.getStats()
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取月度统计' })
  getStatistics(@Query('months') months?: string) {
    return this.dashboardService.getStatistics(Number(months) || 6)
  }

  @Get('recent-activities')
  @ApiOperation({ summary: '获取最近学习动态' })
  getRecentActivities(@Query('limit') limit?: string) {
    return this.dashboardService.getRecentActivities(Number(limit) || 5)
  }
}
