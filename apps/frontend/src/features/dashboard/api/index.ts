import { api } from '@/lib/api'

export interface DashboardStats {
  totalSops: number
  totalExams: number
  totalUsers: number
  avgPassRate: number
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

/** 获取月度统计（全年12个月） */
export async function fetchMonthlyStats() {
  const { data } = await api.get<MonthlyStat[]>('/api/dashboard/statistics')
  return data
}

/** 获取最近活动 */
export async function fetchRecentActivities(limit = 5) {
  const { data } = await api.get<RecentActivity[]>('/api/dashboard/recent-activities', {
    params: { limit },
  })
  return data
}
