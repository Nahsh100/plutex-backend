import { PrismaService } from '../prisma/prisma.service';
export declare class SearchService {
    private prisma;
    constructor(prisma: PrismaService);
    searchProducts(query: string, filters?: {
        categoryId?: string;
        minPrice?: number;
        maxPrice?: number;
        brand?: string;
        availability?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }, page?: number, limit?: number): Promise<{
        products: {
            averageRating: number;
            reviewCount: number;
            category: {
                id: string;
                name: string;
                slug: string;
            };
            vendor: {
                id: string;
                name: string;
                rating: number;
            };
            reviews: {
                rating: number;
            }[];
            id: string;
            name: string;
            description: string;
            isActive: boolean;
            isFeatured: boolean;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
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
            fuzzyScore?: number;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
        query: string;
        filters: {
            categoryId?: string;
            minPrice?: number;
            maxPrice?: number;
            brand?: string;
            availability?: string;
            sortBy?: string;
            sortOrder?: "asc" | "desc";
        };
    }>;
    searchCategories(query: string, page?: number, limit?: number): Promise<{
        categories: ({
            _count: {
                products: number;
            };
        } & {
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
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
        query: string;
    }>;
    searchVendors(query: string, page?: number, limit?: number): Promise<{
        vendors: ({
            _count: {
                products: number;
            };
        } & {
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
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
        query: string;
    }>;
    getSearchSuggestions(query: string, limit?: number): Promise<{
        products: {
            id: string;
            name: string;
            type: string;
        }[];
        categories: {
            id: string;
            name: string;
            type: string;
        }[];
        brands: {
            name: string;
            type: string;
        }[];
    }>;
    getPopularSearches(limit?: number): Promise<{
        products: string[];
        categories: string[];
    }>;
    getBrands(): Promise<string[]>;
}
