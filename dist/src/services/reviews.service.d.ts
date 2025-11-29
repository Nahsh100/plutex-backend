import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
export declare class ReviewsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createReviewDto: CreateReviewDto, userId: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
        product: {
            id: string;
            name: string;
            images: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ReviewStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        comment: string;
        rating: number;
        productId: string;
    }>;
    findAll(productId?: string, status?: string, page?: number, limit?: number): Promise<{
        reviews: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
            product: {
                id: string;
                name: string;
                images: import("@prisma/client/runtime/library").JsonValue;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.ReviewStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            comment: string;
            rating: number;
            productId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
        product: {
            id: string;
            name: string;
            images: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ReviewStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        comment: string;
        rating: number;
        productId: string;
    }>;
    update(id: string, updateReviewDto: UpdateReviewDto, userId: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
        product: {
            id: string;
            name: string;
            images: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ReviewStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        comment: string;
        rating: number;
        productId: string;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
    updateStatus(id: string, status: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
        product: {
            id: string;
            name: string;
            images: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ReviewStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        comment: string;
        rating: number;
        productId: string;
    }>;
    getProductReviews(productId: string, page?: number, limit?: number): Promise<{
        reviews: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
            product: {
                id: string;
                name: string;
                images: import("@prisma/client/runtime/library").JsonValue;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.ReviewStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            comment: string;
            rating: number;
            productId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getUserReviews(userId: string, page?: number, limit?: number): Promise<{
        reviews: ({
            product: {
                id: string;
                name: string;
                images: import("@prisma/client/runtime/library").JsonValue;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.ReviewStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            comment: string;
            rating: number;
            productId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    private updateProductRating;
}
