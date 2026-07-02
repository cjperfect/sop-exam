import { Injectable, Inject, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { AuthService } from './auth.service.js'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {
    super({
      // 优先从 Authorization header 取，其次从 cookie
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        JwtStrategy.fromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'sop-jwt-secret-key',
    })
  }

  private static fromCookie(req: Request): string | null {
    if (req.cookies?.accessToken) {
      return req.cookies.accessToken
    }
    return null
  }

  async validate(payload: { sub: number; username: string; role: string }) {
    const user = this.authService.validateUser(payload.sub)
    if (!user) {
      throw new UnauthorizedException('token 无效或已过期')
    }
    return user
  }
}
