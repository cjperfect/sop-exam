import type {
  Exam,
  Submission,
  GenerateExamParams,
  GeneratedExam,
  GradingResult,
} from "@sop/shared";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";

/** 获取考试列表 */
export async function fetchExams() {
  const { data } = await api.get<Exam[]>("/api/exams");
  return data;
}

/** 获取考试详情 */
export async function fetchExam(id: string) {
  const { data } = await api.get<Exam>(`/api/exams/${id}`);
  return data;
}

export interface ExamStreamConfig {
  sopTitle: string;
  timeLimit: number;
  passingScore: number;
  questionCount: number;
}

/**
 * SSE 流式生成试卷
 *
 * POST /api/ai/generate-exam-stream → ReadableStream 逐行解析 SSE
 * SSE 事件类型: config / message / question / done / error
 */
export async function generateExamStreamAPI(
  params: GenerateExamParams,
  callbacks: {
    onConfig: (config: ExamStreamConfig) => void;
    onChunk?: (text: string) => void;
    onQuestion: (question: GeneratedExam["questions"][number]) => void;
    onDone?: (examId: number, questionIds: Array<{ sortOrder: number; id: number }>) => void;
  },
  signal?: AbortSignal,
): Promise<void> {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const token = useAuthStore.getState().auth.accessToken;

  const response = await fetch(`${baseUrl}/api/ai/generate-exam-stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
    signal,
  });

  if (!response.ok) {
    throw new Error(`SSE stream failed: ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let eventType = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        eventType = line.slice(7);
      } else if (line.startsWith("data: ")) {
        const payload = JSON.parse(line.slice(6));
        switch (eventType) {
          case "config":
            callbacks.onConfig(payload);
            break;
          case "message":
            callbacks.onChunk?.(payload.text);
            break;
          case "question":
            callbacks.onQuestion(payload);
            break;
          case "done":
            callbacks.onDone?.(payload.examId, payload.questionIds ?? []);
            break;
          case "error":
            throw new Error(payload.message);
        }
      }
    }
  }
}

/** AI 批改试卷 */
export async function gradeExamAPI(params: {
  questions: Array<{
    type: string;
    content: string;
    options: unknown;
    answer: string;
    score: number;
    sortOrder: number;
    sopSource: string;
  }>;
  answers: Array<{ questionId: number; answer: string | string[] }>;
  userId: string;
  examTitle: string;
  sopTitle: string;
  sopId: number;
}) {
  const { data } = await api.post<GradingResult>("/api/ai/grade-exam", params);
  return data;
}

/** 提交答卷（已废弃 — 改用 createSubmission） */
export async function submitExam(
  examId: string,
  answers: unknown[],
  timeSpent: number,
) {
  const { data } = await api.post<Submission>(`/api/exams/${examId}/submit`, {
    answers,
    timeSpent,
  });
  return data;
}

/** 创建考试（保存 AI 生成的试卷到数据库） */
export async function createExam(exam: {
  sopId: number;
  sopTitle: string;
  title: string;
  description: string;
  totalQuestions: number;
  totalScore: number;
  questions: Array<{
    type: string;
    content: string;
    options: string;
    answer: string;
    score: number;
    sortOrder: number;
    sopSource?: string;
  }>;
}) {
  const { data } = await api.post("/api/exams", exam);
  return data as { id: number; questions?: Array<{ id: number }> };
}

/** 创建提交记录（持久化到数据库） */
export async function createSubmission(submission: {
  examId: number;
  sopId: number;
  answerDetails?: Array<{
    questionId: number;
    userAnswer?: string;
  }>;
}) {
  const { data } = await api.post<Submission>("/api/submissions", submission);
  return data;
}

/** 获取提交记录 */
export async function fetchSubmissions(page = 1): Promise<Submission[]> {
  const { data } = await api.get<{ items: Submission[]; total: number }>(
    "/api/submissions",
    { params: { page, pageSize: 100 } },
  );
  return data.items ?? [];
}

/** 获取提交详情 */
export async function fetchSubmission(id: string) {
  const { data } = await api.get<Submission>(`/api/submissions/${id}`);
  return data;
}
