import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({ description: '账号', example: 'admin' })
  username!: string

  @ApiProperty({ description: '密码', example: 'admin' })
  password!: string
}

export class RegisterDto {
  @ApiProperty({ description: '用户名' })
  username!: string

  @ApiProperty({ description: '密码' })
  password!: string
}
