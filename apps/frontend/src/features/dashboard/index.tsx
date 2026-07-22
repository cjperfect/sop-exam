import { useQuery } from "@tanstack/react-query";
import { BookOpen, ClipboardCheck, FileText, Users, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { ThemeSwitch } from "@/components/theme-switch";
import { fetchDashboardStats, fetchMonthlyStats, fetchRecentActivities } from "./api";
import { Overview } from "./components/overview";
import { RecentLearning } from "./components/recent-learning";

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
  });

  const { data: monthlyStats } = useQuery({
    queryKey: ["dashboard", "monthly"],
    queryFn: () => fetchMonthlyStats(6),
  });

  const { data: activities } = useQuery({
    queryKey: ["dashboard", "activities"],
    queryFn: () => fetchRecentActivities(5),
  });

  return (
    <>
      <Header>
        <div className="me-auto" />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">首页仪表盘</h1>
          <p className="text-muted-foreground">SOP 学习平台概览</p>
        </div>

        {statsLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            加载中...
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">SOP 文档总数</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalSops ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    其中已发布 {stats?.publishedSops ?? 0} 篇 · 累计浏览 {(stats?.totalViews ?? 0).toLocaleString()} 次
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">完成考试</CardTitle>
                  <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalExams ?? 0}</div>
                  <p className="text-xs text-muted-foreground">本月新增 {stats?.monthlyExams ?? 0} 次</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">学习者</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
                  <p className="text-xs text-muted-foreground">活跃用户 {stats?.activeUsers ?? 0} 人</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均通过率</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.avgPassRate ?? 0}%</div>
                  <p className="text-xs text-muted-foreground">较上月提升 3%</p>
                </CardContent>
              </Card>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>月度考试概览</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview data={monthlyStats} />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>最近学习动态</CardTitle>
                  <CardDescription>平台最新的学习活动记录</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentLearning data={activities} />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </Main>
    </>
  );
}
