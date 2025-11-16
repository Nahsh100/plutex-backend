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
            vendor: {
                name: string;
                id: string;
                rating: number;
            };
            category: {
                name: string;
                id: string;
                slug: string;
            };
            reviews: {
                rating: number;
            }[];
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
