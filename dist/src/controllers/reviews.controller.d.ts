import { ReviewsService } from '../services/reviews.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(createReviewDto: CreateReviewDto, req: any): Promise<{
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
    findAll(productId?: string, status?: string, page?: string, limit?: string): Promise<{
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
    getProductReviews(productId: string, page?: string, limit?: string): Promise<{
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
    getMyReviews(req: any, page?: string, limit?: string): Promise<{
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
    update(id: string, updateReviewDto: UpdateReviewDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    updateStatus(id: string, status: string, req: any): Promise<{
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
}
