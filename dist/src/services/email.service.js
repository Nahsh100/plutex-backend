"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const resend_1 = require("resend");
let EmailService = class EmailService {
    constructor() {
        this.resend = new resend_1.Resend(process.env.RESEND_API_KEY);
    }
    async sendPasswordResetEmail(to, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL}reset-password?token=${resetToken}`;
        try {
            await this.resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'noreply@plutex.com',
                to: [to],
                subject: 'Reset Your Password - Plutex',
                html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; }
              .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 40px 20px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
              .content { padding: 40px 20px; }
              .content h2 { color: #1f2937; margin: 0 0 20px 0; font-size: 24px; }
              .content p { color: #6b7280; line-height: 1.6; margin: 0 0 20px 0; }
              .button { display: inline-block; background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; margin: 20px 0; }
              .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
              .security-note { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px; }
              .security-note p { color: #92400e; margin: 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Plutex</h1>
              </div>
              <div class="content">
                <h2>Reset Your Password</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password for your Plutex account. If you didn't make this request, you can safely ignore this email.</p>
                <p>To reset your password, click the button below:</p>
                <a href="${resetUrl}" class="button">Reset Password</a>
                <div class="security-note">
                  <p><strong>Security Note:</strong> This link will expire in 1 hour for your security. If you didn't request this password reset, please contact our support team.</p>
                </div>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
                <p>Best regards,<br>The Plutex Team</p>
              </div>
              <div class="footer">
                <p>© 2024 Plutex. All rights reserved.</p>
                <p>This email was sent because you requested a password reset. If you didn't request this, please contact support.</p>
              </div>
            </div>
          </body>
          </html>
        `
            });
        }
        catch (error) {
            console.error('Failed to send password reset email:', error);
            throw new Error('Failed to send password reset email');
        }
    }
    async sendEmailVerification(to, verifyToken) {
        const verifyUrl = `${process.env.FRONTEND_URL}verify-email?token=${verifyToken}`;
        await this.resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'noreply@plutex.com',
            to: [to],
            subject: 'Verify Your Email - Plutex',
            html: `
        <html><body>
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <h2>Verify Your Email</h2>
            <p>Welcome to Plutex! Please verify your email by clicking the link below:</p>
            <p><a href="${verifyUrl}">Verify Email</a></p>
            <p>If the link doesn't work, copy and paste this URL:</p>
            <p style="word-break: break-all; color: #2563eb;">${verifyUrl}</p>
          </div>
        </body></html>
      `,
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map