import { ReviewsService } from '../services/reviews.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(createReviewDto: CreateReviewDto, req: any): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ReviewStatus;
        rating: number;
        userId: string;
        comment: string;
        productId: string;
    }>;
    findAll(productId?: string, status?: string, page?: string, limit?: string): Promise<{
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
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ReviewStatus;
            rating: number;
            userId: string;
            comment: string;
            productId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getProductReviews(productId: string, page?: string, limit?: string): Promise<{
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
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ReviewStatus;
            rating: number;
            userId: string;
            comment: string;
            productId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getMyReviews(req: any, page?: string, limit?: string): Promise<{
        reviews: ({
            product: {
                id: string;
                name: string;
                images: import("@prisma/client/runtime/library").JsonValue;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ReviewStatus;
            rating: number;
            userId: string;
            comment: string;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ReviewStatus;
        rating: number;
        userId: string;
        comment: string;
        productId: string;
    }>;
    update(id: string, updateReviewDto: UpdateReviewDto, req: any): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ReviewStatus;
        rating: number;
        userId: string;
        comment: string;
        productId: string;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    updateStatus(id: string, status: string, req: any): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ReviewStatus;
        rating: number;
        userId: string;
        comment: string;
        productId: string;
    }>;
}
