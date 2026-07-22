import { api } from '@/lib/api'

export interface DashboardStats {
  totalSops: number
  publishedSops: number
  totalExams: number
  monthlyExams: number
  totalUsers: number
  activeUsers: number
  avgPassRate: number
  totalViews: number
}

export interface MonthlyStat {
  name: string
  total: number
}

export interface RecentActivity {
  id: number
  userName: string
  isPassed: boolean
  score: number
  totalMaxScore: number
  submittedAt: string
}

/** 获取仪表盘统计 */
export async function fetchDashboardStats() {
  const { data } = await api.get<DashboardStats>('/api/dashboard/stats')
  return data
}

/** 获取月度统计 */
export async function fetchMonthlyStats(months = 6) {
  const { data } = await api.get<MonthlyStat[]>('/api/dashboard/statistics', {
    params: { months },
  })
  return data
}

/** 获取最近活动 */
export async function fetchRecentActivities(limit = 5) {
  const { data } = await api.get<RecentActivity[]>('/api/dashboard/recent-activities', {
    params: { limit },
  })
  return data
}
