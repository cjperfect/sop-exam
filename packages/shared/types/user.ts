export type UserStatus = 'active' | 'inactive' | 'invited' | 'suspended'
export type UserRole = 'super_admin' | 'admin' | 'user'

export interface User {
  id: number
  username: string
  employeeId: string
  department: string
  status: UserStatus
  role: UserRole
  createdAt: string
  updatedAt: string
}
