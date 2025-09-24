export declare class EmailService {
    private resend;
    constructor();
    sendPasswordResetEmail(to: string, resetToken: string): Promise<void>;
    sendEmailVerification(to: string, verifyToken: string): Promise<void>;
}
