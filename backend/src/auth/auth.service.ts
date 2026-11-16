
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

import { PrismaService } from '../database/prisma.service';
import { HashUtil } from '../common/utils/hash.util';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import { EmailService } from './email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        role: true,
        organization: true,
      },
    });

    if (user && (await HashUtil.compare(pass, user.passwordHash))) {
      const { passwordHash, refreshToken, ...result } = user;
      return result;
    }

    return null;
  }

  // REGISTER
  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    // Validate organization
    let organizationId: string | undefined = undefined;

    if (
      registerDto.organizationId &&
      registerDto.organizationId.trim() !== ''
    ) {
      const trimmedOrgId = registerDto.organizationId.trim();

      const org = await this.prisma.organization.findUnique({
        where: { id: trimmedOrgId },
      });

      if (!org) {
        throw new BadRequestException(
          `Organization with ID '${registerDto.organizationId}' does not exist. Omit organizationId if registering without an organization.`,
        );
      }

      organizationId = org.id;
    }

    // Validate role
    let roleId: string | undefined = undefined;

    if (registerDto.roleId && registerDto.roleId.trim() !== '') {
      const trimmedRoleId = registerDto.roleId.trim();

      const role = await this.prisma.role.findUnique({
        where: { id: trimmedRoleId },
      });

      if (!role) {
        throw new BadRequestException(
          `Role with ID '${registerDto.roleId}' does not exist. Omit roleId to default to SALES_REP.`,
        );
      }

      roleId = role.id;
    } else {
      const defaultRole = await this.prisma.role.findFirst({
        where: { name: 'SALES_REP' },
      });

      if (defaultRole) {
        roleId = defaultRole.id;
      }
    }

    // Hash password
    const passwordHash = await HashUtil.hash(registerDto.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        name: registerDto.name,
        passwordHash,
        phone: registerDto.phone,
        organizationId,
        roleId,
        status: 'ACTIVE',
        profileSettings: {
          create: {
            theme: 'dark',
            emailNotifications: true,
            pushNotifications: true,
          },
        },
      },
      include: {
        role: true,
        organization: true,
      },
    });

    // Generate JWT tokens
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role?.name,
    );

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    // Remove sensitive fields
    const { passwordHash: _, refreshToken: __, ...userResponse } = user;

    return {
      user: userResponse,
      ...tokens,
    };
  }

  // LOGIN
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        `Account is ${user.status.toLowerCase()}`,
      );
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role?.name,
    );

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  }

  // LOGOUT
  async logout(userId: string) {
    if (userId) {
      await this.prisma.user.updateMany({
        where: { id: userId },
        data: { refreshToken: null },
      });
    }

    return { message: 'Successfully logged out' };
  }

  // REFRESH TOKENS
  async refreshTokens(
    userId: string | undefined,
    refreshToken: string,
  ) {
    let targetUserId = userId;

    if (!targetUserId) {
      try {
        const payload = await this.jwtService.verifyAsync(refreshToken, {
          secret:
            this.configService.get<string>('jwt.refreshSecret') ||
            'crm-refresh-token-secret-key-2026',
        });

        targetUserId = payload.sub;
      } catch {
        throw new UnauthorizedException(
          'Invalid or expired refresh token',
        );
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: { role: true },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const isMatch = await HashUtil.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role?.name,
    );

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // FORGOT PASSWORD
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: forgotPasswordDto.email.toLowerCase(),
      },
    });

    const response = {
      message:
        'If that email exists, a password reset link has been sent.',
    };

    if (!user) {
      return response;
    }

    // Validate frontend URL before generating the reset token
    const frontendUrl = this.configService
      .get<string>('FRONTEND_URL')
      ?.replace(/\/+$/, '');

    if (!frontendUrl) {
      throw new BadRequestException(
        'FRONTEND_URL is not configured',
      );
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token before storing it
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Token expires after one hour
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // Construct password reset link
    const resetLink =
      `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

    // Send reset email
    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.name,
      resetLink,
    );

    return response;
  }

  // RESET PASSWORD
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // Hash incoming token
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetPasswordDto.token)
      .digest('hex');

    // Find user with valid token
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Invalid or expired reset token',
      );
    }

    // Hash new password
    const passwordHash = await HashUtil.hash(
      resetPasswordDto.newPassword,
    );

    // Update password and invalidate existing refresh token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        refreshToken: null,
      },
    });

    return {
      message: 'Password has been successfully reset',
    };
  }

  // GET CURRENT USER
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
        profileSettings: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const {
      passwordHash,
      refreshToken,
      ...userWithoutSecrets
    } = user;

    return userWithoutSecrets;
  }

  // CHANGE PASSWORD
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await HashUtil.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isMatch) {
      throw new BadRequestException(
        'Current password does not match',
      );
    }

    const newHash = await HashUtil.hash(
      changePasswordDto.newPassword,
    );

    // Update password and invalidate existing refresh token
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newHash,
        refreshToken: null,
      },
    });

    return {
      message: 'Password changed successfully',
    };
  }

  // GENERATE JWT TOKENS
  private async generateTokens(
    userId: string,
    email: string,
    role?: string,
  ) {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('jwt.secret') ||
          'crm-super-secret-key-change-in-production',
        expiresIn: (this.configService.get<string>(
          'jwt.expiresIn',
        ) || '7d') as any,
      }),

      this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('jwt.refreshSecret') ||
          'crm-refresh-token-secret-key-2026',
        expiresIn: (this.configService.get<string>(
          'jwt.refreshExpiresIn',
        ) || '30d') as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn:
        this.configService.get<string>('jwt.expiresIn') || '7d',
    };
  }

  // UPDATE REFRESH TOKEN
  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ) {
    const hashedRefreshToken = await HashUtil.hash(refreshToken);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: hashedRefreshToken,
      },
    });
  }
}
