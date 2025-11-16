import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
export declare class CartService {
    private prisma;
    constructor(prisma: PrismaService);
    getCart(userId: string): Promise<{
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
    addToCart(userId: string, addToCartDto: AddToCartDto): Promise<{
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
    updateCartItem(userId: string, itemId: string, updateCartItemDto: UpdateCartItemDto): Promise<{
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
    removeFromCart(userId: string, itemId: string): Promise<{
        message: string;
    }>;
    moveToSaved(userId: string, itemId: string): Promise<{
        message: string;
    }>;
    moveToCart(userId: string, productId: string): Promise<{
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
