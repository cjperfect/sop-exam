import { faker } from '@faker-js/faker'
import { type Question } from '../data/question-schema'
import type { GeneratedExam } from '@sop/shared'

interface GenerateExamParams {
  sopContent: string
  sopTitle: string
  sopId: string
  questionCount?: number
}

/**
 * AI 出题服务 — 优先调后端 API，失败则用 mock
 */
export async function generateExam(
  params: GenerateExamParams,
): Promise<GeneratedExam> {
  const { sopContent, sopTitle, questionCount = 10 } = params

  // 尝试真实 API
  try {
    const { generateExamAPI } = await import('../api')
    return await generateExamAPI({
      sopContent: params.sopContent,
      sopTitle: params.sopTitle,
      sopId: Number(params.sopId),
      questionCount: params.questionCount ?? 10,
    })
  } catch {
    return mockGenerate(sopContent, sopTitle, questionCount)
  }
}

// ===== Mock 出题 =====
function mockGenerate(
  sopContent: string,
  sopTitle: string,
  count: number,
): GeneratedExam {
  const lines = sopContent
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const knowledgePoints = lines.filter(
    (l) => /^[0-9]/.test(l) || /^[•\-*]/.test(l) || /[：:]/.test(l),
  )

  const questions: Question[] = []
  const types: Array<'single_choice' | 'true_false' | 'fill_blank'> = [
    'single_choice',
    'true_false',
    'fill_blank',
    'single_choice',
    'single_choice',
    'true_false',
    'fill_blank',
    'single_choice',
    'true_false',
    'single_choice',
  ]

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length]
    const point =
      knowledgePoints[i % knowledgePoints.length] || `操作规范第 ${i + 1} 条`

    if (type === 'single_choice') {
      const correct = String.fromCharCode(65 + faker.number.int(4))
      questions.push({
        id: faker.string.uuid(),
        examId: '',
        type: 'single_choice',
        content: `关于"${sopTitle}"，以下哪项描述是正确的？`,
        options: [
          { key: 'A', value: `根据规范：${point}` },
          { key: 'B', value: '与规范相反的操作描述' },
          { key: 'C', value: '与本题无关的其他描述' },
          { key: 'D', value: '以上都不对' },
        ],
        answer: correct,
        explanation: `正确答案是 ${correct}。根据 SOP 规范：${point}`,
        score: 10,
        sortOrder: i + 1,
        sopSource: point,
      })
    } else if (type === 'true_false') {
      const isTrue = faker.datatype.boolean()
      questions.push({
        id: faker.string.uuid(),
        examId: '',
        type: 'true_false',
        content: `"${point}" 是否正确？`,
        options: [
          { key: 'T', value: '正确' },
          { key: 'F', value: '错误' },
        ],
        answer: isTrue ? 'T' : 'F',
        explanation: isTrue
          ? `正确。根据 SOP 规范：${point}`
          : '错误。正确做法与上述描述不符，请查阅文档对应章节。',
        score: 10,
        sortOrder: i + 1,
        sopSource: point,
      })
    } else {
      questions.push({
        id: faker.string.uuid(),
        examId: '',
        type: 'fill_blank',
        content: `根据 SOP 规范，"${point.replace(/[0-9.、．]/g, '').trim()}" 中的关键要求是______。`,
        options: [],
        answer: '按照标准操作规程执行',
        explanation: `请参考 SOP 文档中关于"${point}"的详细说明。`,
        score: 10,
        sortOrder: i + 1,
        sopSource: point,
      })
    }
  }

  return {
    title: `${sopTitle} — 知识考核`,
    description: `基于《${sopTitle}》自动生成的 ${count} 道考题，用于检验学习效果。`,
    questions: questions as any,
    timeLimit: Math.ceil(count * 1.5),
    passingScore: 60,
  }
}
