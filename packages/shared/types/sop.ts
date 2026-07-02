export type SopStatus = 'draft' | 'published'

export interface SopDocument {
  id: number
  title: string
  content: string
  department: string
  uploadedBy: string
  uploadedByName: string
  fileType: 'markdown' | 'pdf'
  status: SopStatus
  viewCount: number
  createdAt: string
  updatedAt: string
}
