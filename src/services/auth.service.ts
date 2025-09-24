import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { EmailService } from './email.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ForgotPasswordDto, ResetPasswordDto } from '../dto/forgot-password.dto';
import { UserRole, UserStatus } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const loginAttemptId = `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.logger.log(`[${loginAttemptId}] AuthService.login() - Starting login process for email: ${email}`);
    
    try {
      // Find user by email
      this.logger.debug(`[${loginAttemptId}] Searching for user with email: ${email}`);
      const user = await this.usersService.findByEmail(email);
      
      if (!user) {
        this.logger.warn(`[${loginAttemptId}] User not found for email: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.debug(`[${loginAttemptId}] User found - ID: ${user.id}, Status: ${user.status}, Role: ${user.role}`);

      // Verify password
      this.logger.debug(`[${loginAttemptId}] Verifying password for user: ${user.id}`);
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        this.logger.warn(`[${loginAttemptId}] Invalid password for user: ${user.id}, email: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.debug(`[${loginAttemptId}] Password verification successful for user: ${user.id}`);

      // Generate tokens
      this.logger.debug(`[${loginAttemptId}] Generating tokens for user: ${user.id}`);
      const tokens = await this.generateTokens(user);

      this.logger.log(`[${loginAttemptId}] Login successful for user: ${user.id}, email: ${email}, role: ${user.role}`);

      const response = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          address: user.address,
          city: user.city,
          state: user.state,
          zipCode: user.zipCode,
          country: user.country,
        },
        ...tokens,
      };

      this.logger.debug(`[${loginAttemptId}] Login response prepared:`, {
        userId: response.user.id,
        email: response.user.email,
        role: response.user.role,
        status: response.user.status,
        hasAccessToken: !!response.accessToken,
        hasRefreshToken: !!response.refreshToken,
        tokenLength: response.accessToken ? response.accessToken.length : 0
      });

      return response;

    } catch (error) {
      this.logger.error(`[${loginAttemptId}] Login failed for email: ${email}, Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async register(registerDto: RegisterDto) {
    const { email, password, name, phone, address, city, state, zipCode, country } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create user (password will be hashed in UsersService.create)
    const user = await this.usersService.create({
      name,
      email,
      password,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    });

    // Send email verification
    try {
      const verifyToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await this.prisma.emailVerificationToken.create({
        data: { token: verifyToken, expiresAt, userId: user.id },
      });
      await this.emailService.sendEmailVerification(user.email, verifyToken);
    } catch (e) {
      // Non-fatal
      console.warn('Email verification send failed:', e);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        country: user.country,
      },
      ...tokens,
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      address: user.address,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
      country: user.country,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findOne(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.generateTokens(user);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    // In a real application, you might want to blacklist the token
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    
    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'If an account with that email exists, we\'ve sent a password reset link.' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save reset token
    await this.prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        expiresAt,
        userId: user.id,
      },
    });

    // Send reset email
    try {
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      console.error('Failed to send reset email:', error);
      // Don't throw error to avoid revealing if email exists
    }

    return { message: 'If an account with that email exists, we\'ve sent a password reset link.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    // Find and validate reset token
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.used) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and mark token as used
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string) {
    const v = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!v || v.used || v.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: v.userId }, data: { status: UserStatus.ACTIVE } }),
      this.prisma.emailVerificationToken.update({ where: { id: v.id }, data: { used: true } }),
    ]);
    return { message: 'Email verified successfully' };
  }

  async googleAuth(googleId: string, email: string, name: string) {
    // Try to find existing user by Google ID
    let user = await this.prisma.user.findUnique({
      where: { googleId },
    });

    if (!user) {
      // Try to find existing user by email
      user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Link Google account to existing user
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
      } else {
        // Create new user with Google authentication
        user = await this.prisma.user.create({
          data: {
            name,
            email,
            googleId,
            phone: '', // Will need to be filled later
            address: '', // Will need to be filled later
            city: '',
            state: '',
            zipCode: '',
            country: '',
            role: UserRole.CUSTOMER,
            status: UserStatus.ACTIVE,
          },
        });
      }
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        country: user.country,
      },
      ...tokens,
    };
  }

  private async generateTokens(user: any) {
    const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    this.logger.debug(`[${tokenId}] Generating tokens for user: ${user.id}, email: ${user.email}, role: ${user.role}`);
    
    // If the user is a vendor, try to resolve associated vendorId (by matching email)
    let vendorId: string | undefined = undefined;
    try {
      if (user.role === 'VENDOR') {
        const vendor = await this.prisma.vendor.findUnique({ where: { email: user.email } });
        if (vendor) {
          vendorId = vendor.id;
        }
      }
    } catch (e) {
      this.logger.warn(`[${tokenId}] Failed to resolve vendorId for user ${user.id}: ${e instanceof Error ? e.message : String(e)}`);
    }

    const payload: Record<string, any> = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    if (vendorId) payload.vendorId = vendorId;

    this.logger.debug(`[${tokenId}] JWT payload:`, payload);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    ]);

    this.logger.debug(`[${tokenId}] Tokens generated - AccessToken length: ${accessToken.length}, RefreshToken length: ${refreshToken.length}`);
    this.logger.debug(`[${tokenId}] AccessToken preview: ${accessToken.substring(0, 50)}...`);

    return {
      accessToken,
      refreshToken,
      ...(vendorId ? { vendorId } : {}),
    };
  }
}
