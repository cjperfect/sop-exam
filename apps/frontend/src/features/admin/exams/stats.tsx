'use client'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Search } from '@/components/search'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts'
import { Users, ClipboardCheck, TrendingUp, Award } from 'lucide-react'

const monthlyData = [
  { name: '1月', 考试人次: 18, 通过: 14 },
  { name: '2月', 考试人次: 15, 通过: 11 },
  { name: '3月', 考试人次: 22, 通过: 18 },
  { name: '4月', 考试人次: 28, 通过: 24 },
  { name: '5月', 考试人次: 25, 通过: 20 },
  { name: '6月', 考试人次: 32, 通过: 26 },
]

const categoryData = [
  { name: '生产流程', value: 35 },
  { name: '安全规范', value: 25 },
  { name: '质量管理', value: 20 },
  { name: '设备维护', value: 12 },
  { name: '其他', value: 8 },
]

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#8b5cf6']

export function AdminExamStats() {
  return (
    <>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>考试统计</h1>
          <p className='text-muted-foreground'>
            查看平台考试数据的整体概况
          </p>
        </div>

        {/* 概览卡片 */}
        <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>总考试人次</CardTitle>
              <ClipboardCheck className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>156</div>
              <p className='text-xs text-muted-foreground'>累计考试次数</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>通过率</CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-teal-600'>78%</div>
              <p className='text-xs text-muted-foreground'>较上月提升 5%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>学习者</CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>86</div>
              <p className='text-xs text-muted-foreground'>累计参与员工数</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>平均分</CardTitle>
              <Award className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>76.5</div>
              <p className='text-xs text-muted-foreground'>满分 100 分</p>
            </CardContent>
          </Card>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-7'>
          {/* 月度趋势 */}
          <Card className='lg:col-span-4'>
            <CardHeader>
              <CardTitle>月度考试趋势</CardTitle>
              <CardDescription>近 6 个月考试人次与通过数</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey='name' fontSize={12} stroke='#888888' />
                  <YAxis fontSize={12} stroke='#888888' />
                  <Tooltip />
                  <Bar dataKey='考试人次' fill='#2563eb' radius={[4, 4, 0, 0]} />
                  <Bar dataKey='通过' fill='#16a34a' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 分类占比 */}
          <Card className='lg:col-span-3'>
            <CardHeader>
              <CardTitle>SOP 分类考试分布</CardTitle>
              <CardDescription>各分类考试占比</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={100}
                    dataKey='value'
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
