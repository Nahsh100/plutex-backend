export declare enum VendorStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    PENDING = "PENDING",
    SUSPENDED = "SUSPENDED"
}
export declare class CreateVendorDto {
    name: string;
    email: string;
    phone: string;
    website?: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    description?: string;
    businessType?: string;
    taxId?: string;
    isVerified?: boolean;
    status?: VendorStatus;
    rating?: number;
    reviewCount?: number;
    logo?: string;
    location?: string;
}
