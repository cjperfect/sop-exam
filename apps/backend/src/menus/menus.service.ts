import { Injectable } from '@nestjs/common'

interface MenuItem {
  title: string
  url: string
  icon: string
}

export interface NavGroup {
  title: string
  items: MenuItem[]
}

@Injectable()
export class MenusService {
  private readonly allMenus: (NavGroup & { roles?: string[] })[] = [
    {
      title: '主要导航',
      items: [
        { title: '首页仪表盘', url: '/', icon: 'LayoutDashboard' },
        { title: 'SOP 文档库', url: '/sops', icon: 'FileText' },
        { title: '我的考试', url: '/exams', icon: 'ClipboardCheck' },
      ],
    },
    {
      title: '管理',
      roles: ['super_admin', 'admin'],
      items: [
        { title: 'SOP 管理', url: '/admin/sops', icon: 'FileCog' },
        { title: '部门管理', url: '/admin/departments', icon: 'FolderTree' },
        { title: '笔记管理', url: '/admin/notes', icon: 'BookOpenCheck' },
        { title: '考试记录', url: '/admin/exams', icon: 'ListChecks' },
        { title: '用户管理', url: '/users', icon: 'Users' },
      ],
    },
  ]

  getMenusByRole(userRole: string[]): { navGroups: NavGroup[] } {
    const navGroups = this.allMenus
      .filter((group) => {
        // 如果没有 roles 限制，所有人可见
        if (!group.roles || group.roles.length === 0) return true
        // 检查用户角色是否有权限
        return userRole.some((role) => group.roles!.includes(role))
      })
      .map(({ roles, ...rest }) => rest) // 去掉 roles 字段，不返回给前端

    return { navGroups }
  }
}
