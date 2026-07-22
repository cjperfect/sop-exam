import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Submission } from "@sop/shared";
import { Eye, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ExamListTableProps {
  submissions: Record<string, any>;
  onView: (id: string) => void;
}

export function ExamListTable({ submissions, onView }: ExamListTableProps) {
  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Clock className="mb-4 h-16 w-16 opacity-20" />
        <p className="text-lg">暂无考试记录</p>
        <p className="text-sm">去浏览 SOP 文档并生成试卷开始考试吧</p>
        <Button asChild className="mt-4">
          <Link to="/sops">浏览 SOP 文档</Link>
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SOP 名称</TableHead>
          <TableHead>得分</TableHead>
          <TableHead>结果</TableHead>
          <TableHead>用时</TableHead>
          <TableHead>考试时间</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((sub: any) => {
          const minutes = Math.floor(sub.timeSpent / 60);
          const seconds = sub.timeSpent % 60;

          return (
            <TableRow key={sub.id}>
              <TableCell className="max-w-48 truncate font-medium">
                {sub.sopTitle}
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "font-bold",
                    sub.isPassed ? "text-teal-600" : "text-destructive",
                  )}
                >
                  {sub.totalScore}/{sub.totalMaxScore}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    sub.isPassed
                      ? "bg-teal-100/30 text-teal-900 dark:text-teal-200"
                      : "bg-destructive/10 text-destructive"
                  }
                >
                  {sub.isPassed ? "通过" : "未通过"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {minutes} 分 {seconds} 秒
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(sub.submittedAt).toLocaleDateString("zh-CN")}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(sub.id)}
                >
                  <Eye size={16} />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
