import { useState, useEffect, useCallback, useRef } from "react";
import type { Question } from "@sop/shared";
import type { SopDocument, Submission } from "@sop/shared";
import { ArrowLeft, ChevronLeft, ChevronRight, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ExamResultDialog } from "@/components/exam-result-dialog";
import { generateExamStreamAPI, createSubmission } from "../api";
import { ExamProgress } from "./exam-progress";
import { ExamQuestion } from "./exam-question";
import { ExamTimer } from "./exam-timer";

interface InlineExamProps {
  sop: SopDocument;
  onBack: () => void;
}

export function InlineExam({ sop, onBack }: InlineExamProps) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examId, setExamId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [streamText, setStreamText] = useState("");
  const [timeLimit, setTimeLimit] = useState(15);
  const [exitOpen, setExitOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<Submission | null>(null);
  const questionIdMap = useRef<Map<number, number>>(new Map());
  const timerRunningRef = useRef(true);
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    const abortController = new AbortController();
    let cancelled = false;

    // setTimeout(0) 跳过 React 18 StrictMode 的 mount→unmount→remount 周期
    const timer = setTimeout(async () => {
      try {
        await generateExamStreamAPI(
          { sopId: sop.id },
          {
            onConfig: (config) => {
              if (cancelled) return;
              setTimeLimit(config.timeLimit);
            },
            onChunk: (text) => {
              if (cancelled) return;
              setStreamText((prev) => prev + text);
            },
            onQuestion: (q) => {
              if (cancelled) return;
              setQuestions((prev) => [...prev, q]);
            },
            onDone: (id, qIds) => {
              if (cancelled) return;
              setExamId(id);
              const map = new Map<number, number>();
              qIds.forEach((q) => map.set(q.sortOrder, q.id));
              questionIdMap.current = map;
            },
          },
          abortController.signal,
        );
      } catch (e) {
        if (!cancelled && !abortController.signal.aborted) {
          console.error("生成试卷失败:", e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sop.id]);

  const handleAnswerChange = useCallback(
    (value: string | string[]) => {
      setAnswers((prev) => ({ ...prev, [currentIndex]: value }));
    },
    [currentIndex],
  );

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    timerRunningRef.current = false;

    if (!examId) return;

    try {
      const saved = await createSubmission({
        examId,
        sopId: sop.id,
        answerDetails: questions.map((q, i) => ({
          questionId: questionIdMap.current.get(q.sortOrder) ?? q.sortOrder,
          userAnswer: typeof answers[i] === "string" ? answers[i] : JSON.stringify(answers[i] ?? ""),
        })),
      });
      setSubmissionResult(saved);
      setResultOpen(true);
    } catch {
      onBack();
    }
  }, [questions, answers, sop, examId, onBack]);

  const handleTimeout = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  const handleWarning = useCallback(() => {
    toast.warning("⏰ 距离考试结束还有 1 分钟，请尽快作答！");
  }, []);

  // 交卷期间禁止刷新页面
  useEffect(() => {
    if (!submitting) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [submitting]);

  // 初始加载（尚无题目）
  if (loading && questions.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-full max-w-xl space-y-6 px-4">
          <div className="text-center">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="absolute inset-2 animate-pulse rounded-full bg-primary/30" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30">
                <Spinner className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <p className="mt-3 text-lg font-semibold tracking-tight">AI 正在生成试卷</p>
          </div>

          {streamText && (
            <pre className="max-h-[60vh] overflow-auto rounded-lg bg-muted/50 p-4 text-left text-[14px] whitespace-pre-wrap text-muted-foreground">
              {streamText}
            </pre>
          )}

          {!streamText && (
            <>
              <p className="animate-pulse text-center text-sm text-muted-foreground">
                正在分析 SOP 内容，智能出题中...
              </p>
              <div className="mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-full origin-left animate-[loading-bar_2s_ease-in-out_infinite] rounded-full bg-primary" />
              </div>
            </>
          )}

          <style>{`@keyframes loading-bar { 0% { transform: scaleX(0); } 100% { transform: scaleX(1); } }`}</style>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <>
      {/* 交卷遮罩 — 全部不可操作 */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center">
            <Spinner className="h-10 w-10 text-primary" />
            <div>
              <p className="text-lg font-semibold">正在批改试卷</p>
              <p className="text-sm text-muted-foreground">请勿刷新或关闭页面</p>
            </div>
          </div>
        </div>
      )}

      {loading && questions.length > 0 && (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
          <div className="flex items-center gap-3">
            <Spinner className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI 生成中... 已完成 {questions.length} 题</span>
            <pre className="flex-1 truncate text-xs text-muted-foreground">{streamText.slice(-200)}</pre>
          </div>
        </div>
      )}
      {/* 顶部栏 */}
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setExitOpen(true)}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          退出考试
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{sop.title}</span>
          <ExamTimer
            timeLimit={timeLimit}
            onTimeout={handleTimeout}
            onWarning={handleWarning}
            running={timerRunningRef.current && !submitting}
          />
        </div>
        <div className="w-20" />
      </div>

      <Separator className="mb-6" />

      {/* 试题区域 */}
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <ExamProgress current={currentIndex + 1} total={questions.length} answers={answers} />
        </div>

        <Separator className="mb-6" />

        {currentQuestion && (
          <ExamQuestion
            question={currentQuestion}
            index={currentIndex}
            value={answers[currentIndex] ?? ""}
            onChange={loading ? () => {} : handleAnswerChange}
          />
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0 || loading}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            上一题
          </Button>
          <span className="text-sm text-muted-foreground">
            已答 {Object.keys(answers).length} / {questions.length} 题
          </span>
          {currentIndex < questions.length - 1 ? (
            <Button onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))} disabled={loading}>
              下一题
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting || loading} className="bg-teal-600 hover:bg-teal-700">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  批改中...
                </>
              ) : (
                <>
                  <Send className="mr-1 h-4 w-4" />
                  交卷
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* 退出确认 */}
      <ConfirmDialog
        open={exitOpen}
        onOpenChange={setExitOpen}
        title="退出考试"
        desc="确定要退出当前考试吗？当前答题进度将不会保存。"
        confirmText="确认退出"
        cancelBtnText="继续答题"
        destructive
        handleConfirm={() => {
          timerRunningRef.current = false;
          onBack();
        }}
      />

      {/* 成绩弹窗 */}
      <ExamResultDialog
        open={!!submissionResult && resultOpen}
        onOpenChange={(o) => {
          if (!o) {
            setResultOpen(false);
            onBack();
          }
        }}
        submission={submissionResult}
      />
    </>
  );
}
