import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
export declare class CartService {
    private prisma;
    constructor(prisma: PrismaService);
    getCart(userId: string): Promise<{
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
    addToCart(userId: string, addToCartDto: AddToCartDto): Promise<{
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
    updateCartItem(userId: string, itemId: string, updateCartItemDto: UpdateCartItemDto): Promise<{
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
    removeFromCart(userId: string, itemId: string): Promise<{
        message: string;
    }>;
    moveToSaved(userId: string, itemId: string): Promise<{
        message: string;
    }>;
    moveToCart(userId: string, productId: string): Promise<{
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
    removeSaved(userId: string, productId: string): Promise<{
        message: string;
    }>;
    clearCart(userId: string): Promise<{
        message: string;
    }>;
    getCartSummary(userId: string): Promise<{
        itemCount: number;
        subtotal: number;
        items: number;
    }>;
}
