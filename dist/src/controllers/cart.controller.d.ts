import { CartService } from '../services/cart.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(req: any): Promise<{
        items: ({
            product: {
                category: {
                    id: string;
                    name: string;
                    description: string | null;
                    slug: string;
                    image: string | null;
                    metaTitle: string | null;
                    metaDescription: string | null;
                    isActive: boolean;
                    isFeatured: boolean;
                    sortOrder: number;
                    createdAt: Date;
                    updatedAt: Date;
                };
                vendor: {
                    id: string;
                    name: string;
                    description: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    phone: string;
                    website: string | null;
                    address: string;
                    city: string;
                    state: string;
                    zipCode: string;
                    country: string;
                    businessType: string | null;
                    taxId: string | null;
                    isVerified: boolean;
                    status: import(".prisma/client").$Enums.VendorStatus;
                    rating: number;
                    reviewCount: number;
                    logo: string | null;
                    location: string | null;
                };
            } & {
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
            updatedAt: Date;
            userId: string;
            productId: string;
            quantity: number;
        })[];
        savedItems: ({
            product: {
                category: {
                    id: string;
                    name: string;
                    description: string | null;
                    slug: string;
                    image: string | null;
                    metaTitle: string | null;
                    metaDescription: string | null;
                    isActive: boolean;
                    isFeatured: boolean;
                    sortOrder: number;
                    createdAt: Date;
                    updatedAt: Date;
                };
                vendor: {
                    id: string;
                    name: string;
                    description: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    phone: string;
                    website: string | null;
                    address: string;
                    city: string;
                    state: string;
                    zipCode: string;
                    country: string;
                    businessType: string | null;
                    taxId: string | null;
                    isVerified: boolean;
                    status: import(".prisma/client").$Enums.VendorStatus;
                    rating: number;
                    reviewCount: number;
                    logo: string | null;
                    location: string | null;
                };
            } & {
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
            userId: string;
            productId: string;
        })[];
    }>;
    getCartSummary(req: any): Promise<{
        itemCount: number;
        subtotal: number;
        items: number;
    }>;
    addToCart(req: any, addToCartDto: AddToCartDto): Promise<{
        product: {
            category: {
                id: string;
                name: string;
                description: string | null;
                slug: string;
                image: string | null;
                metaTitle: string | null;
                metaDescription: string | null;
                isActive: boolean;
                isFeatured: boolean;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
            };
            vendor: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                phone: string;
                website: string | null;
                address: string;
                city: string;
                state: string;
                zipCode: string;
                country: string;
                businessType: string | null;
                taxId: string | null;
                isVerified: boolean;
                status: import(".prisma/client").$Enums.VendorStatus;
                rating: number;
                reviewCount: number;
                logo: string | null;
                location: string | null;
            };
        } & {
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
        updatedAt: Date;
        userId: string;
        productId: string;
        quantity: number;
    }>;
    updateCartItem(req: any, itemId: string, updateCartItemDto: UpdateCartItemDto): Promise<{
        product: {
            category: {
                id: string;
                name: string;
                description: string | null;
                slug: string;
                image: string | null;
                metaTitle: string | null;
                metaDescription: string | null;
                isActive: boolean;
                isFeatured: boolean;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
            };
            vendor: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                phone: string;
                website: string | null;
                address: string;
                city: string;
                state: string;
                zipCode: string;
                country: string;
                businessType: string | null;
                taxId: string | null;
                isVerified: boolean;
                status: import(".prisma/client").$Enums.VendorStatus;
                rating: number;
                reviewCount: number;
                logo: string | null;
                location: string | null;
            };
        } & {
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
        updatedAt: Date;
        userId: string;
        productId: string;
        quantity: number;
    }>;
    removeFromCart(req: any, itemId: string): Promise<{
        message: string;
    }>;
    moveToSaved(req: any, itemId: string): Promise<{
        message: string;
    }>;
    moveToCart(req: any, productId: string): Promise<{
        product: {
            category: {
                id: string;
                name: string;
                description: string | null;
                slug: string;
                image: string | null;
                metaTitle: string | null;
                metaDescription: string | null;
                isActive: boolean;
                isFeatured: boolean;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
            };
            vendor: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                phone: string;
                website: string | null;
                address: string;
                city: string;
                state: string;
                zipCode: string;
                country: string;
                businessType: string | null;
                taxId: string | null;
                isVerified: boolean;
                status: import(".prisma/client").$Enums.VendorStatus;
                rating: number;
                reviewCount: number;
                logo: string | null;
                location: string | null;
            };
        } & {
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
        updatedAt: Date;
        userId: string;
        productId: string;
        quantity: number;
    }>;
    removeSaved(req: any, productId: string): Promise<{
        message: string;
    }>;
    clearCart(req: any): Promise<{
        message: string;
    }>;
}
