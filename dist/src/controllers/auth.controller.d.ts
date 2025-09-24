import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ForgotPasswordDto, ResetPasswordDto } from '../dto/forgot-password.dto';
import { Response } from 'express';
export declare class AuthController {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, req: any, ip: string): Promise<{
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
    getProfile(req: any): Promise<{
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
    refreshToken(body: {
        refreshToken: string;
    }): Promise<{
        vendorId?: string;
        accessToken: string;
        refreshToken: string;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    verifyEmail(body: {
        token: string;
    }): Promise<{
        message: string;
    }>;
    googleAuth(req: any): Promise<void>;
    googleAuthRedirect(req: any, res: Response): Promise<void>;
    googleMobileAuth(body: {
        googleId: string;
        email: string;
        name: string;
        accessToken: string;
    }): Promise<{
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
}
