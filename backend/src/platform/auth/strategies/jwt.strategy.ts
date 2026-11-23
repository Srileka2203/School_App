import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';

interface CachedUserRecord {
  user: any;
  cachedAt: number;
}

const userAuthCache = new Map<string, CachedUserRecord>();
const CACHE_TTL_MS = 15000; // 15 seconds cache to collapse concurrent request bursts

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'crm-super-secret-key-change-in-production',
    });
  }

  async validate(payload: { sub: string; email: string; role?: string }) {
    const cached = userAuthCache.get(payload.sub);
    const now = Date.now();
    if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
      return cached.user;
    }

    let user: any = null;
    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
            organization: true,
          },
        });
        break;
      } catch (err: any) {
        const isConnectionError =
          err?.message?.includes('connection pool') ||
          err?.message?.includes('pool_timeout') ||
          err?.message?.includes('Can\'t reach database');

        if (attempt < maxAttempts && isConnectionError) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          continue;
        }
        throw err;
      }
    }

    if (!user) {
      throw new UnauthorizedException('User not found or token invalid');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(`User account is ${user.status.toLowerCase()}`);
    }

    const { passwordHash, refreshToken, ...userWithoutSecrets } = user;
    userAuthCache.set(payload.sub, { user: userWithoutSecrets, cachedAt: now });
    return userWithoutSecrets;
  }
}
