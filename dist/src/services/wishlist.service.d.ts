import { PrismaService } from '../prisma/prisma.service';
export declare class WishlistService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getUserWishlist(userId: string): Promise<({
        product: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            price: number;
            originalPrice: number | null;
            brand: string;
            images: import("@prisma/client/runtime/library").JsonValue | null;
            specifications: import("@prisma/client/runtime/library").JsonValue | null;
            availability: import(".prisma/client").$Enums.ProductAvailability;
            stockQuantity: number;
            isActive: boolean;
            isFeatured: boolean;
            sku: string | null;
            weight: number | null;
            dimensions: string | null;
            vendorId: string;
            categoryId: string;
            rating: number;
            reviewCount: number;
            soldCount: number;
        };
    } & {
        id: string;
        createdAt: Date;
        productId: string;
        userId: string;
    })[]>;
    addToWishlist(userId: string, productId: string): Promise<{
        product: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            price: number;
            originalPrice: number | null;
            brand: string;
            images: import("@prisma/client/runtime/library").JsonValue | null;
            specifications: import("@prisma/client/runtime/library").JsonValue | null;
            availability: import(".prisma/client").$Enums.ProductAvailability;
            stockQuantity: number;
            isActive: boolean;
            isFeatured: boolean;
            sku: string | null;
            weight: number | null;
            dimensions: string | null;
            vendorId: string;
            categoryId: string;
            rating: number;
            reviewCount: number;
            soldCount: number;
        };
    } & {
        id: string;
        createdAt: Date;
        productId: string;
        userId: string;
    }>;
    removeFromWishlist(userId: string, productId: string): Promise<{
        success: boolean;
    }>;
}
