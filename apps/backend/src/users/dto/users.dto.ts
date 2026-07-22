import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty({ description: '姓名' })
  realName!: string

  @ApiProperty({ description: '用户名' })
  username!: string

  @ApiProperty({ description: '邮箱' })
  email!: string

  @ApiPropertyOptional({ description: '手机号' })
  phoneNumber?: string

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive', 'invited', 'suspended'] })
  status?: 'active' | 'inactive' | 'invited' | 'suspended'

  @ApiPropertyOptional({ description: '角色', enum: ['super_admin', 'admin', 'user'] })
  role?: 'super_admin' | 'admin' | 'user'
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '姓名' })
  realName?: string

  @ApiPropertyOptional({ description: '用户名' })
  username?: string

  @ApiPropertyOptional({ description: '邮箱' })
  email?: string

  @ApiPropertyOptional({ description: '手机号' })
  phoneNumber?: string

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive', 'invited', 'suspended'] })
  status?: 'active' | 'inactive' | 'invited' | 'suspended'

  @ApiPropertyOptional({ description: '角色', enum: ['super_admin', 'admin', 'user'] })
  role?: 'super_admin' | 'admin' | 'user'
}
