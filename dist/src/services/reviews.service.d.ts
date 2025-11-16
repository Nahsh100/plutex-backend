import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
export declare class ReviewsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createReviewDto: CreateReviewDto, userId: string): Promise<{
        user: {
            name: string;
            email: string;
            id: string;
        };
        product: {
            name: string;
            id: string;
            images: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        status: import(".prisma/client").$Enums.ReviewStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        rating: number;
        productId: string;
        userId: string;
        comment: string;
    }>;
    findAll(productId?: string, status?: string, page?: number, limit?: number): Promise<{
        reviews: ({
            user: {
                name: string;
                email: string;
                id: string;
            };
            product: {
                name: string;
                id: string;
                images: import("@prisma/client/runtime/library").JsonValue;
            };
        } & {
            status: import(".prisma/client").$Enums.ReviewStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
            productId: string;
            userId: string;
            comment: string;
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
            name: string;
            email: string;
            id: string;
        };
        product: {
            name: string;
            id: string;
            images: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        status: import(".prisma/client").$Enums.ReviewStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        rating: number;
        productId: string;
        userId: string;
        comment: string;
    }>;
    update(id: string, updateReviewDto: UpdateReviewDto, userId: string): Promise<{
        user: {
            name: string;
            email: string;
            id: string;
        };
        product: {
            name: string;
            id: string;
            images: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        status: import(".prisma/client").$Enums.ReviewStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        rating: number;
        productId: string;
        userId: string;
        comment: string;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
    updateStatus(id: string, status: string): Promise<{
        user: {
            name: string;
            email: string;
            id: string;
        };
        product: {
            name: string;
            id: string;
            images: import("@prisma/client/runtime/library").JsonValue;
        };
    } & {
        status: import(".prisma/client").$Enums.ReviewStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        rating: number;
        productId: string;
        userId: string;
        comment: string;
    }>;
    getProductReviews(productId: string, page?: number, limit?: number): Promise<{
        reviews: ({
            user: {
                name: string;
                email: string;
                id: string;
            };
            product: {
                name: string;
                id: string;
                images: import("@prisma/client/runtime/library").JsonValue;
            };
        } & {
            status: import(".prisma/client").$Enums.ReviewStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
            productId: string;
            userId: string;
            comment: string;
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
                name: string;
                id: string;
                images: import("@prisma/client/runtime/library").JsonValue;
            };
        } & {
            status: import(".prisma/client").$Enums.ReviewStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
            productId: string;
            userId: string;
            comment: string;
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
