import { WishlistService } from '../services/wishlist.service';
export declare class WishlistController {
    private readonly wishlistService;
    constructor(wishlistService: WishlistService);
    getMyWishlist(req: any): Promise<({
        product: {
            id: string;
            name: string;
            description: string;
            isActive: boolean;
            isFeatured: boolean;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
            reviewCount: number;
            price: number;
            originalPrice: number | null;
            brand: string;
            images: import("@prisma/client/runtime/library").JsonValue | null;
            specifications: import("@prisma/client/runtime/library").JsonValue | null;
            availability: import(".prisma/client").$Enums.ProductAvailability;
            stockQuantity: number;
            sku: string | null;
            weight: number | null;
            dimensions: string | null;
            vendorId: string;
            categoryId: string;
            soldCount: number;
        };
    } & {
        id: string;
        createdAt: Date;
        productId: string;
        userId: string;
    })[]>;
    add(req: any, productId: string): Promise<{
        product: {
            id: string;
            name: string;
            description: string;
            isActive: boolean;
            isFeatured: boolean;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
            reviewCount: number;
            price: number;
            originalPrice: number | null;
            brand: string;
            images: import("@prisma/client/runtime/library").JsonValue | null;
            specifications: import("@prisma/client/runtime/library").JsonValue | null;
            availability: import(".prisma/client").$Enums.ProductAvailability;
            stockQuantity: number;
            sku: string | null;
            weight: number | null;
            dimensions: string | null;
            vendorId: string;
            categoryId: string;
            soldCount: number;
        };
    } & {
        id: string;
        createdAt: Date;
        productId: string;
        userId: string;
    }>;
    remove(req: any, productId: string): Promise<{
        success: boolean;
    }>;
}
