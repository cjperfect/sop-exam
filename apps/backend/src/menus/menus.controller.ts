import { Controller, Get, UseGuards, Req, Inject } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { MenusService } from './menus.service.js'

@ApiTags('菜单')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/menus')
export class MenusController {
  constructor(@Inject(MenusService) private readonly menusService: MenusService) {}

  @Get()
  @ApiOperation({ summary: '获取当前用户的菜单' })
  getMenus(@Req() req: any) {
    const userRole: string[] = req.user?.role ?? ['user']
    return this.menusService.getMenusByRole(userRole)
  }
}
