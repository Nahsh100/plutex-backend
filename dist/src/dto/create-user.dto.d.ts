export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED"
}
export declare enum UserRole {
    CUSTOMER = "CUSTOMER",
    ADMIN = "ADMIN",
    VENDOR = "VENDOR"
}
export declare class CreateUserDto {
    id?: string;
    name: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    gender?: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    status?: UserStatus;
    role?: UserRole;
    marketingConsent?: boolean;
    password?: string;
}
