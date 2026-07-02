import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Inject, Req, ForbiddenException, ConflictException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { UsersService } from './users.service.js'
import { CreateUserDto, UpdateUserDto } from './users.dto.js'

const ROLE_HIERARCHY: Record<string, number> = { super_admin: 3, admin: 2, user: 1 }

function getRoleLevel(role: string | string[]): number {
  const r = Array.isArray(role) ? role[0] : role
  return ROLE_HIERARCHY[r] ?? 0
}

@ApiTags('用户')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/users')
export class UsersController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('username') username?: string,
    @Query('employeeId') employeeId?: string,
    @Query('role') role?: string,
  ) {
    return this.usersService.findAll(Number(page) || 1, Number(pageSize) || 10, username, employeeId, role)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(Number(id))
  }

  @Post()
  @ApiOperation({ summary: '创建用户' })
  async create(@Req() req: any, @Body() dto: CreateUserDto) {
    const currentRole = req.user.role?.[0] || req.user.role
    const currentLevel = getRoleLevel(currentRole)
    if (currentLevel < 2) {
      throw new ForbiddenException('无权创建用户')
    }
    // 管理员只能创建普通用户
    const targetRole = (dto as any).role || 'user'
    if (currentLevel === 2 && targetRole !== 'user') {
      throw new ForbiddenException('无权创建该角色的用户')
    }
    try {
      return await this.usersService.create(dto as unknown as Record<string, unknown>)
    } catch (err: any) {
      if (err?.code === 'P2002') {
        const target = err.meta?.target as string[] | undefined
        if (target?.includes('username')) throw new ConflictException('用户名已存在')
        if (target?.includes('employee_id')) throw new ConflictException('工号已存在')
      }
      throw err
    }
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户' })
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    const currentRole = req.user.role?.[0] || req.user.role
    const currentLevel = getRoleLevel(currentRole)
    const targetUser = await this.usersService.getRawUser(Number(id))
    const targetLevel = getRoleLevel(targetUser?.role ?? 'user')

    if (currentLevel < 2) {
      throw new ForbiddenException('无权修改用户信息')
    }
    // 管理员只能修改比自己级别低的用户
    if (currentLevel <= targetLevel && currentRole !== targetUser?.role) {
      throw new ForbiddenException('无权修改该用户的信息')
    }
    // 同级别不能互相修改
    if (currentRole === targetUser?.role && currentRole !== 'super_admin') {
      throw new ForbiddenException('不能修改同级别用户的信息')
    }

    return this.usersService.update(Number(id), dto as unknown as Record<string, unknown>)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  async remove(@Req() req: any, @Param('id') id: string) {
    const currentRole = req.user.role?.[0] || req.user.role
    const currentLevel = getRoleLevel(currentRole)
    const targetUser = await this.usersService.getRawUser(Number(id))
    const targetLevel = getRoleLevel(targetUser?.role ?? 'user')

    if (currentLevel < 2) {
      throw new ForbiddenException('无权删除用户')
    }
    if (currentLevel <= targetLevel && currentRole !== targetUser?.role) {
      throw new ForbiddenException('无权删除该用户')
    }
    if (currentRole === targetUser?.role && currentRole !== 'super_admin') {
      throw new ForbiddenException('不能删除同级别用户')
    }

    return this.usersService.remove(Number(id))
  }
}
