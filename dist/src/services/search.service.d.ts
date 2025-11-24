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
                id: string;
                name: string;
                rating: number;
            };
            category: {
                id: string;
                name: string;
                slug: string;
            };
            reviews: {
                rating: number;
            }[];
            id: string;
            name: string;
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
            id: string;
            name: string;
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
            id: string;
            name: string;
            email: string;
            phone: string;
            address: string;
            city: string;
            state: string | null;
            zipCode: string | null;
            country: string;
            status: import(".prisma/client").$Enums.VendorStatus;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            website: string | null;
            businessType: string | null;
            taxId: string | null;
            idType: string | null;
            idNumber: string | null;
            registrationNumber: string | null;
            documentUrl: string | null;
            internalNotes: string | null;
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
