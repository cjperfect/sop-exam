import type { GeneratedExam, Question } from '@sop/shared'

/**
 * Mock 试卷生成（DeepSeek 不可用时的兜底方案）
 * 从 SOP 内容中提取知识点，生成模拟考题
 */
export function mockGenerateExam(
  sopContent: string,
  sopTitle: string,
  questionCount: number,
): GeneratedExam {
  const lines = sopContent
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const knowledgePoints = lines.filter(
    (l) => /^[0-9]/.test(l) || /^[•\-*]/.test(l) || /[：:]/.test(l),
  )

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

  const optionsLetters = ['A', 'B', 'C', 'D']

  const questions: Question[] = []

  for (let i = 0; i < questionCount; i++) {
    const type = types[i % types.length]
    const point = knowledgePoints[i % knowledgePoints.length] || `操作规范第 ${i + 1} 条`
    const correctLetter = optionsLetters[i % 4]

    if (type === 'single_choice') {
      questions.push({
        type: 'single_choice',
        content: `关于"${sopTitle}"，以下哪项描述是正确的？`,
        options: [
          { key: 'A', value: `根据规范：${point}` },
          { key: 'B', value: '与规范相反的操作描述' },
          { key: 'C', value: '与本题无关的其他描述' },
          { key: 'D', value: '以上都不对' },
        ],
        answer: correctLetter,
        explanation: `正确答案是 ${correctLetter}。根据 SOP 规范：${point}`,
        score: 10,
        sortOrder: i + 1,
        sopSource: point,
      })
    } else if (type === 'true_false') {
      const isTrue = i % 2 === 0
      questions.push({
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
    description: `基于《${sopTitle}》自动生成的 ${questionCount} 道考题，用于检验学习效果。`,
    questions,
    timeLimit: Math.ceil(questionCount * 1.5),
    passingScore: 60,
  }
}
