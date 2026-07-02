import { useMemo } from 'react'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from './nav-group'
import { AppTitle } from './app-title'
import { useAuthStore } from '@/stores/auth-store'
import { transformMenus } from '@/lib/menus-api'
import type { NavGroup as NavGroupType } from './types'
import { Loader2 } from 'lucide-react'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const rawMenuData = useAuthStore((state) => state.rawMenuData)

  const navGroups = useMemo(
    () => (rawMenuData ? transformMenus(rawMenuData) : []),
    [rawMenuData],
  )

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {navGroups.length === 0 ? (
          <div className='flex items-center justify-center py-8 text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin' />
          </div>
        ) : (
          navGroups.map((props) => (
            <NavGroup key={props.title} {...(props as NavGroupType)} />
          ))
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
