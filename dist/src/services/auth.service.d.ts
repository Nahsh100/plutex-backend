import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { EmailService } from './email.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ForgotPasswordDto, ResetPasswordDto } from '../dto/forgot-password.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly emailService;
    private readonly prisma;
    private readonly logger;
    constructor(usersService: UsersService, jwtService: JwtService, emailService: EmailService, prisma: PrismaService);
    login(loginDto: LoginDto): Promise<{
        vendorId?: string;
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.UserStatus;
            address: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        vendorId?: string;
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.UserStatus;
            address: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        };
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        vendorId?: string;
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    googleAuth(googleId: string, email: string, name: string): Promise<{
        vendorId?: string;
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.UserStatus;
            address: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        };
    }>;
    private generateTokens;
}
