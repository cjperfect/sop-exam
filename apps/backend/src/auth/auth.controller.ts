import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Inject,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service.js'
import { LoginDto, RegisterDto } from './auth.dto.js'
import { JwtAuthGuard } from './jwt-auth.guard.js'

@ApiTags('认证')
@Controller('api/auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '退出登录' })
  logout() {
    return { message: '已退出登录' }
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password)
  }

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码' })
  changePassword(
    @Req() req: any,
    @Body() body: { oldPassword: string; newPassword: string }
  ) {
    return this.authService.changePassword(
      req.user.id,
      body.oldPassword,
      body.newPassword
    )
  }

  @Post('reset-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '管理员重置用户密码' })
  async resetPassword(@Req() req: any, @Body() body: { userId: number }) {
    const currentRole = req.user.role?.[0] || req.user.role
    if (currentRole !== 'super_admin' && currentRole !== 'admin') {
      throw new UnauthorizedException('仅管理员可操作')
    }
    // 普通管理员不能重置超级管理员或同级别管理员的密码
    if (currentRole === 'admin') {
      const targetUser = await this.authService.getUserById(body.userId)
      if (
        targetUser &&
        (targetUser.role === 'super_admin' || targetUser.role === 'admin')
      ) {
        throw new UnauthorizedException('无权重置该用户的密码')
      }
    }
    return this.authService.adminResetPassword(body.userId)
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  getProfile(@Req() req: any) {
    return req.user
  }
}
