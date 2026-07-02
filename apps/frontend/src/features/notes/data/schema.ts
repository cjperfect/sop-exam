import { z } from 'zod'

const noteSchema = z.object({
  id: z.string(),
  sopId: z.string(),
  sopTitle: z.string(),
  userId: z.string(),
  userName: z.string(),
  content: z.string(),             // Markdown 笔记内容
  pageRef: z.string().optional(),  // 关联的文档段落标题
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Note = z.infer<typeof noteSchema>
