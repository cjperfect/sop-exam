import { api } from './api'
import type { NavGroup } from '@/components/layout/types'
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  StickyNote,
  FileCog,
  FolderTree,
  BookOpenCheck,
  ListChecks,
  Users,
  type LucideIcon,
} from 'lucide-react'

/** 后端返回的原始菜单项 */
export interface RawMenuItem {
  title: string
  url: string
  icon: string
}

export interface RawNavGroup {
  title: string
  items: RawMenuItem[]
}

/** 图标名称到 Lucide 组件的映射 */
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  StickyNote,
  FileCog,
  FolderTree,
  BookOpenCheck,
  ListChecks,
  Users,
}

/** 将原始菜单数据（带图标字符串）转换为前端组件所需的格式（带 React 组件） */
export function transformMenus(rawNavGroups: RawNavGroup[]): NavGroup[] {
  return rawNavGroups.map((group) => ({
    title: group.title,
    items: group.items.map((item) => ({
      title: item.title,
      url: item.url,
      icon: iconMap[item.icon] || FileText,
    })),
  }))
}

/** 从后端获取当前用户的菜单并返回原始数据 */
export async function fetchMenus(): Promise<RawNavGroup[]> {
  const { data } = await api.get<{ navGroups: RawNavGroup[] }>('/api/menus')
  return data.navGroups
}
