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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("./users.service");
const email_service_1 = require("./email.service");
const prisma_service_1 = require("../prisma/prisma.service");
const create_user_dto_1 = require("../dto/create-user.dto");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
let AuthService = AuthService_1 = class AuthService {
    constructor(usersService, jwtService, emailService, prisma) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const loginAttemptId = `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.logger.log(`[${loginAttemptId}] AuthService.login() - Starting login process for email: ${email}`);
        try {
            this.logger.debug(`[${loginAttemptId}] Searching for user with email: ${email}`);
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                this.logger.warn(`[${loginAttemptId}] User not found for email: ${email}`);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            this.logger.debug(`[${loginAttemptId}] User found - ID: ${user.id}, Status: ${user.status}, Role: ${user.role}`);
            this.logger.debug(`[${loginAttemptId}] Verifying password for user: ${user.id}`);
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                this.logger.warn(`[${loginAttemptId}] Invalid password for user: ${user.id}, email: ${email}`);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            this.logger.debug(`[${loginAttemptId}] Password verification successful for user: ${user.id}`);
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
        }
        catch (error) {
            this.logger.error(`[${loginAttemptId}] Login failed for email: ${email}, Error: ${error.message}`, error.stack);
            throw error;
        }
    }
    async register(registerDto) {
        const { email, password, name, phone, address, city, state, zipCode, country } = registerDto;
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
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
            role: create_user_dto_1.UserRole.CUSTOMER,
            status: create_user_dto_1.UserStatus.ACTIVE,
        });
        try {
            const verifyToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await this.prisma.emailVerificationToken.create({
                data: { token: verifyToken, expiresAt, userId: user.id },
            });
            await this.emailService.sendEmailVerification(user.email, verifyToken);
        }
        catch (e) {
            console.warn('Email verification send failed:', e);
        }
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
    async getProfile(userId) {
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
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
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.usersService.findOne(payload.sub);
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            const tokens = await this.generateTokens(user);
            return tokens;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId) {
        return { message: 'Logged out successfully' };
    }
    async forgotPassword(forgotPasswordDto) {
        const { email } = forgotPasswordDto;
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return { message: 'If an account with that email exists, we\'ve sent a password reset link.' };
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await this.prisma.passwordResetToken.create({
            data: {
                token: resetToken,
                expiresAt,
                userId: user.id,
            },
        });
        try {
            await this.emailService.sendPasswordResetEmail(user.email, resetToken);
        }
        catch (error) {
            console.error('Failed to send reset email:', error);
        }
        return { message: 'If an account with that email exists, we\'ve sent a password reset link.' };
    }
    async resetPassword(resetPasswordDto) {
        const { token, newPassword } = resetPasswordDto;
        const resetToken = await this.prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!resetToken || resetToken.used) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        if (resetToken.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Reset token has expired');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
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
    async verifyEmail(token) {
        const v = await this.prisma.emailVerificationToken.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!v || v.used || v.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired verification token');
        }
        await this.prisma.$transaction([
            this.prisma.user.update({ where: { id: v.userId }, data: { status: create_user_dto_1.UserStatus.ACTIVE } }),
            this.prisma.emailVerificationToken.update({ where: { id: v.id }, data: { used: true } }),
        ]);
        return { message: 'Email verified successfully' };
    }
    async googleAuth(googleId, email, name) {
        let user = await this.prisma.user.findUnique({
            where: { googleId },
        });
        if (!user) {
            user = await this.prisma.user.findUnique({
                where: { email },
            });
            if (user) {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: { googleId },
                });
            }
            else {
                user = await this.prisma.user.create({
                    data: {
                        name,
                        email,
                        googleId,
                        phone: '',
                        address: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        country: '',
                        role: create_user_dto_1.UserRole.CUSTOMER,
                        status: create_user_dto_1.UserStatus.ACTIVE,
                    },
                });
            }
        }
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
    async generateTokens(user) {
        const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        this.logger.debug(`[${tokenId}] Generating tokens for user: ${user.id}, email: ${user.email}, role: ${user.role}`);
        let vendorId = undefined;
        try {
            if (user.role === 'VENDOR') {
                const vendor = await this.prisma.vendor.findUnique({ where: { email: user.email } });
                if (vendor) {
                    vendorId = vendor.id;
                }
            }
        }
        catch (e) {
            this.logger.warn(`[${tokenId}] Failed to resolve vendorId for user ${user.id}: ${e instanceof Error ? e.message : String(e)}`);
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        if (vendorId)
            payload.vendorId = vendorId;
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        email_service_1.EmailService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map