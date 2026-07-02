import { faker } from '@faker-js/faker'
import { type Submission } from './submission-schema'

faker.seed(22222)

const sopTitles = [
  '设备开机操作流程',
  '产品质量检验标准',
  '化学品安全存放规程',
  '仓库出入库管理流程',
]

export const mockSubmissions: Submission[] = Array.from(
  { length: 15 },
  (_, i) => {
    const sopTitle = sopTitles[i % sopTitles.length]
    const totalScore = faker.number.int({ min: 30, max: 100 })
    const totalMaxScore = 100
    const passingScore = 60
    const isPassed = totalScore >= passingScore

    return {
      id: faker.string.uuid(),
      examId: faker.string.uuid(),
      examTitle: `${sopTitle} — 知识考核`,
      sopId: faker.string.uuid(),
      sopTitle,
      userId: faker.string.uuid(),
      userName: faker.person.fullName(),
      answers: [],
      totalScore,
      totalMaxScore,
      passingScore,
      isPassed,
      startedAt: faker.date.recent({ days: 30 }),
      submittedAt: faker.date.recent({ days: 7 }),
      timeSpent: faker.number.int({ min: 180, max: 900 }),
      attemptNumber: faker.number.int({ min: 1, max: 3 }),
      suggestions: '',
    }
  },
)
