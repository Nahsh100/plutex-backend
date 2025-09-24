import { Controller, Post, Body, Get, UseGuards, Request, Res, Req, Logger, Ip } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ForgotPasswordDto, ResetPasswordDto } from '../dto/forgot-password.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: any, @Ip() ip: string) {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log incoming request
    this.logger.log(`[${requestId}] LOGIN REQUEST - Email: ${loginDto.email}, IP: ${ip}, User-Agent: ${req.get('User-Agent')}`);
    this.logger.debug(`[${requestId}] Full login request:`, {
      email: loginDto.email,
      password: '[REDACTED]',
      ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    try {
      const result = await this.authService.login(loginDto);
      const duration = Date.now() - startTime;
      
      // Log successful response
      this.logger.log(`[${requestId}] LOGIN SUCCESS - User ID: ${result.user.id}, Email: ${result.user.email}, Duration: ${duration}ms`);
      this.logger.debug(`[${requestId}] Login response:`, {
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        status: result.user.status,
        accessToken: result.accessToken ? '[TOKEN_PROVIDED]' : '[NO_TOKEN]',
        refreshToken: result.refreshToken ? '[REFRESH_TOKEN_PROVIDED]' : '[NO_REFRESH_TOKEN]',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log failed response
      this.logger.error(`[${requestId}] LOGIN FAILED - Email: ${loginDto.email}, Error: ${error.message}, Duration: ${duration}ms`);
      this.logger.debug(`[${requestId}] Login error details:`, {
        email: loginDto.email,
        error: error.message,
        stack: error.stack,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const result = req.user;
    
    // Redirect to frontend with tokens as query parameters
    const redirectUrl = `${process.env.FRONTEND_URL}login-success?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}&user=${encodeURIComponent(JSON.stringify(result.user))}`;
    
    return res.redirect(redirectUrl);
  }

  @Post('google-mobile')
  async googleMobileAuth(@Body() body: { googleId: string; email: string; name: string; accessToken: string }) {
    const { googleId, email, name } = body;
    
    try {
      const result = await this.authService.googleAuth(googleId, email, name);
      return result;
    } catch (error) {
      throw new Error('Google authentication failed');
    }
  }
}
