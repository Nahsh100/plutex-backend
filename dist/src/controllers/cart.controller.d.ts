import { CartService } from '../services/cart.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(req: any): Promise<{
        items: ({
            product: {
                vendor: {
                    name: string;
                    email: string;
                    phone: string;
                    address: string;
                    city: string;
                    state: string;
                    zipCode: string;
                    country: string;
                    status: import(".prisma/client").$Enums.VendorStatus;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    website: string | null;
                    businessType: string | null;
                    taxId: string | null;
                    isVerified: boolean;
                    rating: number;
                    reviewCount: number;
                    logo: string | null;
                    location: string | null;
                };
                category: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    isActive: boolean;
                    isFeatured: boolean;
                    slug: string;
                    image: string | null;
                    metaTitle: string | null;
                    metaDescription: string | null;
                    sortOrder: number;
                };
            } & {
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
            updatedAt: Date;
            quantity: number;
            productId: string;
            userId: string;
        })[];
        savedItems: ({
            product: {
                vendor: {
                    name: string;
                    email: string;
                    phone: string;
                    address: string;
                    city: string;
                    state: string;
                    zipCode: string;
                    country: string;
                    status: import(".prisma/client").$Enums.VendorStatus;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    website: string | null;
                    businessType: string | null;
                    taxId: string | null;
                    isVerified: boolean;
                    rating: number;
                    reviewCount: number;
                    logo: string | null;
                    location: string | null;
                };
                category: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    isActive: boolean;
                    isFeatured: boolean;
                    slug: string;
                    image: string | null;
                    metaTitle: string | null;
                    metaDescription: string | null;
                    sortOrder: number;
                };
            } & {
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
        })[];
    }>;
    getCartSummary(req: any): Promise<{
        itemCount: number;
        subtotal: number;
        items: number;
    }>;
    addToCart(req: any, addToCartDto: AddToCartDto): Promise<{
        product: {
            vendor: {
                name: string;
                email: string;
                phone: string;
                address: string;
                city: string;
                state: string;
                zipCode: string;
                country: string;
                status: import(".prisma/client").$Enums.VendorStatus;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                website: string | null;
                businessType: string | null;
                taxId: string | null;
                isVerified: boolean;
                rating: number;
                reviewCount: number;
                logo: string | null;
                location: string | null;
            };
            category: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                isActive: boolean;
                isFeatured: boolean;
                slug: string;
                image: string | null;
                metaTitle: string | null;
                metaDescription: string | null;
                sortOrder: number;
            };
        } & {
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
        updatedAt: Date;
        quantity: number;
        productId: string;
        userId: string;
    }>;
    updateCartItem(req: any, itemId: string, updateCartItemDto: UpdateCartItemDto): Promise<{
        product: {
            vendor: {
                name: string;
                email: string;
                phone: string;
                address: string;
                city: string;
                state: string;
                zipCode: string;
                country: string;
                status: import(".prisma/client").$Enums.VendorStatus;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                website: string | null;
                businessType: string | null;
                taxId: string | null;
                isVerified: boolean;
                rating: number;
                reviewCount: number;
                logo: string | null;
                location: string | null;
            };
            category: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                isActive: boolean;
                isFeatured: boolean;
                slug: string;
                image: string | null;
                metaTitle: string | null;
                metaDescription: string | null;
                sortOrder: number;
            };
        } & {
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
        updatedAt: Date;
        quantity: number;
        productId: string;
        userId: string;
    }>;
    removeFromCart(req: any, itemId: string): Promise<{
        message: string;
    }>;
    moveToSaved(req: any, itemId: string): Promise<{
        message: string;
    }>;
    moveToCart(req: any, productId: string): Promise<{
        product: {
            vendor: {
                name: string;
                email: string;
                phone: string;
                address: string;
                city: string;
                state: string;
                zipCode: string;
                country: string;
                status: import(".prisma/client").$Enums.VendorStatus;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                website: string | null;
                businessType: string | null;
                taxId: string | null;
                isVerified: boolean;
                rating: number;
                reviewCount: number;
                logo: string | null;
                location: string | null;
            };
            category: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                isActive: boolean;
                isFeatured: boolean;
                slug: string;
                image: string | null;
                metaTitle: string | null;
                metaDescription: string | null;
                sortOrder: number;
            };
        } & {
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
        updatedAt: Date;
        quantity: number;
        productId: string;
        userId: string;
    }>;
    removeSaved(req: any, productId: string): Promise<{
        message: string;
    }>;
    clearCart(req: any): Promise<{
        message: string;
    }>;
}
