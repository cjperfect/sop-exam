export const SOP_DEPARTMENTS = [
  'AI与软件',
  '产品中心',
  'GTM',
  'DQA',
  '结构部',
  'ID',
  '嵌入式',
  '电子部',
] as const

export type SopDepartment = (typeof SOP_DEPARTMENTS)[number]

export const SOP_STATUS_LABELS = {
  draft: '草稿',
  published: '已发布',
} as const

export const EXAM_STATUS_LABELS = {
  draft: '草稿',
  published: '已发布',
  closed: '已结束',
} as const

export const QUESTION_TYPE_LABELS = {
  single_choice: '单选题',
  multi_choice: '多选题',
  true_false: '判断题',
  fill_blank: '填空题',
} as const

export const ROLE_LABELS: Record<string, string> = {
  super_admin: '超级管理员',
  admin: '管理员',
  user: '普通用户',
} as const
