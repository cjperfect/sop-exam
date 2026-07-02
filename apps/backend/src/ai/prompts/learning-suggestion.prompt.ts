/**
 * 学习建议提示词 — 逐题分析 + 全局建议
 */
export function buildSuggestionPrompt(params: {
  examTitle: string
  sopTitle: string
  totalScore: number
  totalMaxScore: number
  questionResults: Array<{
    index: number
    questionContent: string
    isCorrect: boolean
    correctAnswer: string
    userAnswer: string
    sopSource?: string
  }>
}) {
  const { examTitle, sopTitle, totalScore, totalMaxScore, questionResults } = params
  const percentage = Math.round((totalScore / totalMaxScore) * 100)
  const wrongQuestions = questionResults.filter((r) => !r.isCorrect)

  const allDetails = questionResults
    .map(
      (q, i) =>
        `第${i + 1}题：${q.questionContent}\n  正确答案：${q.correctAnswer}\n  你的答案：${q.userAnswer || '未作答'}\n  结果：${q.isCorrect ? '正确' : '错误'}${q.sopSource ? `\n  SOP来源：${q.sopSource}` : ''}`,
    )
    .join('\n\n')

  const systemPrompt = `你是一个专业的学习辅导专家。请对每道题给出简短分析，并给出整体学习建议。

对每道题（包括正确的和错误的）给出20-40字的简短点评：
- 正确的题目：肯定并点明考察的知识点
- 错误的题目：指出错误原因，引导到正确的SOP知识点

最后给出3-5条整体学习建议。

严格按以下JSON格式输出（不要包含其他文字）：
{
  "perQuestion": [
    {"index": 1, "feedback": "简短点评内容"},
    {"index": 2, "feedback": "简短点评内容"}
  ],
  "overall": "整体学习建议，150-300字"
}`

  const userPrompt = `考试：${examTitle}
SOP文档：${sopTitle}
得分：${totalScore} / ${totalMaxScore}（${percentage}%）
答错 ${wrongQuestions.length} 题 / 共 ${questionResults.length} 题

答题详情：
${allDetails}

请对每道题给出点评，并给出整体学习建议。`

  return { systemPrompt, userPrompt }
}

/** AI 返回结构 */
export interface SuggestionResult {
  perQuestion: Array<{ index: number; feedback: string }>
  overall: string
}
