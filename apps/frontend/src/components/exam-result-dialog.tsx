import { useQuery } from "@tanstack/react-query";
import type { Submission } from "@sop/shared";
import { CheckCircle2, Clock, Trophy, ListChecks, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { fetchSubmission } from "@/features/exams/api";
import { ExamAnswerReview } from "@/features/exams/components/exam-answer-review";
import { ExamSuggestionPanel } from "@/features/exams/components/exam-suggestion-panel";

interface QuestionData {
  id: string;
  type: string;
  content: string;
  options: string;
  answer: string;
  score: number;
  sortOrder: number;
  sopSource: string;
}

interface ExamPreviewData {
  id: string;
  title: string;
  sopTitle: string;
  totalQuestions: number;
  totalScore: number;
  passingScore: number;
  timeLimit: number;
  status: string;
  createdAt: string;
  questions: QuestionData[];
}

const typeLabels: Record<string, string> = {
  single_choice: "单选题",
  multi_choice: "多选题",
  true_false: "判断题",
  fill_blank: "填空题",
};

interface ExamResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 考试批卷结果模式（从后端 fetch） */
  submissionId?: string | null;
  /** 考试批卷结果模式（直接传入，跳过 fetch） */
  submission?: Submission | null;
  /** 考试预览模式（管理员查看考试详情） */
  preview?: ExamPreviewData | null;
}

export function ExamResultDialog({
  open,
  onOpenChange,
  submissionId,
  submission: inlineSubmission,
  preview,
}: ExamResultDialogProps) {
  const isPreview = !!preview;
  const hasInline = !!inlineSubmission;

  const { data: fetched, isLoading } = useQuery({
    queryKey: ["submission", submissionId],
    queryFn: () => fetchSubmission(submissionId!),
    enabled: !!submissionId && !isPreview && !hasInline,
  });

  const submission = hasInline ? inlineSubmission : fetched;

  if (!isPreview && !hasInline && isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Trophy className="h-5 w-5" /> 考试结果
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            加载中...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!isPreview && !submission) return null;
  if (isPreview && !preview) return null;

  // --- 预览模式数据 ---
  const previewTitle = preview?.title ?? "";
  const previewQuestions = preview?.questions ?? [];
  const previewInfo = preview
    ? {
        totalQuestions: preview.totalQuestions,
        totalScore: preview.totalScore,
        passingScore: preview.passingScore,
        timeLimit: preview.timeLimit,
        status: preview.status,
        createdAt: preview.createdAt,
      }
    : null;

  // --- 批卷模式数据 ---
  const s = isPreview
    ? null
    : {
        ...submission!,
        answers: Array.isArray(submission!.answers)
          ? submission!.answers
          : typeof submission!.answers === "string"
            ? JSON.parse(submission!.answers)
            : [],
      };
  const correctCount = s?.answers?.filter((a: any) => a.isCorrect).length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isPreview ? (
              <>
                <ListChecks className="h-5 w-5" /> 考试详情
              </>
            ) : (
              <>
                <Trophy className={cn("h-5 w-5", s?.isPassed ? "text-amber-500" : "text-muted-foreground")} /> 考试结果
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* 固定顶部：概览信息 */}
        <div className="shrink-0 space-y-3">
          <div className={cn("rounded-lg border p-5 text-center")}>
            <p className="text-sm text-muted-foreground">{isPreview ? previewTitle : s?.sopTitle}</p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="text-4xl font-bold text-teal-600">{s?.totalScore ?? "-"}</span>
              <span className="text-lg text-muted-foreground">
                / {s?.totalMaxScore ?? previewInfo?.totalScore ?? 0}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              {!isPreview && s && (
                <>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-teal-600" />
                    正确 {correctCount}/{s.answers.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {Math.floor(s.timeSpent / 60)} 分 {s.timeSpent % 60} 秒
                  </span>
                </>
              )}
              <span className="text-muted-foreground">
                总计 {isPreview ? previewInfo!.totalQuestions : s?.answers.length} 题 /{" "}
                {isPreview ? previewInfo!.totalScore : s?.totalMaxScore} 分
              </span>
            </div>
          </div>
        </div>

        <Separator className="shrink-0" />

        {/* 可滚动区域：题目列表 / 逐题回顾 */}
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {isPreview ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">题目列表</h3>
              {previewQuestions.map((q, i) => (
                <div key={q.id ?? i} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="outline">{i + 1}</Badge>
                    <Badge variant="secondary" className="text-xs">
                      {typeLabels[q.type] || q.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{q.score} 分</span>
                  </div>
                  <p className="mb-3 text-sm font-medium">{q.content}</p>
                  <div className="flex gap-2 text-sm">
                    <span className="text-muted-foreground">正确答案：</span>
                    <span className="font-medium text-teal-700">{q.answer}</span>
                  </div>
                  {q.sopSource && <p className="mt-2 text-xs text-muted-foreground">来源：{q.sopSource}</p>}
                </div>
              ))}
            </div>
          ) : (
            <ExamAnswerReview answers={s!.answers} />
          )}
        </div>

        {!isPreview && s?.suggestions && (
          <div className="shrink-0">
            <ExamSuggestionPanel suggestions={s.suggestions} />
          </div>
        )}

        <div className="shrink-0 pt-2">
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
