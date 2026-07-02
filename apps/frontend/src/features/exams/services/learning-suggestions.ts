import type { AnswerRecord } from '../data/submission-schema'

interface SuggestionParams {
  examTitle: string
  sopTitle: string
  totalScore: number
  totalMaxScore: number
  questionResults: AnswerRecord[]
}

/**
 * AI 学习建议生成
 */
export async function generateLearningSuggestions(
  params: SuggestionParams,
): Promise<string> {
  const { sopTitle, totalScore, totalMaxScore, questionResults } = params
  const percentage = Math.round((totalScore / totalMaxScore) * 100)
  const wrongCount = questionResults.filter((r) => !r.isCorrect).length

  // 尝试真实 API（预留）
  try {
    // const response = await axios.post('/api/ai/suggestions', params)
    // return response.data
    throw new Error('AI API not configured')
  } catch {
    return mockSuggestions(sopTitle, percentage, wrongCount)
  }
}

function mockSuggestions(
  sopTitle: string,
  percentage: number,
  wrongCount: number,
): string {
  if (percentage >= 90) {
    return `🎉 优秀！你对《${sopTitle}》掌握得很好。建议定期复习以巩固知识，同时可以学习其他相关的 SOP 文档。`
  }
  if (percentage >= 70) {
    return `👍 良好！你对《${sopTitle}》有较好的理解，但有 ${wrongCount} 道题目回答不完整。建议重新阅读文档中对应章节，重点关注细节要求。`
  }
  if (percentage >= 60) {
    return `📖 及格。你对《${sopTitle}》的掌握还有提升空间，有 ${wrongCount} 道题目需要重新学习。建议：\n1. 重新通读全文，重点关注操作要点\n2. 对照错题回顾对应章节\n3. 做笔记加深记忆`
  }
  return `📚 需要加强学习。建议你重新仔细阅读《${sopTitle}》，采取以下方法：\n1. 分段阅读，每读完一部分做简要笔记\n2. 重点关注数字、步骤、注意事项\n3. 与同事讨论交流难点\n4. 阅读完成后重新生成试卷进行考核`
}
