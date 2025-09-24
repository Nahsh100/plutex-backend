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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../services/auth.service");
const login_dto_1 = require("../dto/login.dto");
const register_dto_1 = require("../dto/register.dto");
const forgot_password_dto_1 = require("../dto/forgot-password.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const google_auth_guard_1 = require("../guards/google-auth.guard");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async login(loginDto, req, ip) {
        const startTime = Date.now();
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
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
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async getProfile(req) {
        return this.authService.getProfile(req.user.id);
    }
    async refreshToken(body) {
        return this.authService.refreshToken(body.refreshToken);
    }
    async logout(req) {
        return this.authService.logout(req.user.id);
    }
    async forgotPassword(forgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }
    async resetPassword(resetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
    async verifyEmail(body) {
        return this.authService.verifyEmail(body.token);
    }
    async googleAuth(req) {
    }
    async googleAuthRedirect(req, res) {
        const result = req.user;
        const redirectUrl = `${process.env.FRONTEND_URL}login-success?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}&user=${encodeURIComponent(JSON.stringify(result.user))}`;
        return res.redirect(redirectUrl);
    }
    async googleMobileAuth(body) {
        const { googleId, email, name } = body;
        try {
            const result = await this.authService.googleAuth(googleId, email, name);
            return result;
        }
        catch (error) {
            throw new Error('Google authentication failed');
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('verify-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuthRedirect", null);
__decorate([
    (0, common_1.Post)('google-mobile'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleMobileAuth", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map