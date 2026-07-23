import type { AnswerRecord } from "@sop/shared";
import { CheckCircle2, XCircle, BookOpen, Link } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { questionTypeLabels } from "./exam-question";

/** 安全解析 options — 兼容已解析的对象和 JSON 字符串 */
function parseOptions(options: unknown): { key: string; value: string }[] {
  if (Array.isArray(options)) return options as { key: string; value: string }[];
  if (typeof options === "string") {
    try { return JSON.parse(options); } catch { return []; }
  }
  return [];
}

/** 判断 options 是否为空 */
function isOptionsEmpty(options: unknown): boolean {
  if (Array.isArray(options)) return options.length === 0;
  if (typeof options === "string") return options === "" || options === "[]";
  return true;
}

interface ExamAnswerReviewProps {
  answers: AnswerRecord[];
}

export function ExamAnswerReview({ answers }: ExamAnswerReviewProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">逐题回顾</h3>
      {answers.map((record, i) => (
        <div
          key={record.questionId}
          className={cn(
            "rounded-lg border p-4 transition-colors",
            record.isCorrect
              ? "border-teal-500/20 bg-teal-50/50 dark:bg-teal-950/10"
              : "border-destructive/20 bg-destructive/5",
          )}
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{i + 1}</Badge>
              <Badge variant="secondary" className="text-xs">
                {questionTypeLabels[record.questionType]}
              </Badge>
              <span className="text-xs text-muted-foreground">{record.maxScore} 分</span>
            </div>
            {record.isCorrect ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-600" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-destructive" />
            )}
          </div>

          <p className="mb-3 text-sm font-medium">{record.questionContent}</p>

          {record.options && !isOptionsEmpty(record.options) && (
            <div className="mb-2 space-y-1 text-sm text-muted-foreground">
              {parseOptions(record.options).map((opt) => (
                <div key={opt.key} className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs">
                    {opt.key.toUpperCase()}
                  </span>
                  {opt.value}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1 text-sm">
            <div className="flex gap-2">
              <span className="shrink-0 text-muted-foreground">你的答案：</span>
              <span className={cn(record.isCorrect ? "text-teal-700" : "text-destructive")}>
                {record.answer || "未作答"}
              </span>
            </div>
            {!record.isCorrect && (
              <div className="flex gap-2">
                <span className="shrink-0 text-muted-foreground">正确答案：</span>
                <span className="text-teal-700">{record.correctAnswer}</span>
              </div>
            )}
          </div>

          {record.aiFeedback && (
            <div className="mt-2 flex gap-2 rounded-md bg-muted/50 p-2 text-sm text-muted-foreground">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{record.aiFeedback}</span>
            </div>
          )}

          {record.sopSource && (
            <div className="mt-2 flex gap-2 rounded-md bg-muted/50 p-2 text-sm text-muted-foreground">
              <Link className="mt-0.5 h-4 w-4 shrink-0" />
              <span>来源：{record.sopSource}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
