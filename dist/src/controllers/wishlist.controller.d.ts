import { WishlistService } from '../services/wishlist.service';
export declare class WishlistController {
    private readonly wishlistService;
    constructor(wishlistService: WishlistService);
    getMyWishlist(req: any): Promise<({
        product: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            rating: number;
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
            reviewCount: number;
            soldCount: number;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        productId: string;
    })[]>;
    add(req: any, productId: string): Promise<{
        product: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            rating: number;
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
            reviewCount: number;
            soldCount: number;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        productId: string;
    }>;
    remove(req: any, productId: string): Promise<{
        success: boolean;
    }>;
}
