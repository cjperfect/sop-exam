import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  StickyNote,
  Users,
  ListChecks,
  FolderTree,
  FileCog,
  BookOpenCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: '张三',
    email: 'zhangsan@company.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'SOP 学习平台',
      logo: Command,
      plan: '企业标准作业程序',
    },
    {
      name: '技术部',
      logo: AudioWaveform,
      plan: '部门',
    },
    {
      name: '质量部',
      logo: GalleryVerticalEnd,
      plan: '部门',
    },
  ],
  navGroups: [
    {
      title: '主要导航',
      items: [
        {
          title: '首页仪表盘',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'SOP 文档库',
          url: '/sops',
          icon: FileText,
        },
        {
          title: '我的考试',
          url: '/exams',
          icon: ClipboardCheck,
        },
        {
          title: '我的笔记',
          url: '/notes',
          icon: StickyNote,
        },
      ],
    },
    {
      title: '管理',
      items: [
        {
          title: 'SOP 管理',
          url: '/admin/sops',
          icon: FileCog,
        },
        {
          title: '部门管理',
          url: '/admin/departments',
          icon: FolderTree,
        },
        {
          title: '笔记管理',
          url: '/admin/notes',
          icon: BookOpenCheck,
        },
        {
          title: '考试记录',
          url: '/admin/exams',
          icon: ListChecks,
        },
        {
          title: '用户管理',
          url: '/users',
          icon: Users,
        },
      ],
    },
  ],
}
