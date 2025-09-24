"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewsService = class ReviewsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createReviewDto, userId) {
        const product = await this.prisma.product.findUnique({
            where: { id: createReviewDto.productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const existingReview = await this.prisma.review.findFirst({
            where: {
                userId,
                productId: createReviewDto.productId,
            },
        });
        if (existingReview) {
            throw new common_1.ForbiddenException('You have already reviewed this product');
        }
        const hasPurchased = await this.prisma.orderItem.findFirst({
            where: {
                productId: createReviewDto.productId,
                order: {
                    userId,
                    status: 'DELIVERED',
                },
            },
        });
        const review = await this.prisma.review.create({
            data: {
                ...createReviewDto,
                userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        images: true,
                    },
                },
            },
        });
        await this.updateProductRating(createReviewDto.productId);
        return review;
    }
    async findAll(productId, status, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const where = {};
        if (productId)
            where.productId = productId;
        if (status)
            where.status = status;
        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    product: {
                        select: {
                            id: true,
                            name: true,
                            images: true,
                        },
                    },
                },
            }),
            this.prisma.review.count({ where }),
        ]);
        return {
            reviews,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const review = await this.prisma.review.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        images: true,
                    },
                },
            },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        return review;
    }
    async update(id, updateReviewDto, userId) {
        const review = await this.prisma.review.findUnique({
            where: { id },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (review.userId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own reviews');
        }
        const updatedReview = await this.prisma.review.update({
            where: { id },
            data: updateReviewDto,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        images: true,
                    },
                },
            },
        });
        if (updateReviewDto.rating !== undefined) {
            await this.updateProductRating(review.productId);
        }
        return updatedReview;
    }
    async remove(id, userId) {
        const review = await this.prisma.review.findUnique({
            where: { id },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (review.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own reviews');
        }
        await this.prisma.review.delete({
            where: { id },
        });
        await this.updateProductRating(review.productId);
        return { message: 'Review deleted successfully' };
    }
    async updateStatus(id, status) {
        const review = await this.prisma.review.findUnique({
            where: { id },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        return this.prisma.review.update({
            where: { id },
            data: { status: status },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        images: true,
                    },
                },
            },
        });
    }
    async getProductReviews(productId, page = 1, limit = 10) {
        return this.findAll(productId, 'APPROVED', page, limit);
    }
    async getUserReviews(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            images: true,
                        },
                    },
                },
            }),
            this.prisma.review.count({ where: { userId } }),
        ]);
        return {
            reviews,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async updateProductRating(productId) {
        const reviews = await this.prisma.review.findMany({
            where: {
                productId,
                status: 'APPROVED',
            },
            select: {
                rating: true,
            },
        });
        if (reviews.length === 0) {
            await this.prisma.product.update({
                where: { id: productId },
                data: {
                    rating: 0,
                    reviewCount: 0,
                },
            });
            return;
        }
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        await this.prisma.product.update({
            where: { id: productId },
            data: {
                rating: Math.round(averageRating * 10) / 10,
                reviewCount: reviews.length,
            },
        });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map